import { type TestContext, test } from 'node:test';
import assert from 'node:assert/strict';
import { on, once } from 'node:events';
import { createServer, type Server, type Socket } from 'node:net';
import { openSync, readFileSync, closeSync } from 'node:fs';
import { join } from 'node:path';

import { DEFAULT_MAX_RECORD_BYTES, installConsoleCapture, recordBound } from '../src/funclog.ts';
import { tempDir } from './tempdir.ts';

// snapshotConsole restores the five patched methods after installConsoleCapture() mutates the global,
// keeping the tests isolated.
function snapshotConsole(): () => void {
  const saved = {
    debug: console.debug,
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };
  return () => Object.assign(console, saved);
}

// parseLines splits an NDJSON buffer into decoded records (trailing newline tolerated).
function parseLines(buf: string): Record<string, unknown>[] {
  return buf
    .split('\n')
    .filter((l) => l.length > 0)
    .map((l) => JSON.parse(l) as Record<string, unknown>);
}

// logServer listens on a UDS standing in for the host Reader and stops when the test ends, dropping the
// live connections first, since server.close() waits for them. A delayMs reader holds each connection's
// data back that long, like a Reader on a loaded host.
async function logServer(t: TestContext, sockPath: string, delayMs = 0): Promise<Server> {
  const conns: Socket[] = [];
  const server = createServer({ pauseOnConnect: delayMs > 0 }, (conn) => {
    conns.push(conn);
    if (delayMs > 0) setTimeout(() => conn.resume(), delayMs);
  });
  await new Promise<void>((resolve) => server.listen(sockPath, resolve));
  t.after(async () => {
    for (const c of conns) c.destroy();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });
  return server;
}

// readLines returns what the server's next connection sends, up to its nth newline. The shim connects
// and writes asynchronously, so the test waits for the data, not for a fixed time, and fails after 10 s.
// The server accepts on a later event-loop turn, so a call right after the shim connects is in time.
async function readLines(server: Server, n: number): Promise<string> {
  const signal = AbortSignal.timeout(10_000);
  const [conn] = (await once(server, 'connection', { signal })) as [Socket];
  let received = '';
  for await (const [chunk] of on(conn, 'data', { signal })) {
    received += (chunk as Buffer).toString('utf8');
    if (received.split('\n').length > n) break;
  }
  return received;
}

// scenario: console-no-double-capture (FUNCD_LOG_SOCK / UDS transport) — the patched console writes
// each call as ONE NDJSON line to the side channel, channel-only. We prove "no double-capture" by
// installing sentinel spies as the ORIGINAL console methods BEFORE patching: the patched wrappers
// write channel-only and never delegate, so the originals must stay untouched (zero stdout echo).
test('console-no-double-capture over FUNCD_LOG_SOCK: two NDJSON lines, body/sev/attrs correct, no original-console delegation', async (t) => {
  const sockPath = join(tempDir(t, 'funcd-funclog-'), 'log.sock');
  const server = await logServer(t, sockPath);

  const restoreConsole = snapshotConsole();
  // sentinels standing in for the real stdout/stderr writers: if the patched console delegated to the
  // original method (a double-capture), these would fire. They must NOT.
  let originalCalls = 0;
  console.log = () => {
    originalCalls++;
  };
  console.error = () => {
    originalCalls++;
  };

  try {
    const installed = installConsoleCapture({ FUNCD_LOG_SOCK: sockPath } as NodeJS.ProcessEnv);
    assert.equal(installed, true, 'capture installs when FUNCD_LOG_SOCK is set');

    console.log('user', { id: 7 });
    console.error('boom');
  } finally {
    restoreConsole();
  }
  const received = await readLines(server, 2);

  // CRUCIAL: the patched console never called the original method → no Path A double-capture.
  assert.equal(originalCalls, 0, 'patched console writes channel-only — never delegates to stdout/stderr');

  const records = parseLines(received);
  assert.equal(records.length, 2, 'exactly two NDJSON lines, one per console call');

  const [first, second] = records;

  // console.log("user", {id:7}) → body "user", sev INFO, args lossless, object keys merged.
  assert.equal(first.body, 'user');
  assert.equal(first.sev, 'INFO');
  assert.equal(first['funcd.source'], 'console');
  const firstAttrs = first.attrs as Record<string, string>;
  assert.match(firstAttrs.args, /"id":7/, 'attrs.args preserves the object losslessly');
  assert.equal(firstAttrs.id, '7', 'plain-object arg keys merged to top level as strings');
  assert.equal(first.inv, '');
  assert.equal(first.trace_id, '');
  assert.equal(first.span_id, '');
  assert.equal(typeof first.ts, 'number');

  // console.error("boom") → body "boom", sev ERROR.
  assert.equal(second.body, 'boom');
  assert.equal(second.sev, 'ERROR');
});

