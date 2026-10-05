// funcd pooled Node runtime shim (ADR-0044): a multi-tenant host that runs many handlers of ONE
// namespace in one Node process — amortizing the runtime baseline — each handler in its own
// worker_threads.Worker (a separate V8 isolate: own heap + event loop + crash isolation) with a
// per-handler memory quota (resourceLimits). It routes POST /function/<name> to the right worker.
//
// Trust: worker_threads share the process address space → a FAULT/RESOURCE boundary, not a
// SECURITY one. A pool hosts a single namespace only (the blueprint's tenancy boundary); the
// resource group is the placement grouping within it. This shim trusts its single-namespace
// manifest — boundary enforcement is the placement follow-up ADR's job.
//
// The host listens at once and loads each member on its own: a member that cannot load is `failed`
// (calls get 503) while its siblings serve; GET /health/members reports each member's state.
//
// Bundled (Hono inlined) to pool.mjs. Env: FUNCD_POOL_MANIFEST (JSON [{name,artifact,handler?,
// contract?,env?}]), FUNCD_PORT | FUNCD_PORTFILE, FUNCD_POOL_MAX_OLD_MB (64), FUNCD_POOL_MAX_YOUNG_MB
// (16), FUNCD_POOL_LOAD_TIMEOUT_MS (60000).
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isMainThread, parentPort, Worker, workerData } from 'node:worker_threads';

import { containStrayFaults, dropBrokenPipes, resolveHandler, resolveValidators, toWire } from './runtime.ts';
import { ContractError, loadFromPath } from './contract.ts';
import type { CloudEvent, FunctionContext, Handler, Validator } from './types.ts';
import { makeInvoke } from './invoke.ts';
import { makeKV } from './kv.ts';
import { makeBlob } from './blob.ts';
import {
  type ChannelLock,
  installConsoleCapture,
  newChannelLock,
  openChannel,
  recordBound,
  releaseChannelLock,
} from './funclog.ts';
import { startSpan, parseLinks } from './tracespan.ts';

// --- the wire between host and worker ---
interface WorkerSpec {
  name: string;
  artifact: string; // absolute local path, resolved like the single shim's FUNCD_ARTIFACT
  handler?: string; // export name, default "handle"
  contract?: string; // ADR-0123: delivered contract-blob path; the worker compiles its validator from it
  env?: Record<string, string>; // this member's own env, over the process env; no sibling sees it
}
interface WorkerInit extends WorkerSpec {
  channelLock: ChannelLock; // one per pool: every worker writes the same FUNCD_LOG_FD
}
interface Req {
  id: number;
  event: CloudEvent;
  traceparent?: string; // ADR-0101: the host forwards the incoming W3C header so the worker's span adopts it
  spanId?: string; // ADR-0105: the engine-provided span-id the worker's span uses (X-Funcd-Span-Id)
  links?: string[]; // ADR-0105: fan-in edges (X-Funcd-Span-Links)
}
interface Res {
  id: number;
  result?: unknown;
  none?: boolean; // handler returned undefined/null → 204
  status?: number; // 422 (contract) | 500 (throw)
  error?: string;
  details?: unknown;
}

const maxOldMB = Number(process.env.FUNCD_POOL_MAX_OLD_MB ?? 64);
const maxYoungMB = Number(process.env.FUNCD_POOL_MAX_YOUNG_MB ?? 16);
const requestTimeoutMs = 30_000; // without a valid x-funcd-timeout-ms header (unchanged)
// The platform's own deadline answers first; the pool's timer only frees an entry it gave up on.
const timeoutMarginMs = 1_000;
// setTimeout's largest delay (2^31 - 1 ms) less the margin.
const maxHeaderTimeoutMs = 2_147_482_647;
const restartBaseMs = 50;
const restartMaxMs = 10_000;
// funcd's runtime.bootTimeout default (1 m), used when FUNCD_POOL_LOAD_TIMEOUT_MS is unset or invalid.
const defaultLoadTimeoutMs = 60_000;

