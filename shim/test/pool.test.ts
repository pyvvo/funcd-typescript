import { type TestContext, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { closeSync, constants, createReadStream, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { once } from 'node:events';
import { dirname, join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

import type { Hono } from 'hono';

import { callTimeoutMs, createPool } from '../src/pool.ts';
import { tempDir } from './tempdir.ts';

// writeHandlers writes each handler to a temp .mjs and returns the pool manifest.
function writeHandlers(t: TestContext, handlers: Record<string, string>): { name: string; artifact: string }[] {
  const dir = tempDir(t, 'funcd-pool-test-');
  return Object.entries(handlers).map(([name, code]) => {
    const artifact = join(dir, `${name}.mjs`);
    writeFileSync(artifact, code);
    return { name, artifact };
  });
}

const post = (app: Hono, name: string, data: unknown) =>
  app.request(`/function/${name}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id: '1', source: 's', type: 't', data }),
  });

// scenario: pool-routes — POST /function/<name> reaches the right handler's worker; unknown → 404.
test('routes each function to its own worker; unknown → 404', async (t) => {
  const pool = createPool(
    writeHandlers(t, {
      a: 'export function handle(_, e) { return { from: "a", data: e.data }; }',
      b: 'export function handle(_, e) { return { from: "b", data: e.data }; }',
    }),
  );
  await pool.ready;
  try {
    const ra = await post(pool.app, 'a', { x: 1 });
    assert.equal(ra.status, 200);
    assert.deepEqual(await ra.json(), { from: 'a', data: { x: 1 } });

    const rb = await post(pool.app, 'b', { y: 2 });
    assert.deepEqual(await rb.json(), { from: 'b', data: { y: 2 } });

    assert.equal((await post(pool.app, 'nope', {})).status, 404);
    assert.equal((await pool.app.request('/health/readiness', { method: 'GET' })).status, 200);
  } finally {
    await pool.close();
  }
});

// scenario: pool-isolation — a throwing handler 500s and a worker-killing handler 503s, while a
// sibling keeps serving and the pool process survives.
test('a faulting handler is isolated; siblings keep serving', async (t) => {
  const pool = createPool(
    writeHandlers(t, {
      boom: 'export function handle() { throw new Error("kaboom"); }',
      die: 'export function handle() { process.exit(1); }', // exits the worker thread, not the process
      ok: 'export function handle() { return { ok: true }; }',
    }),
  );
  await pool.ready;
  try {
    assert.equal((await post(pool.app, 'boom', {})).status, 500); // caught throw → 500, worker survives
    assert.equal((await post(pool.app, 'die', {})).status, 503); // worker exits → 503 (then restarts)

    const ok = await post(pool.app, 'ok', {}); // sibling unaffected; the pool process is alive
    assert.equal(ok.status, 200);
    assert.deepEqual(await ok.json(), { ok: true });
  } finally {
    await pool.close();
  }
});

// scenario: pool-quota — a handler exceeding its resourceLimits OOMs its worker thread (not the
// process); its request fails and a sibling keeps serving — the per-artifact memory quota holds.
test('a handler over its memory quota OOMs its thread, not the pool', async (t) => {
  const pool = createPool(
    writeHandlers(t, {
      greedy: 'export function handle() { const a = []; for (;;) a.push(new Array(1e6).fill(7)); }',
      ok: 'export function handle() { return { ok: true }; }',
    }),
    { maxOldMB: 16 }, // a tiny per-handler heap cap
  );
  await pool.ready;
  try {
    const r = await post(pool.app, 'greedy', {});
    assert.notEqual(r.status, 200, 'the greedy handler did not return a result (its thread OOMed)');

    const ok = await post(pool.app, 'ok', {});
    assert.equal(ok.status, 200, 'the sibling handler is unaffected by the OOM');
  } finally {
    await pool.close();
  }
});

// scenario: pool-contract — each pooled handler keeps its ADR-0058 input contract: the precompiled
// __funcdValidateInput (generated at push from FuncInput) rejects a mismatching event.data with 422
// before the handler runs.
test('a pooled handler enforces its embedded input validator (422 on mismatch)', async (t) => {
  const pool = createPool(
    writeHandlers(t, {
      c:
        'export const __funcdValidateInput = (d) => (d && typeof d.hello === "string" ? [] : [{ message: "hello must be a string" }]);\n' +
        'export function handle(_, e) { return { echoed: e.data }; }',
    }),
  );
  await pool.ready;
  try {
    assert.equal((await post(pool.app, 'c', { hello: 'world' })).status, 200);
    const bad = await post(pool.app, 'c', { hello: 123 });
    assert.equal(bad.status, 422);
    assert.match(((await bad.json()) as { error: string }).error, /input contract/);
  } finally {
    await pool.close();
  }
});

// The process runtime hands the whole pool one pipe as fd 3 (FUNCD_LOG_FD), so every worker writes
// to it. A pipe write larger than PIPE_BUF is not atomic: unserialized records splice into each other
// and the host Reader drops both as unreadable. A FIFO stands in for that pipe.
test('issue 81: pooled functions logging concurrently on one fd 3 pipe keep every record whole', async (t) => {
  const fifo = join(tempDir(t, 'funcd-pool-fd-'), 'channel');
  execFileSync('mkfifo', [fifo]);
  // a non-blocking reader lets the blocking write end open; the stream then reads in the threadpool.
  const probe = openSync(fifo, constants.O_RDONLY | constants.O_NONBLOCK);
  const writeFd = openSync(fifo, constants.O_WRONLY);
  const reader = createReadStream(fifo);
  await once(reader, 'open');
  closeSync(probe);
  const chunks: Buffer[] = [];
  reader.on('data', (chunk) => chunks.push(chunk as Buffer));
  const drained = once(reader, 'end');

  const lines = 400;
  const handler = (tag: string) =>
    `export function handle(_, e) { const pad = "x".repeat(8192); for (let i = 0; i < e.data.n; i++) console.log("${tag}", pad); }`;
  process.env.FUNCD_LOG_FD = String(writeFd);
  const pool = createPool(writeHandlers(t, { a: handler('a'), b: handler('b') }));
  delete process.env.FUNCD_LOG_FD;
  try {
    await pool.ready;
    const res = await Promise.all([post(pool.app, 'a', { n: lines }), post(pool.app, 'b', { n: lines })]);
    assert.deepEqual(
      res.map((r) => r.status),
      [204, 204],
    );
  } finally {
    await pool.close();
    closeSync(writeFd);
  }
  await drained;

  const bodies = { a: 0, b: 0, unreadable: 0 };
  for (const line of Buffer.concat(chunks).toString('utf8').split('\n')) {
    if (line.length === 0) continue;
    try {
      const body = (JSON.parse(line) as { body?: string }).body;
      if (body === 'a' || body === 'b') bodies[body]++;
    } catch {
      bodies.unreadable++;
    }
  }
  assert.deepEqual(bodies, { a: lines, b: lines, unreadable: 0 }, 'one whole NDJSON record per console call');
});

// ADR-0090 Decision 2: a pooled null-typed input accepts absent or null `data`; non-null data → 422.
test('issue 185: a pooled void input contract accepts absent or null data', async (t) => {
  const [spec] = writeHandlers(t, { v: 'export function handle() {}' });
  const contract = join(dirname(spec.artifact), 'contract.json');
  writeFileSync(contract, JSON.stringify({ input: { type: 'null' }, output: { type: 'null' } }));
  const pool = createPool([{ ...spec, contract }]);
  await pool.ready;
  try {
    assert.equal((await post(pool.app, 'v', undefined)).status, 204, 'absent data → 204');
    assert.equal((await post(pool.app, 'v', null)).status, 204, 'null data → 204');
    assert.equal((await post(pool.app, 'v', { x: 1 })).status, 422, 'non-null data → 422');
  } finally {
    await pool.close();
  }
});

// issue 186: a pooled handler's output contract checks the JSON the host sends, not the worker's JS
// value (NaN is sent as null; an undefined key is not sent at all).
test('issue 186: a pooled output contract checks the JSON that is sent', async (t) => {
  const [spec] = writeHandlers(t, {
    w: 'export function handle(_, e) { return e.data.nan ? { a: "x", n: NaN } : { a: "x", n: 1, extra: undefined }; }',
  });
  const contract = join(dirname(spec.artifact), 'contract.json');
  writeFileSync(
    contract,
    JSON.stringify({
      input: {},
      output: {
        type: 'object',
        properties: { a: { type: 'string' }, n: { type: 'number' } },
        required: ['a', 'n'],
        additionalProperties: false,
      },
    }),
  );
  const pool = createPool([{ ...spec, contract }]);
  await pool.ready;
  try {
    const nan = await post(pool.app, 'w', { nan: true });
    assert.equal(nan.status, 500, `NaN: sent as ${await nan.text()}`);
    const dropped = await post(pool.app, 'w', {});
    assert.equal(dropped.status, 200, 'an undefined key is not sent');
    assert.equal(await dropped.text(), '{"a":"x","n":1}');
  } finally {
    await pool.close();
  }
});

// A handler for the stray-fault test. A 'wait' call blocks until a fault call has fired its stray
// fault, so the fault is raised while a sibling call is in flight on the same worker.
const strayFaultHandler = `
let markWaiting;
let release;
const waiting = new Promise((r) => { markWaiting = r; });
const released = new Promise((r) => { release = r; });
export async function handle(_ctx, event) {
  const mode = event.data.mode;
  if (mode === 'ping') return { ok: true };
  if (mode === 'wait') {
    markWaiting();
    await released;
    return { sibling: 'served' };
  }
  await waiting;
  if (mode === 'rejection') Promise.reject(new Error('stray rejection'));
  else setTimeout(() => { throw new Error('stray throw'); });
  setTimeout(release, 50);
  return { fine: true };
}
`;

// captureStderr records this process's stderr, which every pool worker's stderr is piped into.
function captureStderr(): { text: () => string; restore: () => void } {
  const write = process.stderr.write;
  let text = '';
  process.stderr.write = ((...args: Parameters<typeof write>) => {
    text += String(args[0]);
    return write.apply(process.stderr, args);
  }) as typeof write;
  return {
    text: () => text,
    restore: () => {
      process.stderr.write = write;
    },
  };
}

for (const kind of ['rejection', 'throw']) {
  test(`issue r22: a stray ${kind} in a pooled handler does not fail other calls`, { timeout: 15_000 }, async (t) => {
    const stderr = captureStderr();
    const pool = createPool(writeHandlers(t, { fa: strayFaultHandler }));
    try {
      await pool.ready;
      const sibling = post(pool.app, 'fa', { mode: 'wait' });
      const fault = await post(pool.app, 'fa', { mode: kind });
      const res = await sibling;
      assert.equal(res.status, 200, `the in-flight call was failed: ${await res.clone().text()}`);
      assert.deepEqual(await res.json(), { sibling: 'served' });
      assert.equal(fault.status, 200);
      assert.deepEqual(await fault.json(), { fine: true });

      const after = await post(pool.app, 'fa', { mode: 'ping' });
      assert.equal(after.status, 200, 'the worker keeps serving after the stray fault');
      assert.match(stderr.text(), new RegExp(`funcd-pool\\[fa\\]: .*stray ${kind}`), 'the stray fault is logged');
    } finally {
      stderr.restore();
      await pool.close();
    }
  });
}

// A worker that runs out of heap raises both 'error' and 'exit'. Each worker the handler starts
// appends to `boots` once and to `beats` while it lives, so the test sees every restart and any
// worker left running after close(). Each worker also exits by itself after 5 s, so a leaked one
// fails the test instead of keeping the test process alive.
test('issue r28: an out-of-heap worker is restarted once and close() stops it', { timeout: 15_000 }, async (t) => {
  const dir = tempDir(t, 'funcd-pool-r28-');
  const boots = join(dir, 'boots');
  const beats = join(dir, 'beats');
  writeFileSync(beats, '');
  const [spec] = writeHandlers(t, {
    oom: `import { appendFileSync } from 'node:fs';
appendFileSync(${JSON.stringify(boots)}, 'b');
setInterval(() => appendFileSync(${JSON.stringify(beats)}, '.'), 20);
setTimeout(() => process.exit(0), 5_000).unref();
export function handle(_, e) {
  if (e.data.mode === 'ping') return { ok: true };
  const a = [];
  for (;;) a.push(new Array(1e6).fill(7));
}`,
  });
  const pool = createPool([spec], { maxOldMB: 16, maxYoungMB: 4 });
  try {
    await pool.ready;
    assert.equal((await post(pool.app, 'oom', { mode: 'oom' })).status, 503);
    const deadline = Date.now() + 5_000;
    while ((await post(pool.app, 'oom', { mode: 'ping' })).status !== 200) {
      assert.ok(Date.now() < deadline, 'the worker was not restarted');
      await sleep(20);
    }
    await sleep(500);
    assert.equal(readFileSync(boots, 'utf8'), 'bb', 'one boot and one restart');
  } finally {
    await pool.close();
  }
  const after = readFileSync(beats, 'utf8').length;
  await sleep(200);
  assert.equal(readFileSync(beats, 'utf8').length, after, 'a worker still runs after close()');
});

// The handler module loads only while `gone` is absent, so once the first worker is up the test can
// make every restart fail at boot (exit 3). Each import appends a line to `boots`.
test('issue r36: a worker that fails to boot on restart is retried with a growing delay', {
  timeout: 20_000,
}, async (t) => {
  const dir = tempDir(t, 'funcd-pool-r36-');
  const boots = join(dir, 'boots');
  const gone = join(dir, 'gone');
  writeFileSync(boots, '');
  const [spec] = writeHandlers(t, {
    flaky: `import { appendFileSync, existsSync } from 'node:fs';
appendFileSync(${JSON.stringify(boots)}, 'b\\n');
if (existsSync(${JSON.stringify(gone)})) throw new Error('dependency gone');
export function handle(_, e) {
  if (e.data.mode === 'die') process.exit(1);
  return { ok: true };
}`,
  });
  const failedBoots = () => readFileSync(boots, 'utf8').split('\n').length - 2;
  const pool = createPool([spec]);
  try {
    await pool.ready;
    writeFileSync(gone, '');
    assert.equal((await post(pool.app, 'flaky', { mode: 'die' })).status, 503);
    await sleep(3_000);
    const failed = failedBoots();
    assert.ok(failed >= 1, 'the faulted worker was not restarted');
    assert.ok(failed <= 6, `${failed} failed boots in 3 s: the restarts do not back off`);

    rmSync(gone);
    const deadline = Date.now() + 12_000;
    while ((await post(pool.app, 'flaky', { mode: 'ping' })).status !== 200) {
      assert.ok(Date.now() < deadline, 'the worker did not come back once its handler loaded again');
      await sleep(50);
    }
  } finally {
    await pool.close();
  }
});

// scenario: pooled-node-follows-limit — the pool's timer follows funcd's X-Funcd-Timeout-Ms plus a 1 s margin
// (funcd ADR-0151); without a valid header it keeps the 30 s default.
test('scenario pooled-node-follows-limit: the call timeout follows x-funcd-timeout-ms', () => {
  assert.equal(callTimeoutMs('500'), 1_500);
  assert.equal(callTimeoutMs('2147482647'), 2_147_483_647);
  for (const header of [undefined, '', '0', '-5', '1.5', ' 500', 'abc', '2147482648', '99999999999999999999']) {
    assert.equal(callTimeoutMs(header), 30_000, `header ${JSON.stringify(header)}`);
  }
});

test('scenario pooled-node-follows-limit: a never-settling handler answers 503 after header + 1 s', {
  timeout: 15_000,
}, async (t) => {
  const pool = createPool(writeHandlers(t, { hang: 'export function handle() { return new Promise(() => {}); }' }));
  await pool.ready;
  try {
    const start = Date.now();
    const res = await pool.app.request('/function/hang', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-funcd-timeout-ms': '500' },
      body: JSON.stringify({ id: '1', source: 's', type: 't', data: {} }),
    });
    const elapsed = Date.now() - start;
    assert.equal(res.status, 503);
    assert.deepEqual(await res.json(), { error: 'function hang timed out' });
    assert.ok(elapsed >= 1_450 && elapsed < 5_000, `answered after ${elapsed} ms`);
  } finally {
    await pool.close();
  }
});