test('issue r30: both FUNCD_LOG_SOCK records are read when they arrive after 300 ms', async (t) => {
  const sockPath = join(tempDir(t, 'funcd-funclog-issue-r30-'), 'log.sock');
  const server = await logServer(t, sockPath, 300);

  const restoreConsole = snapshotConsole();
  try {
    installConsoleCapture({ FUNCD_LOG_SOCK: sockPath } as NodeJS.ProcessEnv);
    console.log('user');
    console.error('boom');
  } finally {
    restoreConsole();
  }

  assert.deepEqual(
    parseLines(await readLines(server, 2)).map((r) => r.body),
    ['user', 'boom'],
  );
});

// scenario: FUNCD_LOG_FD transport — the SYNCHRONOUS fd write path lands NDJSON on the given fd.
test('FUNCD_LOG_FD: synchronous write lands NDJSON on the fd, debug→DEBUG / warn→WARN', (t) => {
  const dir = tempDir(t, 'funcd-funclog-fd-');
  const file = join(dir, 'channel.ndjson');
  const fd = openSync(file, 'w'); // a regular file fd is a fine stand-in for the pipe fd 3

  const restoreConsole = snapshotConsole();
  try {
    const installed = installConsoleCapture({ FUNCD_LOG_FD: String(fd) } as NodeJS.ProcessEnv);
    assert.equal(installed, true);
    console.debug('dbg', { phase: 'init' });
    console.warn('careful');
  } finally {
    restoreConsole();
    closeSync(fd);
  }

  const records = parseLines(readFileSync(file, 'utf8'));
  assert.equal(records.length, 2);
  assert.equal(records[0].body, 'dbg');
  assert.equal(records[0].sev, 'DEBUG');
  assert.equal((records[0].attrs as Record<string, string>).phase, 'init');
  assert.equal(records[1].body, 'careful');
  assert.equal(records[1].sev, 'WARN');
});

test('issue 82: attrs.args keeps Error message and stack, Map entries and Set values', (t) => {
  const dir = tempDir(t, 'funcd-funclog-issue82-');
  const file = join(dir, 'channel.ndjson');
  const fd = openSync(file, 'w');

  const restoreConsole = snapshotConsole();
  try {
    installConsoleCapture({ FUNCD_LOG_FD: String(fd) } as NodeJS.ProcessEnv);
    console.error(new Error('boom-detail'));
    console.error('failed:', new Error('second-boom', { cause: new Error('root-cause') }));
    console.log('collections', new Map([['k', 'v']]), new Set([1, 2]));
  } finally {
    restoreConsole();
    closeSync(fd);
  }

  const args = parseLines(readFileSync(file, 'utf8')).map(
    (r) => JSON.parse((r.attrs as Record<string, string>).args) as unknown[],
  );
  assert.equal(args.length, 3);

  const [lone] = args[0] as Record<string, string>[];
  assert.equal(lone.name, 'Error');
  assert.equal(lone.message, 'boom-detail');
  assert.match(lone.stack, /^Error: boom-detail\n\s+at /);

  const second = args[1][1] as Record<string, Record<string, string> | string>;
  assert.equal(args[1][0], 'failed:');
  assert.equal(second.message, 'second-boom');
  assert.match(second.stack as string, /second-boom/);
  assert.equal((second.cause as Record<string, string>).message, 'root-cause');

  assert.deepEqual(args[2], ['collections', [['k', 'v']], [1, 2]]);
});