/** loadTimeoutMs reads FUNCD_POOL_LOAD_TIMEOUT_MS: a positive decimal integer, else the default. */
export function loadTimeoutMs(value: string | undefined): number {
  if (value === undefined || !/^[0-9]+$/.test(value)) return defaultLoadTimeoutMs;
  const ms = Number(value);
  return ms >= 1 && ms <= maxHeaderTimeoutMs ? ms : defaultLoadTimeoutMs;
}

/** header + timeoutMarginMs when a decimal integer in 1..2_147_482_647, else requestTimeoutMs (funcd ADR-0151). */
export function callTimeoutMs(header: string | undefined): number {
  if (header === undefined || !/^[0-9]+$/.test(header)) return requestTimeoutMs;
  const ms = Number(header);
  if (ms < 1 || ms > maxHeaderTimeoutMs) return requestTimeoutMs;
  return ms + timeoutMarginMs;
}

// =====================================================================================
// Worker side: load one artifact, validate + run its handler on each request message.
// =====================================================================================
async function workerMain(): Promise<void> {
  const spec = workerData as WorkerInit;
  const port = parentPort;
  if (!port) return;

  // ADR-0081 Path B + ADR-0101 traces: open the worker's telemetry channel ONCE and share it between
  // console capture and the per-invocation span (a single channel per worker). No channel env ⇒ null
  // ⇒ both no-op. The pool's OWN operational lines go to process.stderr, never the patched console.
  const channel = openChannel(process.env, spec.channelLock);
  installConsoleCapture(process.env, channel, spec.name);

  // A member that cannot load tells the host why, then exits; the host marks it failed and keeps
  // serving its siblings.
  const failLoad = (kind: string, err: unknown): never => {
    const error = `${kind}: ${err instanceof Error ? err.message : err}`;
    process.stderr.write(`funcd-pool[${spec.name}]: ${error}\n`);
    port.postMessage({ failed: error });
    process.exit(3);
  };

  // ADR-0123: compile the delivered contract AHEAD of the handler import (the m3 reorder). A
  // set-but-broken contract path fails the member closed.
  let delivered: { input?: Validator; output?: Validator } | null = null;
  try {
    delivered = spec.contract ? loadFromPath(spec.contract) : null;
  } catch (err) {
    failLoad('contract error', err instanceof ContractError ? err.message : err);
  }

  let handler!: Handler;
  let validators!: { input?: Validator; output?: Validator };
  try {
    const mod = (await import(pathToFileURL(spec.artifact).href)) as Record<string, unknown>;
    handler = resolveHandler(mod, spec.handler ?? 'handle');
    validators = delivered ?? resolveValidators(mod);
  } catch (err) {
    failLoad('shape error', err);
  }
  const ctx: FunctionContext = {
    log: (...args) => console.log(`[${spec.name}]`, ...args),
    invoke: makeInvoke({ member: spec.name, sink: channel, bound: recordBound(process.env) }),
    kv: makeKV(spec.name),
    blob: makeBlob(spec.name),
  };

  port.on('message', (req: Req) => {
    void (async () => {
      const event = req.event ?? ({} as CloudEvent);
      if (validators.input) {
        // ADR-0090: absent `data` is null, so a void (`{"type":"null"}`) input contract accepts it.
        const errors = validators.input(event.data ?? null);
        if (errors.length > 0) {
          // ADR-0101: input-mismatch short-circuits before the handler → no invocation, no span.
          port.postMessage({
            id: req.id,
            status: 422,
            error: 'event data does not match the input contract',
            details: errors,
          });
          return;
        }
      }
      // ADR-0101: a real invocation → its SERVER span (adopts req.traceparent or mints a root),
      // emitted on the worker's channel; the handler runs inside the span's context so logs correlate.
      const span = startSpan(
        channel,
        spec.name,
        req.traceparent,
        req.spanId,
        req.links ?? [],
        spec.name,
        recordBound(process.env),
      );
      try {
        const result = toWire(await span.run(() => handler(ctx, event)));
        if (validators.output) {
          const errors = validators.output(result);
          if (errors.length > 0) {
            span.end('ERROR', 'handler result does not match the output contract');
            port.postMessage({
              id: req.id,
              status: 500,
              error: 'handler result does not match the output contract',
              details: errors,
            });
            return;
          }
        }
        span.end('OK');
        if (result === null) {
          port.postMessage({ id: req.id, none: true });
        } else {
          port.postMessage({ id: req.id, result });
        }
      } catch (err) {
        span.end('ERROR', String(err instanceof Error ? err.message : err));
        port.postMessage({ id: req.id, status: 500, error: String(err instanceof Error ? err.message : err) });
      }
    })();
  });
  containStrayFaults(`funcd-pool[${spec.name}]`);
  port.postMessage({ ready: true });
}

