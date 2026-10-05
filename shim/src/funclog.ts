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
  'funcd.member'?: string; // the pool member that logged it; absent in the solo shim
}

export type ConsoleMethod = 'debug' | 'log' | 'info' | 'warn' | 'error';

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

/** The default bound on one record line, without its "\n" (ADR-0168). funcd passes its
 *  funclog.maxRecordBytes as FUNCD_FUNCLOG_MAX_RECORD_BYTES; its reader drops a line over 1 MiB. */
export const DEFAULT_MAX_RECORD_BYTES = 65536;

/** recordBound reads FUNCD_FUNCLOG_MAX_RECORD_BYTES: unset or not a positive integer gives the default. */
export function recordBound(env: NodeJS.ProcessEnv): number {
  const raw = env.FUNCD_FUNCLOG_MAX_RECORD_BYTES;
  if (raw === undefined || !/^[0-9]+$/.test(raw)) return DEFAULT_MAX_RECORD_BYTES;
  const n = Number(raw);
  return Number.isSafeInteger(n) && n > 0 ? n : DEFAULT_MAX_RECORD_BYTES;
}

/** A record's byte budget: `left` is what the line may still grow by, `kept` the UTF-8 bytes of the
 *  values kept so far (before JSON escaping), `cut` is set once a value did not fit. */
export interface Budget {
  left: number;
  kept: number;
  cut: boolean;
}

// What the cut marker adds: ,"truncated":"true","keptBytes":"<at most 7 digits>" (the bound is ≤ 1 MiB).
const MARKER_RESERVE = 41;

// Merged keys that would clobber the lossless capture or the cut marker.
const RESERVED_KEYS = new Set(['args', 'truncated', 'keptBytes']);

/** fitText returns the longest prefix of `s` whose JSON-escaped UTF-8 bytes fit the budget, charges
 *  them, and marks the budget cut when `s` did not fit whole. It reads at most `left` + 1 code units
 *  and never splits a surrogate pair. */
