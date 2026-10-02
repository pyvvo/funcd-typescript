import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { closeSync, constants, createReadStream, mkdtempSync, openSync, writeFileSync } from 'node:fs';
import { once } from 'node:events';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import type { Hono } from 'hono';

import { createPool } from '../src/pool.ts';

// writeHandlers writes each handler to a temp .mjs and returns the pool manifest.
function writeHandlers(handlers: Record<string, string>): { name: string; artifact: string }[] {
  const dir = mkdtempSync(join(tmpdir(), 'funcd-pool-test-'));
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
test('routes each function to its own worker; unknown → 404', async () => {
  const pool = createPool(
    writeHandlers({
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
test('a faulting handler is isolated; siblings keep serving', async () => {
  const pool = createPool(
    writeHandlers({
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
test('a handler over its memory quota OOMs its thread, not the pool', async () => {
  const pool = createPool(
    writeHandlers({
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
test('a pooled handler enforces its embedded input validator (422 on mismatch)', async () => {
  const pool = createPool(
    writeHandlers({
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
test('issue 81: pooled functions logging concurrently on one fd 3 pipe keep every record whole', async () => {
  const fifo = join(mkdtempSync(join(tmpdir(), 'funcd-pool-fd-')), 'channel');
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
  const pool = createPool(writeHandlers({ a: handler('a'), b: handler('b') }));
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
test('issue 185: a pooled void input contract accepts absent or null data', async () => {
  const [spec] = writeHandlers({ v: 'export function handle() {}' });
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
