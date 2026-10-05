import { type TestContext, test } from 'node:test';
import assert from 'node:assert/strict';
import { on, once } from 'node:events';
import { createServer, type Server, type Socket } from 'node:net';
import { openSync, readFileSync, closeSync } from 'node:fs';
import { join } from 'node:path';

import { installConsoleCapture } from '../src/funclog.ts';
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