// =====================================================================================
// Host side: one managed worker per handler, with restart-on-fault + request correlation.
// =====================================================================================
interface Pending {
  resolve: (r: Res) => void;
  timer: ReturnType<typeof setTimeout>;
}

/** A member's state on GET /health/members: `failed` is a first load that failed or timed out in this
 *  process (not retried here); `restarting` is a member that faulted after it loaded and is being
 *  restarted with backoff (a restart that cannot load is another fault, never `failed`). */
export type MemberState = 'loading' | 'ready' | 'restarting' | 'failed';

export interface MemberStatus {
  name: string;
  state: MemberState;
  error?: string;
}

const exitedBeforeLoad = 'the worker exited before it loaded';

class PooledHandler {
  private worker!: Worker;
  private readonly pending = new Map<number, Pending>();
  private nextID = 0;
  state: MemberState = 'loading';
  error?: string;
  /** Resolves once the first load settles: the member is ready or failed. */
  readonly settled: Promise<void>;
  private settle!: () => void;
  private booted = false;
  private closed = false;
  private restarts = 0; // restarts since a worker last booted
  private restartTimer?: ReturnType<typeof setTimeout>;
  private loadTimer?: ReturnType<typeof setTimeout>;
  private readonly spec: WorkerSpec;
  private readonly entry: string;
  private readonly limits: { maxOld: number; maxYoung: number; loadTimeout: number };
  private readonly channelLock: ChannelLock;

  constructor(
    spec: WorkerSpec,
    entry: string,
    limits: { maxOld: number; maxYoung: number; loadTimeout: number },
    channelLock: ChannelLock,
  ) {
    this.spec = spec;
    this.channelLock = channelLock;
    this.entry = entry;
    this.limits = limits;
    this.settled = new Promise<void>((res) => {
      this.settle = res;
    });
    this.spawn();
  }

  get healthy(): boolean {
    return this.state === 'ready';
  }

  private spawn(): void {
    const worker = new Worker(this.entry, {
      workerData: { ...this.spec, channelLock: this.channelLock } satisfies WorkerInit,
      env: { ...process.env, ...this.spec.env },
      resourceLimits: { maxOldGenerationSizeMb: this.limits.maxOld, maxYoungGenerationSizeMb: this.limits.maxYoung },
    });
    this.worker = worker;
    const threadId = worker.threadId;
    // A load past the bound: a first load fails the member; a restart's is one more fault.
    this.loadTimer = setTimeout(() => {
      if (this.closed) return;
      if (!this.booted) this.failLoad('load timed out');
      void worker.terminate();
    }, this.limits.loadTimeout);
    worker.on('message', (msg: Res & { ready?: boolean; failed?: string }) => {
      if (msg.ready) {
        clearTimeout(this.loadTimer);
        this.booted = true;
        this.restarts = 0;
        this.state = 'ready';
        this.error = undefined;
        this.settle();
        return;
      }
      if (msg.failed !== undefined) {
        if (!this.booted && (this.state === 'loading' || this.error === exitedBeforeLoad)) this.failLoad(msg.failed);
        return;
      }
      const p = this.pending.get(msg.id);
      if (p) {
        clearTimeout(p.timer);
        this.pending.delete(msg.id);
        p.resolve(msg);
      }
    });
    // A worker that dies of an uncaught error or a resourceLimits OOM emits both 'error' and 'exit':
    // fault it once, or it is restarted twice and the first replacement is orphaned.
    let faulted = false;
    const fault = () => {
      if (faulted) return;
      faulted = true;
      this.fault();
    };
    worker.on('error', fault);
    worker.on('exit', () => {
      releaseChannelLock(this.channelLock, threadId);
      fault();
    });
  }