test('issue r23: attrs.args keeps a repeated object, only a real cycle becomes [Circular]', (t) => {
  const dir = tempDir(t, 'funcd-funclog-issue-r23-');
  const file = join(dir, 'channel.ndjson');
  const fd = openSync(file, 'w');
  const o = { a: 1 };
  const loop: Record<string, unknown> = { id: 'loop' };
  loop.self = loop;
  const selfMap = new Map<string, unknown>();
  selfMap.set('me', selfMap);

  const restoreConsole = snapshotConsole();
  try {
    installConsoleCapture({ FUNCD_LOG_FD: String(fd) } as NodeJS.ProcessEnv);
    console.log('x', o, o);
    console.log('shared', { left: o, right: o });
    console.log('cycle', loop, selfMap);
  } finally {
    restoreConsole();
    closeSync(fd);
  }

  const args = parseLines(readFileSync(file, 'utf8')).map(
    (r) => JSON.parse((r.attrs as Record<string, string>).args) as unknown[],
  );
  assert.deepEqual(args, [
    ['x', { a: 1 }, { a: 1 }],
    ['shared', { left: { a: 1 }, right: { a: 1 } }],
    ['cycle', { id: 'loop', self: '[Circular]' }, [['me', '[Circular]']]],
  ]);
});

test('issue r24: attrs.args keeps undefined, functions, symbols, RegExp, typed arrays and NaN readable', (t) => {
  const dir = tempDir(t, 'funcd-funclog-issue-r24-');
  const file = join(dir, 'channel.ndjson');
  const fd = openSync(file, 'w');

  const restoreConsole = snapshotConsole();
  try {
    installConsoleCapture({ FUNCD_LOG_FD: String(fd) } as NodeJS.ProcessEnv);
    console.log('x', undefined, () => 1, Symbol('s'));
    console.log('re', /ab+c/g, new Uint8Array([1, 2]), NaN, Infinity);
    console.log('obj', { u: undefined, f: function named() {}, s: Symbol('t') });
    console.error(new Error('no-cause'));
  } finally {
    restoreConsole();
    closeSync(fd);
  }

  const args = parseLines(readFileSync(file, 'utf8')).map(
    (r) => JSON.parse((r.attrs as Record<string, string>).args) as unknown[],
  );
  assert.equal(args.length, 4);
  assert.deepEqual(args[0], ['x', 'undefined', '[Function (anonymous)]', 'Symbol(s)']);
  assert.deepEqual(args[1], ['re', '/ab+c/g', [1, 2], 'NaN', 'Infinity']);
  assert.deepEqual(args[2], ['obj', { u: 'undefined', f: '[Function: named]', s: 'Symbol(t)' }]);
  assert.equal('cause' in (args[3][0] as object), false, 'an Error without a cause gets no cause key');
});

test('issue r32: attrs.args keeps -0 and the bytes of a DataView or an ArrayBuffer', (t) => {
  const dir = tempDir(t, 'funcd-funclog-issue-r32-');
  const file = join(dir, 'channel.ndjson');
  const fd = openSync(file, 'w');
  const buf = new Uint8Array([1, 2, 3, 4]).buffer;
  const detached = new ArrayBuffer(2);
  structuredClone(detached, { transfer: [detached] });

  const restoreConsole = snapshotConsole();
  try {
    installConsoleCapture({ FUNCD_LOG_FD: String(fd) } as NodeJS.ProcessEnv);
    console.log('negzero', -0, new DataView(new ArrayBuffer(2)), new ArrayBuffer(2));
    console.log('bytes', new DataView(buf, 1, 2), buf, new SharedArrayBuffer(1), { z: -0 }, detached);
  } finally {
    restoreConsole();
    closeSync(fd);
  }

  const args = parseLines(readFileSync(file, 'utf8')).map(
    (r) => JSON.parse((r.attrs as Record<string, string>).args) as unknown[],
  );
  assert.deepEqual(args, [
    ['negzero', '-0', [0, 0], [0, 0]],
    ['bytes', [2, 3], [1, 2, 3, 4], [0], { z: '-0' }, []],
  ]);
});

// scenario: no channel env → no capture (console stays as-is, → Path A / stdout).
test('no channel env → installConsoleCapture is a no-op (returns false, console untouched)', () => {
  const before = console.log;
  const installed = installConsoleCapture({} as NodeJS.ProcessEnv);
  assert.equal(installed, false);
  assert.equal(console.log, before, 'console.log not patched when no channel env is set');
});

