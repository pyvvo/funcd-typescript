// funcd Node runtime shim (TypeScript + Hono over node:http). Loads the function artifact,
// resolves the handle(context, event) export (the authoritative materialization shape-gate),
// and serves the runtime-shim HTTP contract:
//   POST /                 CloudEvent -> [optional input contract] -> handler -> [optional output contract] -> response
//                          (object->200 JSON, none/void->204, throw/output-mismatch->500, input-mismatch->422)
//   GET  /health/readiness 200 once the handler resolved and funcd passes its dependencies (ADR-0215),
//                          else 503 with funcd's dependency report
//   GET  /health/liveness  200 while up; never calls funcd
// With FUNCD_PROTOCOL=http (funcd ADR-0243) the export is an http(app) handler instead, and every request but
// /health/* reaches it as the Request the edge received (createHttpApp).
// If the bundle carries precompiled validators (ADR-0058, generated at push from the author's
// FuncInput/FuncOutput types), event.data is validated before the handler runs (mismatch -> 422)
// and the handler's result after (mismatch -> 500). The validators are eval-free (compiled at
// push); the shim runs no schema compiler. A `void`/`None` output contract -> 204 (non-empty -> 500).
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
  resolveValidators,
  toWire,
} from './runtime.ts';
import { ContractError, loadValidators } from './contract.ts';
import type { CloudEvent, FunctionContext, Handler, HttpHandler, Validator } from './types.ts';
import { appRequest, streamed } from './httpapp.ts';
import { makeFetch, makeInvoke } from './invoke.ts';
import { makeKV } from './kv.ts';
import { makeSQL } from './sql.ts';
import { makeBlob } from './blob.ts';
import { makeConfig } from './config.ts';
import { makeSecret } from './secret.ts';
import { makeCatalog } from './catalog.ts';
import { checkDependencies, dependencyCheckBudgetMs } from './dependencies.ts';
import { deadlineFrom, remainingMs } from './invcontext.ts';
import { installConsoleCapture, openChannel, recordBound, type Sink } from './funclog.ts';
import { startSpan, parseLinks } from './tracespan.ts';

export type { CloudEvent, FunctionContext, Handler, HttpHandler, Json, Validator } from './types.ts';
export { http } from './types.ts';
export { resolveHandler, resolveHttpHandler, resolveValidators } from './runtime.ts';

interface TraceOptions {
  sink?: Sink | null;
  fnName?: string;
  bound?: number;
}

interface HealthOptions {
  dependencyBudgetMs?: number;
}

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
    catalog: makeCatalog(),
    remainingMs,
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

/** createApp builds the shim's HTTP app (the runtime contract) around a handler. The optional
 *  precompiled validators (ADR-0058) gate the I/O: `input` validates event.data BEFORE the handler
 *  (mismatch -> 422, handler never called); `output` validates the result AFTER (mismatch -> 500, a
 *  bad-shaped result never goes out as 200). A `void`/`None` output contract is just an output
 *  validator that accepts only an empty result, so empty -> 204 and a non-empty return -> 500.
 *  `health.dependencyBudgetMs` bounds the readiness check; unset is funcd's DependencyCheckBudget. */
export function createApp(
  handler: Handler,
  validators: { input?: Validator; output?: Validator } = {},
  trace: TraceOptions = {},
  health: HealthOptions = {},
): Hono {
  const app = new Hono();
  const traceSink = trace.sink ?? null; // ADR-0101: per-invocation span emitter (null ⇒ context only)
  const ctx = contextFor(traceSink, trace.bound);
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
    if (validators.input) {
      // ADR-0090: absent `data` is null, so a void (`{"type":"null"}`) input contract accepts it.
      const errors = validators.input(event.data ?? null);
      if (errors.length > 0) {
        // ADR-0101: an input-mismatch short-circuits BEFORE the handler → no invocation, no span.
        return c.json({ error: 'event data does not match the input contract', details: errors }, 422);
      }
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
    );
    try {
      const result = toWire(await span.run(() => handler(ctx, event)));
      if (validators.output) {
        const errors = validators.output(result);
        if (errors.length > 0) {
          span.end('ERROR', 'handler result does not match the output contract');
          return c.json({ error: 'handler result does not match the output contract', details: errors }, 500);
        }
      }
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
  // funcd ADR-0243: an HTTP Function has no I/O contract, so a delivered one is a mismatch, not something to ignore.
  if (protocol === 'http' && process.env.FUNCD_CONTRACT_PATH) {
    process.stderr.write('funcd-shim: contract error: a Function with spec.protocol: http has no I/O contract\n');
    process.exit(3);
  }

  // ADR-0123: compile the delivered contract BEFORE importing the (untrusted) handler module — the
  // bounded eval-free reversal (the ajv.compile runs over a contract.Check-gated, digest-pinned
  // schema, ahead of any handler code). A set-but-broken FUNCD_CONTRACT_PATH fails closed (exit 3).
  let delivered: { input?: Validator; output?: Validator } | null;
  try {
    delivered = loadValidators(process.env);
  } catch (err) {
    process.stderr.write(`funcd-shim: contract error: ${err instanceof ContractError ? err.message : err}\n`);
    process.exit(3);
  }

  const fnName = process.env.FUNCD_FUNCTION ?? 'invoke';
  const appTrace = { sink: channel, fnName, bound: recordBound(process.env) };
  let app: Hono;
  try {
    const mod = (await import(pathToFileURL(artifact).href)) as Record<string, unknown>;
    // The delivered schema is authoritative when present; else fall back to the module-baked
    // validators (transition back-compat for bundles still carrying __funcdValidate*).
    app =
      protocol === 'http'
        ? createHttpApp(resolveHttpHandler(mod, handlerName), appTrace)
        : createApp(resolveHandler(mod, handlerName), delivered ?? resolveValidators(mod), appTrace);
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
