import { type TestContext, test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { createApp, resolveHandler } from '../src/shim.ts';
import { startEntrypoint } from './entrypoint.ts';
import { type Answer, fakeDependencies } from './localapi.ts';
import { tempDir } from './tempdir.ts';

const jsonReq = (body: string) => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body }) as const;

// scenario: invoke-returns-object — POST / runs the handler and returns its object as 200 JSON.
test('POST / invokes the handler and returns its object as 200 JSON', async () => {
  const app = createApp((_ctx, event) => ({ echoed: event.data }));
  const res = await app.request('/', jsonReq(JSON.stringify({ id: '1', source: 's', type: 't', data: { hi: 1 } })));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { echoed: { hi: 1 } });
});

// scenario: invoke-no-return → 204.
test('POST / with no return value → 204', async () => {
  const app = createApp(() => undefined);
  const res = await app.request('/', jsonReq('{}'));
  assert.equal(res.status, 204);
});

// scenario: invoke-throws → 500 with the error message.
test('POST / when the handler throws → 500', async () => {
  const app = createApp(() => {
    throw new Error('boom');
  });
  const res = await app.request('/', jsonReq('{}'));
  assert.equal(res.status, 500);
  const body = (await res.json()) as { error: string };
  assert.match(body.error, /boom/);
});

// scenario: invalid-json → 400.
test('POST / with invalid CloudEvent JSON → 400', async () => {
  const app = createApp(() => ({}));
  const res = await app.request('/', jsonReq('not json'));
  assert.equal(res.status, 400);
});

// scenario: non-object-body-returns-400 — a valid-JSON but non-object body (null/array/scalar) is not a
// CloudEvent envelope. Regression: it used to reach `event.data` and crash the worker (proxy EOF/502).
for (const body of ['null', '[1,2]', '42', '"s"', 'true']) {
  test(`POST / with a non-object JSON body ${body} → 400 (no crash)`, async () => {
    const app = createApp((_ctx, event) => ({ echoed: event.data }));
    const res = await app.request('/', jsonReq(body));
    assert.equal(res.status, 400);
    assert.match(await res.text(), /CloudEvent envelope/);
  });
}

// scenario: worker-survives-bad-input — a bad request must not poison the app; a subsequent good
// request still returns 200.
test('POST / a non-object body then a good envelope → 400 then 200', async () => {
  const app = createApp((_ctx, event) => ({ echoed: event.data }));
  assert.equal((await app.request('/', jsonReq('null'))).status, 400);
  const good = await app.request('/', jsonReq(JSON.stringify({ data: { x: 1 } })));
  assert.equal(good.status, 200);
  assert.deepEqual(await good.json(), { echoed: { x: 1 } });
});

// scenario: health-endpoints → 200.
test('GET /health/readiness and /health/liveness → 200', async () => {
  const app = createApp(() => ({}));
  assert.equal((await app.request('/health/readiness')).status, 200);
  assert.equal((await app.request('/health/liveness')).status, 200);
});

// scenario: handler-resolution — name, default.name, or default; else throws (shape gate).
test('resolveHandler picks the named export / default.named / default; else throws', () => {
  assert.equal(typeof resolveHandler({ handle: () => {} }, 'handle'), 'function');
  assert.equal(typeof resolveHandler({ default: { handle: () => {} } }, 'handle'), 'function');
  assert.equal(typeof resolveHandler({ default: () => {} }, 'handle'), 'function');
  assert.throws(() => resolveHandler({ nope: 1 }, 'handle'), /not a function/);
});

// scenario: context-log — the handler receives a context with log().
test('the handler context exposes log()', async () => {
  const app = createApp((ctx) => {
    ctx.log('handling');
    return { ok: true };
  });
  assert.equal((await app.request('/', jsonReq('{}'))).status, 200);
});

