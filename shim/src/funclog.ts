// funcd Node Path-B log capture (ADR-0081). The runtime shim is the Path-B *producer*: it patches
// the function's `console.*` so each call becomes one NDJSON record written to a side channel (fd or
// UDS), channel-only — never echoed to fd 1/2 — so Path A (raw stdout/stderr) never re-captures a
// Path B line. The host `Reader` splits the channel on `\n` and decodes each line; both languages
// (Node + Python) emit the SAME wire, so the reader is language-agnostic.
//
// Channel selection at startup (env, in order):
//   FUNCD_LOG_FD   = a numeric fd (e.g. "3")  → fs.writeSync(fd, line)  [SYNCHRONOUS — minimal crash-tail loss]
//   FUNCD_LOG_SOCK = a unix socket path        → net.connect(path), write lines to it
//   neither set                                → no capture; console stays as-is (Path A / stdout)
//
// Pure Node, built-ins only (node:fs, node:net, node:worker_threads) — no npm deps, so it bundles into shim.mjs/pool.mjs.
import { writeSync } from 'node:fs';
import { connect, type Socket } from 'node:net';
import { inspect } from 'node:util';
import { threadId } from 'node:worker_threads';

import { currentInv } from './invcontext.ts';

/** The NDJSON record shape the host Reader parses (ADR-0081, "Harness capture contract"). All
 *  attr VALUES are strings — the host decodes `attrs` as map[string]string. */
interface LogRecord {
  ts: number; // epoch nanos (Date.now() ms → ns)
  sev: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  body: string; // first arg IFF it is a string, else ""
  attrs: Record<string, string>;
  inv: string;
  trace_id: string;
  span_id: string;
  'funcd.source': 'console';
}

type ConsoleMethod = 'debug' | 'log' | 'info' | 'warn' | 'error';

const SEVERITY: Record<ConsoleMethod, LogRecord['sev']> = {
  debug: 'DEBUG',
  log: 'INFO',
  info: 'INFO',
  warn: 'WARN',
  error: 'ERROR',
};

/** A channel sink: write one already-framed line (`…\n`) to the side channel. Shared by log capture
 *  (this file) and trace capture (tracespan.ts) — both signals ride the one channel (ADR-0101). */
export type Sink = (line: string) => void;

/** safeStringify serializes an arbitrary value to JSON, tolerating circular refs and BigInt; any
 *  value that still can't be represented falls back to String(x). Used for the lossless attrs.args
 *  and for stringifying non-string attr values. Errors, Maps, Sets, RegExps and typed arrays keep
 *  their data, and DataViews and ArrayBuffers their bytes, which plain JSON.stringify would reduce to
 *  `{}` or an index-keyed object; undefined, functions, symbols, NaN, ±Infinity and -0, which it
 *  writes as null or 0 or drops, keep their inspect form.
 *  Only an object that contains itself becomes "[Circular]": a cycle is an object already on the
 *  path from the root, so a repeated reference elsewhere is serialized again. */
function safeStringify(value: unknown): string {
  // The path from the root: each holder JSON.stringify walks (the replacer's `this`) beside the
  // original object it stands for, which differ when an Error, Map or Set is replaced.
  const holders: object[] = [];
  const origins: object[] = [];
  try {
    return JSON.stringify(value, function (this: object, _k: string, v: unknown) {
      if (typeof v === 'bigint') return v.toString();
      if (v === undefined || typeof v === 'function' || typeof v === 'symbol') return inspect(v);
      if (typeof v === 'number' && (!Number.isFinite(v) || Object.is(v, -0))) return inspect(v);
      if (typeof v !== 'object' || v === null) return v;
      while (holders.length > 0 && holders[holders.length - 1] !== this) {
        holders.pop();
        origins.pop();
      }
      if (origins.includes(v)) return '[Circular]';
      let out: object = v;
      if (v instanceof Error) {
        out = { ...v, name: v.name, message: v.message, stack: v.stack };
        if ('cause' in v) (out as Record<string, unknown>).cause = v.cause;
      } else if (v instanceof Map || v instanceof Set) out = [...v];
      else if (v instanceof RegExp) return inspect(v);
      else if (v instanceof DataView || v instanceof ArrayBuffer || v instanceof SharedArrayBuffer) out = bytesOf(v);
      else if (ArrayBuffer.isView(v)) out = Array.from(v as unknown as ArrayLike<number | bigint>);
      holders.push(out);
      origins.push(v);
      return out;
    });
  } catch {
    try {
      return String(value);
    } catch {
      return '[Unserializable]';
    }
  }
}

/** bytesOf reads the bytes of a DataView or an ArrayBuffer. A detached buffer has none, and a view
 *  over it cannot be built. */
function bytesOf(v: DataView | ArrayBufferLike): number[] {
  const buf = v instanceof DataView ? v.buffer : v;
  if (buf.byteLength === 0) return [];
  return Array.from(v instanceof DataView ? new Uint8Array(buf, v.byteOffset, v.byteLength) : new Uint8Array(buf));
}

/** isPlainObject — a plain `{}`-style object whose own string-keyed entries we merge to attrs top
 *  level for queryability (not arrays, null, Dates, Errors, etc.). */