export function fitText(b: Budget, s: string): string {
  if (b.cut) return '';
  const limit = Math.min(s.length, b.left + 1);
  let i = 0;
  let left = b.left;
  let kept = 0;
  while (i < limit) {
    const c = s.charCodeAt(i);
    let esc: number;
    let raw: number;
    let units = 1;
    if (c === 0x22 || c === 0x5c) {
      esc = 2;
      raw = 1;
    } else if (c < 0x20) {
      esc = c === 8 || c === 9 || c === 10 || c === 12 || c === 13 ? 2 : 6;
      raw = 1;
    } else if (c < 0x80) {
      esc = raw = 1;
    } else if (c < 0x800) {
      esc = raw = 2;
    } else if (c >= 0xd800 && c <= 0xdbff && i + 1 < s.length && (s.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
      esc = raw = 4;
      units = 2;
    } else if (c >= 0xd800 && c <= 0xdfff) {
      esc = 6; // JSON.stringify escapes a lone surrogate
      raw = 3;
    } else {
      esc = raw = 3;
    }
    if (esc > left) break;
    left -= esc;
    kept += raw;
    i += units;
  }
  b.left = left;
  b.kept += kept;
  if (i < s.length) {
    b.cut = true;
    return s.slice(0, i);
  }
  return s;
}

/** charge takes `n` bytes of structure (keys, quotes, commas) from the budget, or marks it cut. */
function charge(b: Budget, n: number): boolean {
  if (b.cut) return false;
  if (n > b.left) {
    b.cut = true;
    return false;
  }
  b.left -= n;
  return true;
}

/** jsonString is the JSON text of a string, built from at most what the budget can hold. */
function jsonString(b: Budget, s: string): string {
  let end = Math.min(s.length, b.left + 1);
  if (end < s.length && (s.charCodeAt(end - 1) & 0xfc00) === 0xd800) end++;
  return JSON.stringify(end < s.length ? s.slice(0, end) : s);
}

/** boundedStringify writes safeStringify's text for `value` (ADR-0081: Errors, Maps, Sets, RegExps and
 *  typed arrays keep their data, DataViews and ArrayBuffers their bytes; undefined, functions, symbols,
 *  NaN, ±Infinity and -0 their inspect form; only an object on the path from the root is "[Circular]")
 *  until the budget runs out, and reads nothing past that point (ADR-0168): object keys, Error
 *  properties, Map and Set entries and the elements of a typed array, DataView or ArrayBuffer are read
 *  one at a time. A Buffer is written as `{"type":"Buffer","data":[...]}` without calling its toJSON.
 *  Each character costs what it costs once the text is a JSON string value in the record line. */
export function boundedStringify(value: unknown, budget: Budget): string {
  const out: string[] = [];
  const { left, kept, cut } = budget;
  try {
    walk(value, '', [], budget, out);
  } catch {
    // a throwing getter or toJSON: today's fallback is the value's String() text.
    budget.left = left;
    budget.kept = kept;
    budget.cut = cut;
    let text: string;
    try {
      text = String(value);
    } catch {
      text = '[Unserializable]';
    }
    return fitText(budget, text);
  }
  return out.join('');
}

function walk(value: unknown, key: string, path: object[], b: Budget, out: string[]): void {
  if (b.cut) return;
  let v = value;
  if (typeof v === 'object' && v !== null && !Buffer.isBuffer(v)) {
    const toJSON = (v as { toJSON?: unknown }).toJSON;
    if (typeof toJSON === 'function') v = toJSON.call(v, key);
  }
  switch (typeof v) {
    case 'string':
      out.push(fitText(b, jsonString(b, v)));
      return;
    case 'number':
      out.push(fitText(b, Number.isFinite(v) && !Object.is(v, -0) ? String(v) : JSON.stringify(inspect(v))));
      return;
    case 'bigint':
      out.push(fitText(b, JSON.stringify(v.toString())));
      return;
    case 'boolean':
      out.push(fitText(b, String(v)));
      return;
    case 'undefined':
    case 'function':
    case 'symbol':
      out.push(fitText(b, JSON.stringify(inspect(v))));
      return;
  }
  if (v === null) {
    out.push(fitText(b, 'null'));
    return;
  }
  const o = v as object;
  if (path.includes(o)) {
    out.push(fitText(b, '"[Circular]"'));
    return;
  }
  if (o instanceof RegExp) {
    out.push(fitText(b, JSON.stringify(inspect(o))));
    return;
  }
  if (o instanceof Number || o instanceof Boolean || o instanceof String) {
    const p = o.valueOf();
    if (typeof p === 'string') walk(p, key, path, b, out);
    else out.push(fitText(b, typeof p === 'number' && !Number.isFinite(p) ? 'null' : String(p)));
    return;
  }
  path.push(o);
  try {
    if (Buffer.isBuffer(o)) {
      out.push(fitText(b, '{"type":"Buffer","data":'));
      elements(o.length, (i) => out.push(fitText(b, String(o[i]))), b, out);
      out.push(fitText(b, '}'));
    } else if (o instanceof DataView || o instanceof ArrayBuffer || o instanceof SharedArrayBuffer) {
      const buf = o instanceof DataView ? o.buffer : o;
      const bytes =
        buf.byteLength === 0
          ? new Uint8Array(0)
          : o instanceof DataView
            ? new Uint8Array(buf, o.byteOffset, o.byteLength)
            : new Uint8Array(buf);
      elements(bytes.length, (i) => out.push(fitText(b, String(bytes[i]))), b, out);
    } else if (ArrayBuffer.isView(o)) {
      const view = o as unknown as ArrayLike<number | bigint>;
      elements(view.length, (i) => walk(view[i], String(i), path, b, out), b, out);
    } else if (Array.isArray(o)) {
      elements(o.length, (i) => walk(o[i], String(i), path, b, out), b, out);
    } else if (o instanceof Map) {
      iterate(
        o,
        ([k, val]: [unknown, unknown]) => {
          out.push(fitText(b, '['));
          walk(k, '0', path, b, out);
          out.push(fitText(b, ','));
          walk(val, '1', path, b, out);
          out.push(fitText(b, ']'));
        },
        b,
        out,
      );
    } else if (o instanceof Set) {
      let i = 0;
      iterate(o, (x: unknown) => walk(x, String(i++), path, b, out), b, out);
    } else {
      const keys = Object.keys(o);
      if (o instanceof Error) {
        for (const k of ['name', 'message', 'stack']) if (!keys.includes(k)) keys.push(k);
        if ('cause' in o && !keys.includes('cause')) keys.push('cause');
      }
      out.push(fitText(b, '{'));
      for (let i = 0; i < keys.length && !b.cut; i++) {
        out.push(fitText(b, `${i > 0 ? ',' : ''}${JSON.stringify(keys[i])}:`));
        walk((o as Record<string, unknown>)[keys[i]], keys[i], path, b, out);
      }
      out.push(fitText(b, '}'));
    }
  } finally {
    path.pop();
  }
}

/** elements writes a JSON array of `n` elements, one `each` call per element until the budget is cut. */
function elements(n: number, each: (i: number) => void, b: Budget, out: string[]): void {
  out.push(fitText(b, '['));
  for (let i = 0; i < n && !b.cut; i++) {
    if (i > 0) out.push(fitText(b, ','));
    each(i);
  }
  out.push(fitText(b, ']'));
}

/** iterate writes a JSON array of an iterable's values, stopping the iterator at the cut. */
function iterate<T>(it: Iterable<T>, each: (x: T) => void, b: Budget, out: string[]): void {
  out.push(fitText(b, '['));
  let first = true;
  for (const x of it) {
    if (b.cut) break;
    if (!first) out.push(fitText(b, ','));
    first = false;
    each(x);
  }
  out.push(fitText(b, ']'));
}

/** isPlainObject — a plain `{}`-style object whose own string-keyed entries we merge to attrs top
 *  level for queryability (not arrays, null, Dates, Errors, etc.). */
function isPlainObject(v: unknown): v is Record<string, unknown> {
  if (typeof v !== 'object' || v === null) return false;
  const proto = Object.getPrototypeOf(v) as object | null;
  return proto === Object.prototype || proto === null;
}

/** buildLine maps a console call (method + raw args, captured BEFORE util.format) to one wire line of
 *  at most `bound` bytes (ADR-0168): body = first string arg else ""; attrs.args = the JSON text of ALL
 *  args; each plain-object arg's own keys merged to the top level (a later arg's key wins); ALL attr
 *  values are strings. The envelope and the marker reserve come first, then body, the merged keys and
 *  attrs.args; what does not fit is cut and the record carries attrs.truncated and attrs.keptBytes. */
export function buildLine(method: ConsoleMethod, args: unknown[], bound: number, member?: string): string {
  // ADR-0101: tag the record with the active invocation context (set by the trace span around the
  // handler), so logs correlate with their span. Outside an invocation (pre-handler lines) the
  // context is absent → empty ids, exactly as before (back-compat with the ADR-0081 wire).
  const inv = currentInv();
  const rec: LogRecord = {
    ts: Date.now() * 1e6,
    sev: SEVERITY[method],
    body: '',
    attrs: {},
    inv: inv?.inv ?? '',
    trace_id: inv?.traceId ?? '',
    span_id: inv?.spanId ?? '',
    'funcd.source': 'console',
  };
  if (member) rec['funcd.member'] = member;
  const b: Budget = {
    left: Math.max(0, bound - Buffer.byteLength(JSON.stringify(rec)) - MARKER_RESERVE),
    kept: 0,
    cut: false,
  };
  if (typeof args[0] === 'string') rec.body = fitText(b, args[0]);

  // args is written first, as before, and filled last.
  const attrs: Record<string, string> = { args: '' };
  let entries = 0;
  const entry = (k: string): boolean => charge(b, Buffer.byteLength(JSON.stringify(k)) + 3 + (entries++ > 0 ? 1 : 0));
  const merged = new Map<string, Record<string, unknown>>();
  for (const arg of args) {
    if (!isPlainObject(arg)) continue;
    for (const k of Object.keys(arg)) if (!RESERVED_KEYS.has(k)) merged.set(k, arg);
  }
  for (const [k, owner] of merged) {
    if (!entry(k)) break;
    const v = owner[k];
    attrs[k] = typeof v === 'string' ? fitText(b, v) : boundedStringify(v, b);
    if (b.cut) break;
  }
  if (entry('args')) attrs.args = boundedStringify(args, b);
  else delete attrs.args;
  if (b.cut) {
    attrs.truncated = 'true';
    attrs.keptBytes = String(b.kept);
  }
  rec.attrs = attrs;
  return JSON.stringify(rec);
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
 *  already opened (ADR-0101: log + trace capture share ONE channel), else it opens from env. A pool
 *  worker passes its `member` name, stamped on every record as `funcd.member`. */
export function installConsoleCapture(
  env: NodeJS.ProcessEnv = process.env,
  sink: Sink | null = openChannel(env),
  member?: string,
): boolean {
  if (!sink) return false;

  const bound = recordBound(env);
  const methods: ConsoleMethod[] = ['debug', 'log', 'info', 'warn', 'error'];
  for (const method of methods) {
    console[method] = (...args: unknown[]): void => {
      try {
        sink(buildLine(method, args, bound, member) + '\n');
      } catch {
        // capture must be best-effort: never let a logging failure break the function.
      }
    };
  }
  return true;
}