// funcd ADR-0226 rung 1 (scenario handler-reads-deadline): ctx.remainingMs() counts down from the call's
// x-funcd-timeout-ms in whole milliseconds, floored at 0; null without a valid header.
test('scenario handler-reads-deadline: ctx.remainingMs() counts down from x-funcd-timeout-ms', async () => {
  const app = createApp(async (ctx) => {
    const first = ctx.remainingMs();
    await sleep(50);
    return { first, second: ctx.remainingMs() };
  });
  const left = async (header?: string) => {
    const res = await app.request('/', {
      method: 'POST',
      headers: header === undefined ? {} : { 'x-funcd-timeout-ms': header },
      body: '{}',
    });
    return (await res.json()) as { first: number | null; second: number | null };
  };
  const { first, second } = await left('5000');
  assert.ok(first !== null && Number.isInteger(first) && first > 4_000 && first <= 5_000, `first ${first}`);
  assert.ok(second !== null && Number.isInteger(second) && first - second >= 40, `second ${second}`);
  assert.equal((await left('20')).second, 0, 'floored at 0 past the deadline');
  for (const header of [undefined, '0', 'abc', '2147482648']) {
    assert.deepEqual(await left(header), { first: null, second: null }, `header ${JSON.stringify(header)}`);
  }
});

// issue 186: the shim sends the JSON form of the result: JSON.stringify drops an undefined key and writes a Date as a
// string, and a result with no JSON form goes out as no body (204), not an empty 200.
test('issue 186: the shim sends the JSON form of the result', async () => {
  const send = (result: unknown) => createApp(() => result).request('/', jsonReq('{"data":{}}'));
  const dropped = await send({ a: 'x', n: 1, extra: undefined });
  assert.equal(dropped.status, 200);
  assert.equal(await dropped.text(), '{"a":"x","n":1}');
  assert.deepEqual(await (await send({ a: new Date(0), n: Number.NaN })).json(), {
    a: '1970-01-01T00:00:00.000Z',
    n: null,
  });
  assert.equal((await send(Symbol('s'))).status, 204);
});

// funcd ADR-0303: funcd checks each call's input and result, so the shim runs the handler whatever a delivered
// contract or a validator the module still exports would say.
test('the shim checks no contract: a delivered contract and a baked validator are both ignored', async (t) => {
  const dir = tempDir(t, 'funcd-shim-test-');
  const artifact = join(dir, 'handler.mjs');
  writeFileSync(
    artifact,
    'export const __funcdValidateInput = () => [{ message: "rejected" }];\n' +
      'export function handle(_ctx, event) { return { echoed: event.data }; }\n',
  );
  const contract = join(dir, 'contract.json');
  writeFileSync(contract, JSON.stringify({ input: { type: 'null' }, output: { type: 'null' } }));
  const shim = await startEntrypoint('shim', { FUNCD_ARTIFACT: artifact, FUNCD_CONTRACT_PATH: contract });
  try {
    const res = await fetch(`http://127.0.0.1:${shim.port}/`, jsonReq(JSON.stringify({ data: { hello: 123 } })));
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { echoed: { hello: 123 } });
  } finally {
    shim.child.kill();
  }
});

// A handler for the stray-fault tests. A 'wait' call blocks until a fault call has fired its stray
// fault, so the fault is raised while a sibling call is in flight on the same event loop.
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

// startShim runs the real shim entrypoint over a temp artifact and resolves once it listens.
async function startShim(t: TestContext, code: string) {
  const artifact = join(tempDir(t, 'funcd-shim-test-'), 'handler.mjs');
  writeFileSync(artifact, code);
  const shim = await startEntrypoint('shim', { FUNCD_ARTIFACT: artifact });
  const call = (mode: string) =>
    fetch(`http://127.0.0.1:${shim.port}/`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ data: { mode } }),
    });
  return { ...shim, call };
}

for (const kind of ['rejection', 'throw']) {
  test(`issue 132: a stray ${kind} in one call does not cut off a concurrent call`, { timeout: 15_000 }, async (t) => {
    const shim = await startShim(t, strayFaultHandler);
    let exitCode: number | null | undefined;
    void shim.exited.then(({ code }) => {
      exitCode = code;
    });
    try {
      const sibling = shim.call('wait');
      const fault = await shim.call(kind);
      assert.equal(fault.status, 200);
      assert.deepEqual(await fault.json(), { fine: true });

      const res = await sibling.catch((err: unknown) =>
        assert.fail(`the concurrent call was cut off (${err}); shim exit code ${exitCode}`),
      );
      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), { sibling: 'served' });

      const after = await shim.call('ping');
      assert.equal(after.status, 200, 'the shim keeps serving after the stray fault');
      assert.equal(exitCode, undefined, 'the shim process is still running');
      assert.match(shim.stderr(), new RegExp(`stray ${kind}`), 'the stray fault is logged');
    } finally {
      shim.child.kill();
    }
  });
}

