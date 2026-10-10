import { type TestContext, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp, resolveHandler, resolveValidators, type Validator } from '../src/shim.ts';
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

// The I/O contract (ADR-0058): precompiled, eval-free validators generated at push from the
// author's FuncInput/FuncOutput types. The tests supply fakes standing in for the generated fns.
const ce = (data: unknown) => jsonReq(JSON.stringify({ id: '1', source: 's', type: 't', data }));

// requires event.data.hello to be a string (a stand-in for a generated FuncInput validator).
const helloInput: Validator = (data) => {
  const d = data as { hello?: unknown } | null;
  return d != null && typeof d.hello === 'string' ? [] : [{ message: 'hello must be a string' }];
};
// requires the result to be { ok: boolean } (a stand-in for a generated FuncOutput validator).
const okOutput: Validator = (r) => {
  const o = r as { ok?: unknown } | null;
  return o != null && typeof o.ok === 'boolean' ? [] : [{ message: 'ok must be a boolean' }];
};
// a `void`/`None` output contract: only an empty result is valid.
const voidOutput: Validator = (r) => (r === null || r === undefined ? [] : [{ message: 'expected no body' }]);

// scenario: generated-input-contract (valid) → handler runs (200).
test('input validator + matching event.data runs the handler', async () => {
  const app = createApp((_ctx, event) => ({ echoed: event.data }), { input: helloInput });
  const res = await app.request('/', ce({ hello: 'funcd' }));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { echoed: { hello: 'funcd' } });
});

// scenario: generated-input-contract (mismatch) → 422, handler never runs.
test('input validator + mismatching event.data → 422 (handler not called)', async () => {
  let called = false;
  const app = createApp(
    () => {
      called = true;
      return { ok: true };
    },
    { input: helloInput },
  );
  const res = await app.request('/', ce({ hello: 123 }));
  assert.equal(res.status, 422);
  const body = (await res.json()) as { error: string; details: unknown[] };
  assert.match(body.error, /input contract/);
  assert.ok(body.details.length > 0, 'carries the validation errors');
  assert.equal(called, false, 'a bad-shaped event never reaches user code');
});

// scenario: generated-output-contract → 500 on a bad result (never emitted as 200).
test('output validator + bad result → 500 (result not emitted)', async () => {
  const app = createApp(() => ({ wrong: true }), { output: okOutput });
  const res = await app.request('/', ce({}));
  assert.equal(res.status, 500);
  const body = (await res.json()) as { error: string; details: unknown[] };
  assert.match(body.error, /output contract/);
  assert.ok(body.details.length > 0);
});

test('output validator + good result → 200', async () => {
  const app = createApp(() => ({ ok: true }), { output: okOutput });
  const res = await app.request('/', ce({}));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
});

// scenario: returns-nothing-void → empty → 204, non-empty → 500.
test('void output contract: empty return → 204, non-empty return → 500', async () => {
  const empty = createApp(() => undefined, { output: voidOutput });
  assert.equal((await empty.request('/', ce({}))).status, 204);
  const nonEmpty = createApp(() => ({ surprise: true }), { output: voidOutput });
  assert.equal((await nonEmpty.request('/', ce({}))).status, 500);
});

// scenario: json-input-accepts-anything → the `Json` validator ({}) passes any event.data.
test('a Json input validator accepts any event.data → 200', async () => {
  const jsonInput: Validator = () => []; // generated from `FuncInput = Json` → schema {} → accepts all
  const app = createApp((_ctx, event) => ({ echoed: event.data }), { input: jsonInput });
  const res = await app.request('/', ce({ literally: ['anything', 1, true] }));
  assert.equal(res.status, 200);
});

// scenario: no-types-no-validation → no validators, nothing is validated (V1 behavior).
test('no validators → unvalidated (backward compatible)', async () => {
  const app = createApp((_ctx, event) => ({ echoed: event.data }));
  const res = await app.request('/', ce({ anything: [1, 2, 3] }));
  assert.equal(res.status, 200);
});

// resolveValidators reads the precompiled __funcdValidateInput/Output exports; undefined when absent.
test('resolveValidators reads __funcdValidateInput/Output, undefined when absent', () => {
  const v = resolveValidators({ __funcdValidateInput: helloInput, __funcdValidateOutput: okOutput });
  assert.equal(typeof v.input, 'function');
  assert.equal(typeof v.output, 'function');
  const none = resolveValidators({});
  assert.equal(none.input, undefined);
  assert.equal(none.output, undefined);
  // a non-function export is ignored (treated as absent), not trusted.
  assert.equal(resolveValidators({ __funcdValidateInput: 'nope' }).input, undefined);
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

// startShim runs the real shim entrypoint over a temp artifact, as the process driver does, and
// resolves once it listens.
async function startShim(t: TestContext, code: string) {
  const artifact = join(tempDir(t, 'funcd-shim-test-'), 'handler.mjs');
  writeFileSync(artifact, code);
  const child = spawn(
    process.execPath,
    ['--experimental-strip-types', '--no-warnings', fileURLToPath(new URL('../src/shim.ts', import.meta.url))],
    { env: { FUNCD_ARTIFACT: artifact }, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  let stderr = '';
  const exited = new Promise<number | null>((resolve) => child.on('exit', (code) => resolve(code)));
  const port = await new Promise<number>((resolve, reject) => {
    let stdout = '';
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    // ADR-0168: the listening line is on stdout, so a normal start is not ERROR.
    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
      const m = /listening on [^:]+:(\d+)/.exec(stdout);
      if (m) resolve(Number(m[1]));
    });
    void exited.then((code) => reject(new Error(`shim exited ${code} before listening: ${stderr}`)));
  });
  const call = (mode: string) =>
    fetch(`http://127.0.0.1:${port}/`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ data: { mode } }),
    });
  return { child, call, exited, stderr: () => stderr };
}

for (const kind of ['rejection', 'throw']) {
  test(`issue 132: a stray ${kind} in one call does not cut off a concurrent call`, { timeout: 15_000 }, async (t) => {
    const shim = await startShim(t, strayFaultHandler);
    let exitCode: number | null | undefined;
    void shim.exited.then((code) => {
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
const appWide = () => createApp(() => ({}), {}, {}, { dependencyBudgetMs: 5_000 });

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
