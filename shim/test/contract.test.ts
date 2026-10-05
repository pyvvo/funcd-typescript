import { type TestContext, test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { ContractError, loadFromPath, loadValidators } from '../src/contract.ts';
import { createApp } from '../src/shim.ts';
import { tempDir } from './tempdir.ts';

// write a contract blob to a temp file and return its path.
function writeContract(t: TestContext, blob: unknown): string {
  const dir = tempDir(t, 'funcd-contract-');
  const path = join(dir, 'contract.json');
  writeFileSync(path, JSON.stringify(blob));
  return path;
}

const CLOSED = {
  type: 'object',
  properties: { hello: { type: 'string' } },
  required: ['hello'],
  additionalProperties: false,
};

// scenario: runtime-compiles-validator — ajv.compile from the delivered schema produces a
// (data) => errors[] validator that enforces the shape.
test('loadFromPath compiles a validator per side and enforces it', (t) => {
  const v = loadFromPath(writeContract(t, { input: CLOSED, output: {} }));
  assert.equal(v.input({ hello: 'world' }).length, 0, 'valid input → no errors');
  assert.ok(v.input({ hello: 5 }).length > 0, 'wrong-typed field → errors');
});

// a void side ({"type":"null"}) accepts only null.
test('a void side accepts only null', (t) => {
  const v = loadFromPath(writeContract(t, { input: { type: 'null' }, output: { type: 'null' } }));
  assert.equal(v.input(null).length, 0);
  assert.ok(v.input({ x: 1 }).length > 0, 'a non-null value against a void side is invalid');
});

// the empty schema {} (the `Json` form) accepts anything.
test('a Json side ({}) accepts any value', (t) => {
  const v = loadFromPath(writeContract(t, { input: {}, output: {} }));
  assert.equal(v.input(['literally', 1, true]).length, 0);
});

// scenario: no-fail-open — a missing / unparseable / half contract throws ContractError.
test('fail-closed: missing / unparseable / half contract throws', (t) => {
  assert.throws(() => loadFromPath('/nope/does-not-exist.json'), ContractError);
  const bad = writeContract(t, '{'); // writeContract JSON-stringifies, so craft a broken file directly
  writeFileSync(bad, '{not json');
  assert.throws(() => loadFromPath(bad), ContractError);
  assert.throws(() => loadFromPath(writeContract(t, { input: { type: 'null' } })), ContractError); // no output
});

// loadValidators is env-driven: unset → null (back-compat), set-but-broken → throws.
test('loadValidators: unset → null, set-but-broken → throws', () => {
  assert.equal(loadValidators({} as NodeJS.ProcessEnv), null);
  assert.throws(
    () => loadValidators({ FUNCD_CONTRACT_PATH: '/nope/absent.json' } as unknown as NodeJS.ProcessEnv),
    ContractError,
  );
});

// scenario: runtime-compiles-validator (wire) — the compiled validators drive the same 422/500/204
// contract through createApp, byte-identical to the baked path.
test('compiled validators enforce 422/500/204 through createApp', async (t) => {
  const v = loadFromPath(
    writeContract(t, {
      input: CLOSED,
      output: {
        type: 'object',
        properties: { ok: { type: 'boolean' } },
        required: ['ok'],
        additionalProperties: false,
      },
    }),
  );
  const ce = (data: unknown) =>
    ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ data }) }) as const;

  const bad = createApp(() => ({ ok: true }), v);
  assert.equal((await bad.request('/', ce({ hello: 5 }))).status, 422, 'bad input → 422');

  const badOut = createApp(() => ({ wrong: true }), v);
  assert.equal((await badOut.request('/', ce({ hello: 'hi' }))).status, 500, 'bad output → 500');

  const good = createApp(() => ({ ok: true }), v);
  assert.equal((await good.request('/', ce({ hello: 'hi' }))).status, 200, 'good in/out → 200');

  const voidV = loadFromPath(writeContract(t, { input: {}, output: { type: 'null' } }));
  const empty = createApp(() => undefined, voidV);
  assert.equal((await empty.request('/', ce({}))).status, 204, 'void empty → 204');
  const nonEmpty = createApp(() => ({ surprise: true }), voidV);
  assert.equal((await nonEmpty.request('/', ce({}))).status, 500, 'void non-empty → 500');
});

// The ADR-0058 profile's string formats are enforced (advertised == enforced, ADR-0123), as the
// Python shim's fastjsonschema does: a mismatch is a 422, never passed to the handler.
test('issue 133: the compiled validator enforces the profile string formats', async (t) => {
  const valid: Record<string, string> = {
    'date-time': '2026-10-02T12:00:00Z',
    uuid: '3f2b8c1e-9d4a-4b6e-8f10-2a7c5e9d1b34',
    email: 'someone@example.com',
    uri: 'https://example.com/a?b=c',
  };
  for (const [format, ok] of Object.entries(valid)) {
    const v = loadFromPath(
      writeContract(t, {
        input: {
          type: 'object',
          properties: { v: { type: 'string', format } },
          required: ['v'],
          additionalProperties: false,
        },
        output: {},
      }),
    );
    assert.equal(v.input({ v: ok }).length, 0, `${format}: a valid value → no errors`);
    assert.ok(v.input({ v: 'not a valid value' }).length > 0, `${format}: a mismatch → errors`);
    const app = createApp((_ctx, e) => e.data, v);
    const res = await app.request('/', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ data: { v: 'not a valid value' } }),
    });
    assert.equal(res.status, 422, `${format}: a mismatch → 422`);
  }
});