// funcd ADR-0215 Decision 4: readiness asks funcd's GET /health/dependencies on the invoke socket.
const auditForbidden = {
  kind: 'kv',
  binding: 'audit',
  reason: 'Forbidden',
  message: 'kv::read on table audit is not allowed',
};

// A wide budget, so only the test of the bound depends on timing.
const appWide = () => createApp(() => ({}), {}, { dependencyBudgetMs: 5_000 });

async function readiness(t: TestContext, answer: Answer, app = appWide()) {
  const api = await fakeDependencies(t, () => answer);
  const start = performance.now();
  const res = await app.request('/health/readiness');
  return { res, elapsed: performance.now() - start, calls: api.calls };
}

async function socketReport(res: Response, reason: string) {
  assert.equal(res.status, 503);
  const body = (await res.json()) as Record<string, unknown>;
  assert.deepEqual({ ...body, message: '' }, { kind: 'socket', binding: '', reason, message: '' });
  assert.match(String(body.message), /\/health\/dependencies/);
  return body;
}

test('readiness: funcd answers 200 → 200 ready, asked once with no member header', async (t) => {
  const { res, calls } = await readiness(t, { status: 200, body: '' });
  assert.equal(res.status, 200);
  assert.equal(await res.text(), 'ready');
  assert.deepEqual(calls, ['GET /health/dependencies -']);
});

test('scenario app-dependency-check: a funcd 503 report is relayed as 503 with the same JSON body', async (t) => {
  const { res } = await readiness(t, { status: 503, body: JSON.stringify(auditForbidden) });
  assert.equal(res.status, 503);
  assert.match(res.headers.get('content-type') ?? '', /application\/json/);
  assert.deepEqual(await res.json(), auditForbidden);
});

test('scenario health-shim-compat: a funcd without the endpoint (404) → 200 ready', async (t) => {
  const { res, calls } = await readiness(t, { status: 404, body: '404 page not found' });
  assert.equal(res.status, 200);
  assert.equal(await res.text(), 'ready');
  assert.equal(calls.length, 1);
});

test('scenario health-shim-compat: no FUNCD_INVOKE_SOCKET → 200 ready', async () => {
  assert.equal(process.env.FUNCD_INVOKE_SOCKET, undefined);
  const res = await createApp(() => ({})).request('/health/readiness');
  assert.equal(res.status, 200);
  assert.equal(await res.text(), 'ready');
});

test('readiness: a 403 from funcd → 503 kind socket, reason Unreachable', async (t) => {
  const { res } = await readiness(t, { status: 403, body: 'no member' });
  const body = await socketReport(res, 'Unreachable');
  assert.match(String(body.message), /403/);
});

test('readiness: a funcd 503 that is not a report → 503 kind socket, reason Unreachable', async (t) => {
  const { res } = await readiness(t, { status: 503, body: 'service unavailable' });
  await socketReport(res, 'Unreachable');
});

for (const [name, answer] of [
  ['a connection closed before any reply', 'drop'],
  ['a reply cut mid-body', { status: 200, body: 'ok', cut: true }],
] as const) {
  test(`readiness: ${name} → 503 kind socket, reason Unreachable`, async (t) => {
    const { res } = await readiness(t, answer);
    await socketReport(res, 'Unreachable');
  });
}

test('readiness: a socket with no listener → 503 kind socket, reason Unreachable', async (t) => {
  await fakeDependencies(t, () => ({ status: 200, body: '' }));
  process.env.FUNCD_INVOKE_SOCKET += '.absent';
  const res = await appWide().request('/health/readiness');
  const body = await socketReport(res, 'Unreachable');
  assert.match(String(body.message), /ENOENT/);
});

test('readiness: funcd that never answers → 503 kind socket, reason Timeout, within probeTimeout', async (t) => {
  const { res, elapsed } = await readiness(
    t,
    'hold',
    createApp(() => ({})),
  );
  await socketReport(res, 'Timeout');
  // The fake never answers, so any answer proves the 50 ms bound; 250 ms leaves margin for a loaded host.
  assert.ok(elapsed >= 45 && elapsed < 250, `answered after ${elapsed} ms`);
});

test('liveness never calls funcd', async (t) => {
  const api = await fakeDependencies(t, () => ({ status: 503, body: JSON.stringify(auditForbidden) }));
  const res = await createApp(() => ({})).request('/health/liveness');
  assert.equal(res.status, 200);
  assert.deepEqual(api.calls, []);
});
