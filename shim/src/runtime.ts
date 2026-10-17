// Shared handler/contract resolution for the funcd Node shims (single-tenant shim.ts and the
// pooled pool.ts, ADR-0037/0058/0044). No HTTP, no run-guard — the materialization shape-gate and
// the stray-fault containment both hosts install.
import { inspect } from 'node:util';

import { HTTP_HANDLER, type Handler, type HttpHandler, type Validator } from './types.ts';

/** How funcd calls a Function (FUNCD_PROTOCOL, funcd ADR-0243): with a CloudEvent, or with each HTTP request. */
export type Protocol = 'cloudevent' | 'http';

/** protocolFrom reads FUNCD_PROTOCOL: unset or "cloudevent" is an event Function, "http" one that serves HTTP. Any
 *  other value throws. */
export function protocolFrom(env: NodeJS.ProcessEnv): Protocol {
  const value = env.FUNCD_PROTOCOL ?? '';
  if (value === '' || value === 'cloudevent') return 'cloudevent';
  if (value === 'http') return 'http';
  throw new Error(`FUNCD_PROTOCOL "${value}" is neither cloudevent nor http`);
}

/** isHttpHandler reports whether an export is an http(app) handler. */
export function isHttpHandler(value: unknown): value is HttpHandler {
  return typeof value === 'function' && (value as { [HTTP_HANDLER]?: unknown })[HTTP_HANDLER] === true;
}

/** exportOf picks the handler export: `<name>`, `default.<name>`, or `default`. A non-function (missing handler)
 *  throws — the materialization shape-gate (ADR-0030). */
function exportOf(mod: Record<string, unknown>, name: string): unknown {
  const candidate = mod?.[name] ?? (mod?.default as Record<string, unknown> | undefined)?.[name] ?? mod?.default;
  if (typeof candidate !== 'function') {
    throw new Error(`export "${name}" is not a function`);
  }
  return candidate;
}

/** resolveHandler picks an event Function's handler; an http(app) export throws, since only a Function with
 *  spec.protocol: http may export one (funcd ADR-0243). */
export function resolveHandler(mod: Record<string, unknown>, name: string): Handler {
  const candidate = exportOf(mod, name);
  if (isHttpHandler(candidate)) {
    throw new Error(`export "${name}" is an http(app) handler, which needs spec.protocol: http`);
  }
  return candidate as Handler;
}

/** resolveHttpHandler picks the http(app) handler of a Function with spec.protocol: http; any other export throws. */
export function resolveHttpHandler(mod: Record<string, unknown>, name: string): HttpHandler {
  const candidate = exportOf(mod, name);
  if (!isHttpHandler(candidate)) {
    throw new Error(`export "${name}" is not an http(app) handler, which spec.protocol: http needs`);
  }
  return candidate;
}

/** resolveValidators picks the optional precompiled, eval-free validators the push build inlined
 *  into the bundle from the author's FuncInput/FuncOutput types (ADR-0058): `__funcdValidateInput`
 *  / `__funcdValidateOutput`. Absent ⇒ that side is unchecked. The shim runs them; it compiles no
 *  schema at runtime (the validator was compiled at push — no `new Function`/`eval` in the worker). */
export function resolveValidators(mod: Record<string, unknown>): { input?: Validator; output?: Validator } {
  const pick = (v: unknown): Validator | undefined => (typeof v === 'function' ? (v as Validator) : undefined);
  return { input: pick(mod?.__funcdValidateInput), output: pick(mod?.__funcdValidateOutput) };
}

/** toWire returns the handler result as the JSON value the shim sends: JSON.stringify applies toJSON,
 *  maps NaN/Infinity to null and drops undefined, functions and symbols. The output contract checks
 *  this value, so a 200 body always matches it (ADR-0058). null means no body (204). */
export function toWire(result: unknown): unknown {
  const text: string | undefined = JSON.stringify(result);
  return text === undefined ? null : JSON.parse(text);
}

/** dropBrokenPipes ignores EPIPE on stdout and stderr (ADR-0168): after a funcd restart nothing reads
 *  them, and an unhandled stream error would reach containStrayFaults, whose own stderr write fails again. */
export function dropBrokenPipes(): void {
  for (const stream of [process.stdout, process.stderr]) {
    stream.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code !== 'EPIPE') throw err;
    });
  }
}

/** exitOnSigterm makes SIGTERM end the shim when it is PID 1 in a container, where the kernel drops a signal the
 *  process does not handle: funcd's stop then waited out its grace and sent SIGKILL. It exits 143 (128 + SIGTERM),
 *  which containerd reports as that signal (funcd ADR-0160). Any other process keeps Node's default action, which ends
 *  it even while a call blocks its event loop, where a listener could not run. */
export function exitOnSigterm(): void {
  if (process.pid !== 1) return;
  process.on('SIGTERM', () => process.exit(143));
}

/** containStrayFaults logs, instead of exiting on, a rejection a handler left unhandled or a throw from
 *  one of its callbacks after it returned: concurrent calls share one event loop (the solo shim's,
 *  ADR-0030; a pool worker's, ADR-0044), so Node's default exit would cut off every one of them. Install
 *  it once serving, so a boot failure still exits. */
export function containStrayFaults(prefix: string): void {
  const log = (kind: string) => (err: unknown) => process.stderr.write(`${prefix}: ${kind}: ${inspect(err)}\n`);
  process.on('unhandledRejection', log('unhandled rejection'));
  process.on('uncaughtException', log('uncaught exception'));
}
