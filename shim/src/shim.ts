// funcd Node runtime shim (TypeScript + Hono over node:http). Loads the function artifact,
// resolves the handle(context, event) export (the authoritative materialization shape-gate),
// and serves the runtime-shim HTTP contract:
//   POST /                 CloudEvent -> handler -> response (object->200 JSON, none->204, throw->500)
//   GET  /health/readiness 200 once the handler resolved and funcd passes its dependencies (ADR-0215),
//                          else 503 with funcd's dependency report
//   GET  /health/liveness  200 while up; never calls funcd
// With FUNCD_PROTOCOL=http (funcd ADR-0243) the export is an http(app) handler instead, and every request but
// /health/* reaches it as the Request the edge received (createHttpApp).
// funcd checks each call's input and result against the Function's contract (funcd ADR-0303), so the shim checks
// neither.
// Env: FUNCD_ARTIFACT (local path), FUNCD_HANDLER (export, default "handle"); FUNCD_PORT
// (container: bind 0.0.0.0:PORT) else FUNCD_PORTFILE (process: bind 127.0.0.1:0 + write the port).
// Bundled (Hono inlined) to shim.mjs, so the runtime stays a single self-contained file.
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { realpathSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

import {
  containStrayFaults,
  dropBrokenPipes,
  exitOnSigterm,
  protocolFrom,
  resolveHandler,
  resolveHttpHandler,
  resolvePreview,
  toWire,
} from './runtime.ts';
import type { CloudEvent, FunctionContext, Handler, HttpHandler, JobContext, Preview, RunInfo } from './types.ts';
import { appRequest, streamed } from './httpapp.ts';
import { makeFetch, makeInvoke } from './invoke.ts';
import { makeKV } from './kv.ts';
import { makeSQL } from './sql.ts';
import { makeBlob } from './blob.ts';
import { makeConfig } from './config.ts';
import { makeSecret } from './secret.ts';
import { makeLake } from './lake.ts';
import { makeAddon } from './addon.ts';
import { type Approval, makeJob, readApproval } from './job.ts';
import { checkDependencies, dependencyCheckBudgetMs } from './dependencies.ts';
import { currentInv, deadlineFrom, remainingMs } from './invcontext.ts';
import { installConsoleCapture, openChannel, recordBound, type Sink } from './funclog.ts';
import { principalFrom } from './principal.ts';
import { startSpan, parseLinks } from './tracespan.ts';

export type { CloudEvent, FunctionContext, Handler, HttpHandler, Json } from './types.ts';
export { http } from './types.ts';
export { resolveHandler, resolveHttpHandler, resolvePreview } from './runtime.ts';

interface TraceOptions {
  sink?: Sink | null;
  fnName?: string;
  bound?: number;
}

interface HealthOptions {
  dependencyBudgetMs?: number;
}

/** A Job module's exports besides its handler: its optional preview (funcd ADR-0348). */
interface JobOptions {
  preview?: Preview;
}

/** The event type of a run's preview call (funcd ADR-0348). */
const PREVIEW_EVENT = 'funcd.job.preview';

/** contextFor builds the function context both apps hand their handler; `sink` carries the CLIENT spans of its
 *  invoke and fetch calls. */
function contextFor(sink: Sink | null, bound?: number): FunctionContext {
  return {
    log: (...args) => console.log(...args),
    invoke: makeInvoke({ sink, bound }),
    fetch: makeFetch({ sink, bound }),
    kv: makeKV(),
    blob: makeBlob(),
    sql: makeSQL(),
    config: makeConfig(),
    secret: makeSecret(),
    lake: makeLake(),
    addon: makeAddon({ sink, bound }),
    job: makeJob(),
    remainingMs,
    get principal() {
      return currentInv()?.principal;
    },
  };
}

/** jobRunFrom reads a Job worker's run from its env (funcd ADR-0347): undefined for a Function's worker. */
export function jobRunFrom(env: NodeJS.ProcessEnv): Omit<RunInfo, 'phase'> | undefined {
  const name = env.FUNCD_JOB_RUN;
  if (!name) return undefined;
  return {
    name,
    job: env.FUNCD_JOB ?? '',
    revision: env.FUNCD_JOB_REVISION ?? '',
    startedBy: env.FUNCD_JOB_STARTED_BY ?? '',
  };
}

/** withRun gives a Job's call its run, the phase from the event type, and the approval it runs under (funcd ADR-0348).
 *  The context stays the prototype, so its `principal` getter still reads the call's invocation. */
function withRun(
  ctx: FunctionContext,
  run: Omit<RunInfo, 'phase'>,
  event: CloudEvent,
  approval: Approval | null,
): JobContext {
  const phase: RunInfo['phase'] = event.type === PREVIEW_EVENT ? 'preview' : 'run';
  return Object.assign(Object.create(ctx) as FunctionContext, { run: { ...run, phase }, approval });
}

/** callFor is how a call reaches the module (funcd ADR-0347, ADR-0348): a Function's call and a Job's run call the
 *  handler, the run with the approval funcd recorded; a Job's preview call calls the module's preview, or answers the
 *  run's input when the module has none. */
function callFor(
  handler: Handler,
  ctx: FunctionContext,
  job: Omit<RunInfo, 'phase'> | undefined,
  opts: JobOptions,
): (event: CloudEvent) => Promise<unknown> {
  return async (event) => {
    if (!job) return handler(ctx, event);
    if (event.type === PREVIEW_EVENT) {
      return opts.preview ? opts.preview(withRun(ctx, job, event, null), event) : (event.data ?? null);
    }
    return handler(withRun(ctx, job, event, await readApproval()), event);
  };
}

/** addHealth serves the shim's probes: liveness never calls funcd, readiness checks funcd's dependencies (ADR-0215)
 *  within `health.dependencyBudgetMs`, unset meaning funcd's DependencyCheckBudget. */
function addHealth(app: Hono, health: HealthOptions): void {
  app.get('/health/liveness', (c) => c.text('ok'));
  app.get('/health/readiness', async (c) => {
    const report = await checkDependencies(
      undefined,
      AbortSignal.timeout(health.dependencyBudgetMs ?? dependencyCheckBudgetMs),
    );
    return report ? c.json(report, 503) : c.text('ready');
  });
}

/** createApp builds the shim's HTTP app (the runtime contract) around a handler, and a Job module's preview.
 *  `health.dependencyBudgetMs` bounds the readiness check; unset is funcd's DependencyCheckBudget. */
export function createApp(
  handler: Handler,
  trace: TraceOptions = {},
  health: HealthOptions = {},
  jobOpts: JobOptions = {},
): Hono {
  const app = new Hono();
  const traceSink = trace.sink ?? null; // ADR-0101: per-invocation span emitter (null ⇒ context only)
  const ctx = contextFor(traceSink, trace.bound);
  const call = callFor(handler, ctx, jobRunFrom(process.env), jobOpts);
  const fnName = trace.fnName ?? 'invoke';
  addHealth(app, health);

  app.post('/', async (c) => {
    const deadline = deadlineFrom(c.req.header('x-funcd-timeout-ms'));
    let event: CloudEvent;
    try {
      const text = await c.req.text();
      event = (text ? JSON.parse(text) : {}) as CloudEvent;
    } catch {
      return c.text('invalid CloudEvent JSON', 400);
    }
    if (typeof event !== 'object' || event === null || Array.isArray(event)) {
      // A valid-JSON but non-object body (null / array / scalar) is not a CloudEvent envelope. Reject
      // it cleanly — never let `event.data` throw and crash the worker.
      return c.text('request body must be a JSON object (CloudEvent envelope)', 400);
    }
    // ADR-0101: a real invocation begins → open its SERVER span (adopts traceparent or mints a root);
    // the handler runs inside the span's context so its logs correlate. ADR-0105: a workflow step is
    // dispatched with the span-id to USE (X-Funcd-Span-Id) + its fan-in links (X-Funcd-Span-Links).
    const span = startSpan(
      traceSink,
      fnName,
      c.req.header('traceparent'),
      c.req.header('x-funcd-span-id'),
      parseLinks(c.req.header('x-funcd-span-links')),
      undefined,
      trace.bound,
      deadline,
      principalFrom(c.req.raw.headers),
    );
    try {
      const result = toWire(await span.run(() => call(event)));
      span.end('OK');
      if (result === null) return c.body(null, 204);
      return c.json(result as Record<string, unknown>);
    } catch (err) {
      span.end('ERROR', String(err instanceof Error ? err.message : err));
      return c.json({ error: String(err instanceof Error ? err.message : err) }, 500);
    }
  });

  return app;
}

/** createHttpApp builds the shim's app around the http(app) handler of a Function with spec.protocol: http (funcd
 *  ADR-0243): every request but the shim's own /health/*, which shadows the app's, reaches the handler as the
 *  Request the edge received, and its Response goes back as is, its body streamed. The invocation span ends with the
 *  body. */
export function createHttpApp(handler: HttpHandler, trace: TraceOptions = {}, health: HealthOptions = {}): Hono {
  const app = new Hono();
  const traceSink = trace.sink ?? null;
  const ctx = contextFor(traceSink, trace.bound);
  const fnName = trace.fnName ?? 'invoke';
  addHealth(app, health);
  app.all('*', async (c) => {
    const span = startSpan(
      traceSink,
      fnName,
      c.req.header('traceparent'),
      c.req.header('x-funcd-span-id'),
      parseLinks(c.req.header('x-funcd-span-links')),
      undefined,
      trace.bound,
      deadlineFrom(c.req.header('x-funcd-timeout-ms')),
      principalFrom(c.req.raw.headers),
    );
    try {
      const res = await span.run(async () => handler(await appRequest(c.req.raw), ctx));
      return streamed(res, span);
    } catch (err) {
      const message = String(err instanceof Error ? err.message : err);
      span.end('ERROR', message);
      return c.json({ error: message }, 500);
    }
  });
  return app;
}

/** main loads the artifact, resolves the handler, and serves the contract. */
async function main(): Promise<void> {
  // ADR-0081 Path B + ADR-0101 traces: open the telemetry channel ONCE and share it between console
  // capture and the per-invocation span (a single channel per process — a second UDS connect would
  // double-capture). No channel env ⇒ null ⇒ both are no-ops (console stays Path A). The shim's OWN
  // operational lines go to process.stdout/stderr directly — never through the patched console.
  dropBrokenPipes();
  exitOnSigterm();
  const channel = openChannel(process.env);
  installConsoleCapture(process.env, channel);

  const artifact = process.env.FUNCD_ARTIFACT;
  const handlerName = process.env.FUNCD_HANDLER ?? 'handle';
  const fixedPort = process.env.FUNCD_PORT ? Number(process.env.FUNCD_PORT) : 0;
  const portFile = process.env.FUNCD_PORTFILE;

  if (!artifact) {
    process.stderr.write('funcd-shim: FUNCD_ARTIFACT is required\n');
    process.exit(2);
  }
  let protocol: ReturnType<typeof protocolFrom>;
  try {
    protocol = protocolFrom(process.env);
  } catch (err) {
    process.stderr.write(`funcd-shim: ${err instanceof Error ? err.message : err}\n`);
    process.exit(2);
  }

  const fnName = process.env.FUNCD_FUNCTION ?? 'invoke';
  const appTrace = { sink: channel, fnName, bound: recordBound(process.env) };
  let app: Hono;
  try {
    const mod = (await import(pathToFileURL(artifact).href)) as Record<string, unknown>;
    app =
      protocol === 'http'
        ? createHttpApp(resolveHttpHandler(mod, handlerName), appTrace)
        : createApp(resolveHandler(mod, handlerName), appTrace, {}, { preview: resolvePreview(mod) });
  } catch (err) {
    process.stderr.write(`funcd-shim: shape error: ${err instanceof Error ? err.message : err}\n`);
    process.exit(3); // materialization shape-gate failure (ADR-0030)
  }

  const hostname = fixedPort > 0 ? '0.0.0.0' : '127.0.0.1';
  serve({ fetch: app.fetch, hostname, port: fixedPort }, (info) => {
    containStrayFaults('funcd-shim');
    if (portFile) writeFileSync(portFile, String(info.port));
    process.stdout.write(`funcd-shim: listening on ${hostname}:${info.port}\n`);
  });
}

// Run main only when executed as the entrypoint (not when imported by tests).
// realpathSync resolves symlinks (e.g. macOS /var -> /private/var) so argv[1] matches
// import.meta.url, which Node reports in realpath form — otherwise the guard never fires
// when the shim is launched by absolute path from a symlinked dir (the daemon's data dir).
const entry = process.argv[1] ? pathToFileURL(realpathSync(process.argv[1])).href : '';
if (import.meta.url === entry) {
  void main();
}