test('a pool member name is stamped as funcd.member; the solo capture omits it', (t) => {
  const restore = snapshotConsole();
  t.after(restore);
  const lines: string[] = [];
  installConsoleCapture({} as NodeJS.ProcessEnv, (line) => lines.push(line), 'a');
  console.log('pooled');
  installConsoleCapture({} as NodeJS.ProcessEnv, (line) => lines.push(line));
  console.log('solo');
  restore();
  const [pooled, solo] = lines.map((l) => JSON.parse(l) as Record<string, unknown>);
  assert.equal(pooled['funcd.member'], 'a');
  assert.equal(pooled.body, 'pooled');
  assert.equal('funcd.member' in solo, false);
});

// ADR-0168: one log call yields one record of at most FUNCD_FUNCLOG_MAX_RECORD_BYTES bytes.

interface WireRecord {
  sev: string;
  body: string;
  attrs: Record<string, string>;
}

// capture installs console capture over a stub sink and returns the lines it wrote, without "\n".
function capture(t: TestContext, env: NodeJS.ProcessEnv = {}): () => string[] {
  t.after(snapshotConsole());
  const lines: string[] = [];
  installConsoleCapture(env, (line) => {
    lines.push(line.slice(0, -1));
  });
  return () => lines;
}

// keptBytesOf recomputes the marker's keptBytes: body plus every attr value but the markers, in UTF-8.
function keptBytesOf(rec: WireRecord): number {
  let n = Buffer.byteLength(rec.body);
  for (const [k, v] of Object.entries(rec.attrs)) if (k !== 'truncated' && k !== 'keptBytes') n += Buffer.byteLength(v);
  return n;
}

// counted wraps an object in a Proxy that counts its property reads.
function counted<T extends object>(target: T, counter: { gets: number }): T {
  return new Proxy(target, {
    get(o, k, r) {
      counter.gets++;
      return Reflect.get(o, k, r) as unknown;
    },
  });
}

// shared builds 2^levels leaves through objects that share their children: about 3.5 MB of JSON at 16.
function shared(levels: number, counter: { gets: number }): Record<string, unknown> {
  let o: Record<string, unknown> = counted({ leaf: 'x'.repeat(40) }, counter);
  for (let i = 0; i < levels; i++) o = counted({ a: o, b: o }, counter);
  return o;
}

test('scenario record-cut-at-bound: a 3.5 MB value gives one record cut at the bound, sev and body intact', (t) => {
  const lines = capture(t);
  const counter = { gets: 0 };
  console.error('big', shared(16, counter));
  assert.equal(lines().length, 1);
  const line = lines()[0];
  assert.ok(Buffer.byteLength(line) <= DEFAULT_MAX_RECORD_BYTES, `line is ${Buffer.byteLength(line)} bytes`);
  const rec = JSON.parse(line) as WireRecord;
  assert.equal(rec.sev, 'ERROR');
  assert.equal(rec.body, 'big');
  assert.equal(rec.attrs.truncated, 'true');
  assert.equal(Number(rec.attrs.keptBytes), keptBytesOf(rec));
  assert.ok(Number(rec.attrs.keptBytes) <= DEFAULT_MAX_RECORD_BYTES);
  // A full walk reads each of the 2^17 shared objects twice; the cut stops it after a few thousand.
  assert.ok(counter.gets < 20_000, `read ${counter.gets} properties`);
});

test('scenario record-bound-reaches-shim: FUNCD_FUNCLOG_MAX_RECORD_BYTES=8192 cuts a 100 KB value at 8192', (t) => {
  const lines = capture(t, { FUNCD_FUNCLOG_MAX_RECORD_BYTES: '8192' });
  console.log('payload', { blob: 'y'.repeat(100_000) });
  const line = lines()[0];
  assert.ok(Buffer.byteLength(line) <= 8192, `line is ${Buffer.byteLength(line)} bytes`);
  assert.ok(Buffer.byteLength(line) > 8000, 'the cut keeps what fits');
  const rec = JSON.parse(line) as WireRecord;
  assert.equal(rec.attrs.truncated, 'true');
  assert.match(rec.attrs.blob, /^y+$/);
  assert.equal(rec.attrs.args, undefined, 'attrs.args is filled last and omitted once the record is cut');
});