  private failLoad(error: string): void {
    this.state = 'failed';
    this.error = error;
    this.settle();
  }

  // fault handles a worker error/exit (incl. a resourceLimits OOM): fail in-flight requests with
  // 503, then — before the first load → the member is failed (no exit, no retry in this process);
  // after it → restart the worker with backoff so siblings and the process are untouched.
  private fault(): void {
    clearTimeout(this.loadTimer);
    if (this.closed) return;
    if (!this.booted) {
      if (this.state === 'loading') this.failLoad(exitedBeforeLoad);
    } else {
      this.state = 'restarting';
    }
    for (const [, p] of this.pending) {
      clearTimeout(p.timer);
      p.resolve({ id: -1, status: 503, error: `function ${this.spec.name} worker faulted` });
    }
    this.pending.clear();
    if (!this.booted) return;
    // A restart that faults before it boots (its handler no longer loads) doubles the next delay, so a
    // handler that cannot load is not re-imported every 50 ms.
    const delay = Math.min(restartBaseMs * 2 ** this.restarts, restartMaxMs);
    this.restarts++;
    this.restartTimer = setTimeout(() => {
      if (!this.closed) this.spawn();
    }, delay);
  }

  status(): MemberStatus {
    return this.error === undefined
      ? { name: this.spec.name, state: this.state }
      : { name: this.spec.name, state: this.state, error: this.error };
  }

  async invoke(
    event: CloudEvent,
    timeoutMs: number,
    traceparent?: string,
    spanId?: string,
    links?: string[],
  ): Promise<Res> {
    if (!this.healthy) return { id: -1, status: 503, error: `function ${this.spec.name} unavailable` };
    const id = this.nextID++;
    return new Promise<Res>((resolve) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        resolve({ id, status: 503, error: `function ${this.spec.name} timed out` });
      }, timeoutMs);
      this.pending.set(id, { resolve, timer });
      this.worker.postMessage({ id, event, traceparent, spanId, links } satisfies Req);
    });
  }

  async close(): Promise<void> {
    this.closed = true;
    clearTimeout(this.restartTimer);
    clearTimeout(this.loadTimer);
    await this.worker.terminate();
  }
}

export interface Pool {
  app: Hono;
  /** Resolves once no member is loading: each one is ready or failed. It never rejects. */
  ready: Promise<void>;
  members: () => MemberStatus[];
  close: () => Promise<void>;
}

/** createPool spawns one worker per manifest entry and returns the routing host, which serves at
 *  once; a member answers 503 until it is ready. */