// ADR-0090 Decision 2: a null-typed input accepts absent or null `data`; non-null data → 422.
test('issue 185: a void input contract accepts absent or null data', async (t) => {
  const v = loadFromPath(writeContract(t, { input: { type: 'null' }, output: { type: 'null' } }));
  const app = createApp(() => undefined, v);
  const post = (body: string) =>
    app.request('/', { method: 'POST', headers: { 'content-type': 'application/json' }, body });

  for (const body of ['', '{}', '{"data":null}', '{"specversion":"1.0","id":"x","type":"t","source":"s"}']) {
    assert.equal((await post(body)).status, 204, `body ${JSON.stringify(body)} → 204`);
  }
  assert.equal((await post('{"data":{"x":1}}')).status, 422, 'non-null data → 422');
});

// issue 186: the output contract checks the JSON the shim sends, not the handler's JS value, which
// JSON.stringify rewrites (toJSON, NaN/Infinity → null, undefined keys dropped, Date → string).
const WIRE_OUTPUT = {
  input: {},
  output: {
    type: 'object',
    properties: { a: { type: 'string' }, n: { type: 'number' } },
    required: ['a', 'n'],
    additionalProperties: false,
  },
};
const wireCE = { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"data":{}}' } as const;

class Sneaky {
  a = 'x';
  n = 1;
  toJSON() {
    return { evil: 1 };
  }
}

test('issue 186: a result whose JSON breaks the output contract → 500, never 200', async (t) => {
  const v = loadFromPath(writeContract(t, WIRE_OUTPUT));
  for (const [name, result] of [
    ['toJSON', new Sneaky()],
    ['NaN', { a: 'x', n: Number.NaN }],
    ['Infinity', { a: 'x', n: Number.POSITIVE_INFINITY }],
  ] as const) {
    const res = await createApp(() => result, v).request('/', wireCE);
    assert.equal(res.status, 500, `${name}: sent as ${await res.text()}`);
  }
});

test('issue 186: a result whose JSON meets the output contract → 200 with exactly that JSON', async (t) => {
  const v = loadFromPath(writeContract(t, WIRE_OUTPUT));
  const dropped = await createApp(() => ({ a: 'x', n: 1, extra: undefined }), v).request('/', wireCE);
  assert.equal(dropped.status, 200, 'an undefined key is not sent');
  assert.equal(await dropped.text(), '{"a":"x","n":1}');
  const date = await createApp(() => ({ a: new Date(0), n: 1 }), v).request('/', wireCE);
  assert.equal(date.status, 200, 'a Date is sent as a string');
  assert.deepEqual(await date.json(), { a: '1970-01-01T00:00:00.000Z', n: 1 });
});

test('issue 186: a result with no JSON form sends no body (204), not an empty 200', async (t) => {
  const json = loadFromPath(writeContract(t, { input: {}, output: {} }));
  for (const validators of [json, {}]) {
    const res = await createApp(() => Symbol('s'), validators).request('/', wireCE);
    assert.equal(res.status, 204);
  }
});

// ADR-0150: int64 is the JSON safe-integer range ±(2^53 − 1) on every runtime. The HTTP bodies are written as
// text because a JS number cannot hold 2^53 + 1.
const INT64 = {
  type: 'object',
  properties: { n: { type: 'integer', format: 'int64' } },
  required: ['n'],
  additionalProperties: false,
};
const int64Event = (n: string) =>
  ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: `{"data":{"n":${n}}}` }) as const;

test('scenario int64-safe-max-accepted: ±(2^53 − 1) reaches the handler exactly', async (t) => {
  const v = loadFromPath(writeContract(t, { input: INT64, output: INT64 }));
  for (const n of [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]) {
    assert.deepEqual(v.input({ n }), [], `${n}: valid input`);
    assert.deepEqual(v.output({ n }), [], `${n}: valid output`);
  }
  const seen: unknown[] = [];
  const app = createApp((_ctx, e) => {
    seen.push((e.data as { n: unknown }).n);
    return e.data;
  }, v);
  for (const text of ['9007199254740991', '-9007199254740991']) {
    const res = await app.request('/', int64Event(text));
    assert.equal(res.status, 200, text);
    assert.equal(await res.text(), `{"n":${text}}`);
  }
  assert.deepEqual(seen, [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]);
});

test('scenario int64-over-safe-range-rejected: 2^53, 2^53 + 1 and 2^70 → 422, the handler never runs', async (t) => {
  const v = loadFromPath(writeContract(t, { input: INT64, output: {} }));
  for (const n of [2 ** 53, 2 ** 70]) {
    assert.ok(v.input({ n }).length > 0, `${n}: invalid input`);
  }
  let calls = 0;
  const app = createApp(() => {
    calls++;
    return null;
  }, v);
  for (const text of ['9007199254740992', '9007199254740993', '1180591620717411303424']) {
    assert.equal((await app.request('/', int64Event(text))).status, 422, text);
  }
  assert.equal(calls, 0);
});

test('scenario int64-under-safe-range-rejected: −2^53 → 422', async (t) => {
  const v = loadFromPath(writeContract(t, { input: INT64, output: {} }));
  assert.ok(v.input({ n: -(2 ** 53) }).length > 0);
  let calls = 0;
  const app = createApp(() => {
    calls++;
    return null;
  }, v);
  assert.equal((await app.request('/', int64Event('-9007199254740992'))).status, 422);
  assert.equal(calls, 0);
});

test('scenario int64-output-over-safe-range-is-500: a handler returning 2^60 → 500', async (t) => {
  const v = loadFromPath(writeContract(t, { input: {}, output: INT64 }));
  assert.ok(v.output({ n: 2 ** 60 }).length > 0);
  const res = await createApp(() => ({ n: 2 ** 60 }), v).request('/', wireCE);
  assert.equal(res.status, 500);
});