test('recordBound: unset, zero, negative or not a number gives the default', () => {
  assert.equal(recordBound({}), 65536);
  for (const raw of ['', '0', '-5', 'abc', '1.5'])
    assert.equal(recordBound({ FUNCD_FUNCLOG_MAX_RECORD_BYTES: raw }), 65536);
  assert.equal(recordBound({ FUNCD_FUNCLOG_MAX_RECORD_BYTES: '8192' }), 8192);
});

test('a counting Proxy argument, a counting merged object and a Set subclass stop at the cut', (t) => {
  const lines = capture(t, { FUNCD_FUNCLOG_MAX_RECORD_BYTES: '4096' });
  const argReads = { gets: 0 };
  console.log(
    'arg',
    counted(
      Array.from({ length: 100_000 }, (_, i) => `v${i}`),
      argReads,
    ),
  );
  assert.ok(argReads.gets < 2_000, `read ${argReads.gets} elements`);

  const mergedReads = { gets: 0 };
  console.log(
    'merged',
    counted(Object.fromEntries(Array.from({ length: 100_000 }, (_, i) => [`k${i}`, i])), mergedReads),
  );
  assert.ok(mergedReads.gets < 2_000, `read ${mergedReads.gets} values`);

  class CountingSet extends Set<number> {
    yielded = 0;
  }
  const set = new CountingSet(Array.from({ length: 100_000 }, (_, i) => i));
  const values = Set.prototype[Symbol.iterator];
  Object.defineProperty(set, Symbol.iterator, {
    value: function* (this: CountingSet) {
      for (const x of values.call(this)) {
        this.yielded++;
        yield x;
      }
    },
  });
  console.log('set', set);
  assert.ok(set.yielded < 2_000, `iterated ${set.yielded} values`);

  for (const line of lines()) {
    assert.ok(Buffer.byteLength(line) <= 4096);
    assert.equal((JSON.parse(line) as WireRecord).attrs.truncated, 'true');
  }
});