export function createPool(
  manifest: WorkerSpec[],
  limits?: { maxOldMB?: number; maxYoungMB?: number; loadTimeoutMs?: number },
): Pool {
  const entry = fileURLToPath(import.meta.url); // spawn this same file as the worker (isMainThread=false)
  const resolved = {
    maxOld: limits?.maxOldMB ?? maxOldMB,
    maxYoung: limits?.maxYoungMB ?? maxYoungMB,
    loadTimeout: limits?.loadTimeoutMs ?? loadTimeoutMs(process.env.FUNCD_POOL_LOAD_TIMEOUT_MS),
  };
  const handlers = new Map<string, PooledHandler>();
  const channelLock = newChannelLock();
  for (const spec of manifest) {
    handlers.set(spec.name, new PooledHandler(spec, entry, resolved, channelLock));
  }
  const members = () => [...handlers.values()].map((h) => h.status());

  const app = new Hono();
  app.get('/health/liveness', (c) => c.text('ok'));
  app.get('/health/readiness', (c) => {
    for (const h of handlers.values()) {
      if (h.state === 'loading') return c.text('not ready', 503);
    }
    return c.text('ready');
  });
  app.get('/health/members', (c) => c.json(members()));
  app.post('/function/:name', async (c) => {
    const h = handlers.get(c.req.param('name'));
    if (!h) return c.json({ error: `unknown function ${c.req.param('name')}` }, 404);
    let event: CloudEvent;
    try {
      const text = await c.req.text();
      event = (text ? JSON.parse(text) : {}) as CloudEvent;
    } catch {
      return c.text('invalid CloudEvent JSON', 400);
    }
    if (typeof event !== 'object' || event === null || Array.isArray(event)) {
      // A valid-JSON but non-object body (null / array / scalar) is not a CloudEvent envelope. Reject
      // it cleanly — never forward it to a worker where `event.data` would throw and crash it.
      return c.text('request body must be a JSON object (CloudEvent envelope)', 400);
    }
    // ADR-0101/0105: forward the trace + span-id + fan-in links headers to the worker.
    const res = await h.invoke(
      event,
      callTimeoutMs(c.req.header('x-funcd-timeout-ms')),
      c.req.header('traceparent'),
      c.req.header('x-funcd-span-id'),
      parseLinks(c.req.header('x-funcd-span-links')),
    );
    if (res.status === 422) return c.json({ error: res.error, details: res.details }, 422);
    if (res.status === 503) return c.json({ error: res.error }, 503);
    if (res.status === 500) return c.json({ error: res.error, details: res.details }, 500);
    if (res.none) return c.body(null, 204);
    return c.json(res.result as Record<string, unknown>);
  });

  return {
    app,
    ready: Promise.all([...handlers.values()].map((h) => h.settled)).then(() => undefined),
    members,
    close: async () => {
      await Promise.all([...handlers.values()].map((h) => h.close()));
    },
  };
}

/** main loads the manifest, spawns the pool, and serves at once; members load in the background. */
async function main(): Promise<void> {
  dropBrokenPipes();
  const manifestPath = process.env.FUNCD_POOL_MANIFEST;
  if (!manifestPath) {
    process.stderr.write('funcd-pool: FUNCD_POOL_MANIFEST is required\n');
    process.exit(2);
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as WorkerSpec[];
  const pool = createPool(manifest);
  const fixedPort = process.env.FUNCD_PORT ? Number(process.env.FUNCD_PORT) : 0;
  const portFile = process.env.FUNCD_PORTFILE;
  const hostname = fixedPort > 0 ? '0.0.0.0' : '127.0.0.1';
  serve({ fetch: pool.app.fetch, hostname, port: fixedPort }, (info) => {
    if (portFile) writeFileSync(portFile, String(info.port));
    process.stdout.write(`funcd-pool: ${manifest.length} handler(s) listening on ${hostname}:${info.port}\n`);
  });
}

if (isMainThread) {
  // run main only when this file IS the process entrypoint (not when imported by tests); the
  // realpath compare handles symlinked dirs (macOS /var → /private/var), like shim.ts. Workers
  // (isMainThread=false) always run the worker side.
  const entryPath = process.argv[1] ? pathToFileURL(realpathSync(process.argv[1])).href : '';
  if (import.meta.url === entryPath) void main();
} else {
  void workerMain();
}
