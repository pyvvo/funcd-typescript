import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { closeSync, constants, openSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

import { createPool } from '../src/pool.ts';
import { post, writeHandlers } from './poolapp.ts';
import { tempDir } from './tempdir.ts';

// funcd ADR-0226 in the pool host. The tests that wait for a late call's timer cut the 10 s delay through
// createPool's stuckDelayMs.

// Rung 1 (scenario handler-reads-deadline): the host passes the call's deadline to the member's worker, whose
// ctx.remainingMs() counts down on the same clock; null without a valid header.
test('scenario handler-reads-deadline: a pooled ctx.remainingMs() counts down from x-funcd-timeout-ms', async (t) => {
  const pool = createPool(
    writeHandlers(t, {
      a: `export async function handle(ctx) {
  const first = ctx.remainingMs();
  await new Promise((r) => setTimeout(r, 50));
  return { first, second: ctx.remainingMs() };
}`,
    }),
  );
  const left = async (header?: string) => {
    const res = await post(pool.app, 'a', {}, header === undefined ? {} : { 'x-funcd-timeout-ms': header });
    return (await res.json()) as { first: number | null; second: number | null };
  };
  try {
    await pool.ready;
    const { first, second } = await left('5000');
    assert.ok(first !== null && Number.isInteger(first) && first > 4_000 && first <= 5_000, `first ${first}`);
    assert.ok(second !== null && Number.isInteger(second) && first - second >= 40, `second ${second}`);
    for (const header of [undefined, '0', 'abc']) {
      assert.deepEqual(await left(header), { first: null, second: null }, `header ${JSON.stringify(header)}`);
    }
  } finally {
    await pool.close();
  }
});

// scenario: stuck-pooled-node-member-restarted — a handler that blocks its worker's event loop leaves the ping after
// its late call unanswered: the host ends that worker, whose other call answers 503 through the fault path, and
// restarts it, while a sibling serves throughout.
test('scenario stuck-pooled-node-member-restarted: a blocked worker is ended and restarted', {
  timeout: 10_000,
}, async (t) => {
  const pool = createPool(
    writeHandlers(t, {
      a: 'export function handle(_, e) { if (e.data.spin) for (;;); return { ok: true }; }',
      b: 'export function handle() { return { ok: true }; }',
    }),
    { stuckDelayMs: 200 },
  );
  try {
    await pool.ready;
    const late = post(pool.app, 'a', { spin: true }, { 'x-funcd-timeout-ms': '100' });
    await sleep(100);
    const queued = post(pool.app, 'a', {});
    const timedOut = await late;
    const timerAt = performance.now();
    assert.equal(timedOut.status, 503);
    assert.deepEqual(await timedOut.json(), { error: 'function a timed out' });
    assert.equal((await post(pool.app, 'b', {})).status, 200, 'the sibling serves while a is blocked');
    const faulted = await queued;
    const endedAfter = performance.now() - timerAt;
    assert.equal(faulted.status, 503);
    assert.deepEqual(await faulted.json(), { error: 'function a worker faulted' });
    assert.ok(endedAfter >= 150 && endedAfter < 2_000, `ended ${endedAfter} ms after the timer`);
    const deadline = Date.now() + 5_000;
    while ((await post(pool.app, 'a', {})).status !== 200) {
      assert.ok(Date.now() < deadline, 'the worker was not restarted');
      await sleep(20);
    }
    assert.equal((await post(pool.app, 'b', {})).status, 200);
    assert.equal((await pool.app.request('/health/liveness')).status, 200, 'an ended worker that exited');
  } finally {
    await pool.close();
  }
});

// scenario: late-await-keeps-node-worker — a late call that only awaits leaves its worker's event loop free, so the
// worker answers the ping and is not ended: a second call on it, still running after the ping window, succeeds.
test('scenario late-await-keeps-node-worker: a worker that answers the ping is not ended', {
  timeout: 10_000,
}, async (t) => {
  const pool = createPool(
    writeHandlers(t, {
      a: 'export async function handle(_, e) { await new Promise((r) => setTimeout(r, e.data.ms)); return { waited: e.data.ms }; }',
    }),
    { stuckDelayMs: 500 },
  );
  try {
    await pool.ready;
    const late = post(pool.app, 'a', { ms: 5_000 }, { 'x-funcd-timeout-ms': '1000' });
    const second = post(pool.app, 'a', { ms: 3_000 });
    const timedOut = await late;
    assert.equal(timedOut.status, 503);
    assert.deepEqual(await timedOut.json(), { error: 'function a timed out' });
    const res = await second;
    assert.equal(res.status, 200, `the worker was ended: ${await res.clone().text()}`);
    assert.deepEqual(await res.json(), { waited: 3_000 });
  } finally {
    await pool.close();
  }
});

// A worker that leaves the ping unanswered, then exits on its own inside the window, is restarted through the fault
// path. The end of that window must neither end its successor nor count the exited worker as stuck.
test('a worker that exits inside its ping window: the successor serves on and liveness stays 200', {
  timeout: 10_000,
}, async (t) => {
  const pool = createPool(
    writeHandlers(t, {
      a: `export async function handle(_, e) {
if (e.data.block) {
  const end = Date.now() + e.data.block;
  while (Date.now() < end);
  process.exit(1);
}
await new Promise((r) => setTimeout(r, e.data.wait ?? 0));
return { ok: true };
}`,
    }),
    { stuckDelayMs: 1_000 },
  );
  try {
    await pool.ready;
    const late = await post(pool.app, 'a', { block: 1_300 }, { 'x-funcd-timeout-ms': '100' });
    const timerAt = performance.now();
    assert.equal(late.status, 503);
    const deadline = Date.now() + 5_000;
    while ((await post(pool.app, 'a', {})).status !== 200) {
      assert.ok(Date.now() < deadline, 'the worker was not restarted');
      await sleep(20);
    }
    const sentAfter = performance.now() - timerAt;
    assert.ok(sentAfter < 900, `the successor served ${sentAfter} ms after the timer, too late to span the window`);
    const successor = await post(pool.app, 'a', { wait: 1_000 });
    assert.equal(successor.status, 200, `the successor was ended: ${await successor.clone().text()}`);
    await sleep(Math.max(0, timerAt + 2_200 - performance.now()));
    assert.equal((await pool.app.request('/health/liveness')).status, 200, 'the exited worker counts as stuck');
  } finally {
    await pool.close();
  }
});

// Rung 3: a worker blocked where terminate() cannot reach it (opening a FIFO no one writes to) does not exit when
// the host ends it. Liveness answers 503 from the delay after the end, and 200 again once the worker exits.
test('liveness answers 503 stuck call while a worker the host ended has not exited', {
  timeout: 10_000,
}, async (t) => {
  const fifo = join(tempDir(t, 'funcd-pool-stuck-'), 'fifo');
  execFileSync('mkfifo', [fifo]);
  const pool = createPool(
    writeHandlers(t, {
      a: `import { readFileSync } from 'node:fs';
export function handle(_, e) { if (e.data.block) readFileSync(${JSON.stringify(fifo)}); return { ok: true }; }`,
    }),
    { stuckDelayMs: 200 },
  );
  // A writer that opens and closes the FIFO lets the blocked read return; with no reader the open fails, and there
  // is nothing to let go.
  const unblock = () => {
    try {
      closeSync(openSync(fifo, constants.O_WRONLY | constants.O_NONBLOCK));
    } catch {}
  };
  const liveness = async () => {
    const res = await pool.app.request('/health/liveness');
    return [res.status, await res.text()];
  };
  const until = async (want: number, what: string) => {
    const deadline = Date.now() + 5_000;
    while ((await liveness())[0] !== want) {
      assert.ok(Date.now() < deadline, what);
      await sleep(20);
    }
  };
  try {
    await pool.ready;
    const late = await post(pool.app, 'a', { block: true }, { 'x-funcd-timeout-ms': '100' });
    const timerAt = performance.now();
    assert.equal(late.status, 503);
    assert.deepEqual(await liveness(), [200, 'ok'], 'a late call alone leaves liveness 200');
    await until(503, 'liveness never failed');
    const failedAfter = performance.now() - timerAt;
    assert.deepEqual(await liveness(), [503, 'stuck call']);
    assert.ok(failedAfter >= 350, `liveness failed ${failedAfter} ms after the timer, before the window and the delay`);
    unblock();
    await until(200, 'liveness did not recover once the worker exited');
    const deadline = Date.now() + 5_000;
    while ((await post(pool.app, 'a', {})).status !== 200) {
      assert.ok(Date.now() < deadline, 'the worker was not restarted');
      await sleep(20);
    }
  } finally {
    unblock();
    await pool.close();
  }
});