test('typed arrays, DataViews and ArrayBuffers are read element by element, never copied whole', (t) => {
  const lines = capture(t, { FUNCD_FUNCLOG_MAX_RECORD_BYTES: '4096' });
  const from = Array.from;
  let calls = 0;
  Array.from = function (this: unknown, ...a: unknown[]) {
    calls++;
    return (from as (...x: unknown[]) => unknown[]).apply(Array, a);
  } as typeof Array.from;
  t.after(() => {
    Array.from = from;
  });
  console.log(new Uint8Array(10 << 20));
  console.log(new DataView(new ArrayBuffer(10 << 20)));
  console.log(new ArrayBuffer(10 << 20));
  Array.from = from;
  assert.equal(calls, 0);
  for (const line of lines()) {
    assert.ok(Buffer.byteLength(line) <= 4096);
    assert.match((JSON.parse(line) as WireRecord).attrs.args ?? '', /^\[\[0,0,0,/);
  }
});

test('multi-byte, astral, quote-heavy and control-character text stays within the bound', (t) => {
  const lines = capture(t, { FUNCD_FUNCLOG_MAX_RECORD_BYTES: '2048' });
  const units = ['\u20ac', '\u{1F600}', '"\\', '\u0001\n', 'a\ud800'];
  for (const unit of units) console.log(unit.repeat(3000), { k: unit.repeat(3000) }, [unit.repeat(3000)]);
  for (const unit of units) console.log('short', { k: unit.repeat(200) }, [unit.repeat(300)]);
  assert.equal(lines().length, units.length * 2);
  for (const line of lines()) {
    assert.ok(Buffer.byteLength(line) <= 2048, `line is ${Buffer.byteLength(line)} bytes`);
    const rec = JSON.parse(line) as WireRecord;
    assert.equal(rec.attrs.truncated, 'true');
    assert.equal(Number(rec.attrs.keptBytes), keptBytesOf(rec));
  }
});

test("a small Buffer and a Date keep today's text", (t) => {
  const lines = capture(t);
  const buf = Buffer.from([1, 2, 3]);
  const when = new Date(0);
  console.log('x', buf, when, { when, raw: buf });
  const rec = JSON.parse(lines()[0]) as WireRecord;
  assert.equal(rec.attrs.args, JSON.stringify(['x', buf, when, { when, raw: buf }]));
  assert.equal(rec.attrs.when, JSON.stringify(when));
  assert.equal(rec.attrs.raw, '{"type":"Buffer","data":[1,2,3]}');
  assert.equal(rec.attrs.truncated, undefined);
});

test('a 50 MiB Buffer is cut without calling Buffer#toJSON', (t) => {
  const lines = capture(t);
  const toJSON = Buffer.prototype.toJSON;
  let calls = 0;
  Buffer.prototype.toJSON = function (this: Buffer) {
    calls++;
    return toJSON.call(this);
  };
  t.after(() => {
    Buffer.prototype.toJSON = toJSON;
  });
  console.log('big buffer', Buffer.alloc(50 << 20));
  Buffer.prototype.toJSON = toJSON;
  assert.equal(calls, 0);
  const rec = JSON.parse(lines()[0]) as WireRecord;
  assert.ok(Buffer.byteLength(lines()[0]) <= DEFAULT_MAX_RECORD_BYTES);
  assert.match(rec.attrs.args, /^\["big buffer",\{"type":"Buffer","data":\[0,0,/);
  assert.equal(rec.attrs.truncated, 'true');
});

test('keptBytes counts the kept body and attr values; user keys truncated and keptBytes are skipped', (t) => {
  const lines = capture(t, { FUNCD_FUNCLOG_MAX_RECORD_BYTES: '4096' });
  console.log({ truncated: 'no', keptBytes: '1', ok: 'yes' });
  console.log('h\u00e9llo', { a: '\u00e9'.repeat(10_000), truncated: 'no' });
  const [small, cut] = lines().map((l) => JSON.parse(l) as WireRecord);
  assert.deepEqual(Object.keys(small.attrs).sort(), ['args', 'ok']);
  assert.equal((JSON.parse(small.attrs.args) as Record<string, string>[])[0].truncated, 'no');
  assert.equal(cut.body, 'h\u00e9llo');
  assert.equal(cut.attrs.truncated, 'true');
  assert.equal(Number(cut.attrs.keptBytes), keptBytesOf(cut));
});

// fdLines installs capture on a FUNCD_LOG_FD file, as the issue reproduced it, runs `log`, and returns the raw lines.
function fdLines(t: TestContext, log: () => void): string[] {
  const file = join(tempDir(t, 'funcd-funclog-issue-r31-'), 'channel.ndjson');
  const fd = openSync(file, 'w');
  const restoreConsole = snapshotConsole();
  try {
    installConsoleCapture({ FUNCD_LOG_FD: String(fd) } as NodeJS.ProcessEnv);
    log();
  } finally {
    restoreConsole();
    closeSync(fd);
  }
  return readFileSync(file, 'utf8').split('\n').slice(0, -1);
}

const HOST_MAX_LINE = 1 << 20;

test('issue r31: a record over the host 1 MiB line limit is cut at the bound and keeps body and sev', (t) => {
  const lines = fdLines(t, () => console.warn('payload', { blob: 'z'.repeat(2 * HOST_MAX_LINE) }));
  assert.equal(lines.length, 1);
  const size = Buffer.byteLength(lines[0]);
  assert.ok(size <= DEFAULT_MAX_RECORD_BYTES && size < HOST_MAX_LINE, `line is ${size} bytes`);
  const rec = JSON.parse(lines[0]) as WireRecord;
  assert.equal(rec.sev, 'WARN');
  assert.equal(rec.body, 'payload');
  assert.equal(rec.attrs.truncated, 'true');
  assert.equal(Number(rec.attrs.keptBytes), keptBytesOf(rec));
});

test('issue r31: a 23-node graph of shared children gives a bounded record after a bounded walk', (t) => {
  const reads = { gets: 0 };
  let d: Record<string, unknown> = counted({ leaf: 1 }, reads);
  for (let i = 0; i < 22; i++) d = counted({ a: d, b: d }, reads);
  const lines = fdLines(t, () => console.log('dag', d));
  assert.equal(lines.length, 1);
  const size = Buffer.byteLength(lines[0]);
  assert.ok(size <= DEFAULT_MAX_RECORD_BYTES, `line is ${size} bytes`);
  const rec = JSON.parse(lines[0]) as WireRecord;
  assert.equal(rec.sev, 'INFO');
  assert.equal(rec.body, 'dag');
  assert.equal(rec.attrs.truncated, 'true');
  // An unbounded walk reads every one of the 2^23 paths; the cut stops it after a few thousand reads.
  assert.ok(reads.gets < 20_000, `read ${reads.gets} properties`);
});