function isPlainObject(v: unknown): v is Record<string, unknown> {
  if (typeof v !== 'object' || v === null) return false;
  const proto = Object.getPrototypeOf(v) as object | null;
  return proto === Object.prototype || proto === null;
}

/** buildRecord maps a console call (method + raw args, captured BEFORE util.format) to the wire
 *  record per the contract: body = first string arg else ""; attrs.args = a lossless JSON-safe
 *  representation of ALL args; each plain-object arg's own string-valued keys merged to the top
 *  level; ALL attr values are strings. */
function buildRecord(method: ConsoleMethod, args: unknown[]): LogRecord {
  const body = typeof args[0] === 'string' ? args[0] : '';

  const attrs: Record<string, string> = { args: safeStringify(args) };
  for (const arg of args) {
    if (!isPlainObject(arg)) continue;
    for (const [k, v] of Object.entries(arg)) {
      if (k === 'args') continue; // never clobber the lossless capture
      attrs[k] = typeof v === 'string' ? v : safeStringify(v);
    }
  }

  // ADR-0101: tag the record with the active invocation context (set by the trace span around the
  // handler), so logs correlate with their span. Outside an invocation (pre-handler lines) the
  // context is absent → empty ids, exactly as before (back-compat with the ADR-0081 wire).
  const inv = currentInv();
  return {
    ts: Date.now() * 1e6,
    sev: SEVERITY[method],
    body,
    attrs,
    inv: inv?.inv ?? '',
    trace_id: inv?.traceId ?? '',
    span_id: inv?.spanId ?? '',
    'funcd.source': 'console',
  };
}

/** A lock shared by the threads that write one fd channel. The pool's workers all write the one
 *  fd 3 pipe, and a pipe write larger than PIPE_BUF is not atomic, so unserialized records splice
 *  into each other. The cell is 0 when free, else the holder's threadId + 1. */
export type ChannelLock = Int32Array;

export function newChannelLock(): ChannelLock {
  return new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
}

function acquire(lock: ChannelLock): void {
  for (;;) {
    const holder = Atomics.compareExchange(lock, 0, 0, threadId + 1);
    if (holder === 0) return;
    Atomics.wait(lock, 0, holder);
  }
}

/** releaseChannelLock frees the lock if the given thread holds it. The pool host calls it when a
 *  worker exits, since a thread terminated mid-write (a heap-limit OOM) never runs its own release. */
export function releaseChannelLock(lock: ChannelLock, holderThreadId: number = threadId): void {
  if (Atomics.compareExchange(lock, 0, holderThreadId + 1, 0) === holderThreadId + 1) Atomics.notify(lock, 0, 1);
}

/** openChannel resolves the side channel from the env contract, returning a synchronous-ish line
 *  sink (fd: truly synchronous write; UDS: net.Socket.write), or null when no channel env is set.
 *  Exported so an entrypoint opens the channel ONCE and shares it between log + trace capture.
 *  `lock` serializes the fd writes of threads sharing that fd. */
export function openChannel(env: NodeJS.ProcessEnv, lock?: ChannelLock): Sink | null {
  const fdRaw = env.FUNCD_LOG_FD;
  if (fdRaw !== undefined && fdRaw !== '') {
    const fd = Number(fdRaw);
    if (!Number.isInteger(fd) || fd < 0) return null;
    return (line) => {
      if (lock) acquire(lock);
      try {
        writeSync(fd, line);
      } catch {
        // a closed/broken channel must never crash the function — drop the line.
      } finally {
        if (lock) releaseChannelLock(lock);
      }
    };
  }

  const sockPath = env.FUNCD_LOG_SOCK;
  if (sockPath !== undefined && sockPath !== '') {
    let sock: Socket | null = connect(sockPath);
    // a connection error must never crash the function; drop the channel on failure.
    sock.on('error', () => {
      sock = null;
    });
    sock.unref(); // don't keep the process alive on the log channel alone
    return (line) => {
      try {
        sock?.write(line);
      } catch {
        /* drop */
      }
    };
  }

  return null;
}

/** installConsoleCapture patches console.debug/log/info/warn/error to emit one NDJSON record per
 *  call to the side channel — CHANNEL-ONLY (no fd 1/2 echo, so Path A never double-captures). When
 *  no channel is available it does nothing (console behaves normally → Path A). Returns true if
 *  capture was installed. The `env` arg is for testing; `sink` lets an entrypoint pass a channel it
 *  already opened (ADR-0101: log + trace capture share ONE channel), else it opens from env. */
export function installConsoleCapture(
  env: NodeJS.ProcessEnv = process.env,
  sink: Sink | null = openChannel(env),
): boolean {
  if (!sink) return false;

  const methods: ConsoleMethod[] = ['debug', 'log', 'info', 'warn', 'error'];
  for (const method of methods) {
    console[method] = (...args: unknown[]): void => {
      try {
        sink(JSON.stringify(buildRecord(method, args)) + '\n');
      } catch {
        // capture must be best-effort: never let a logging failure break the function.
      }
    };
  }
  return true;
}
