import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { ContractError, loadFromPath, loadValidators } from '../src/contract.ts';
import { createApp } from '../src/shim.ts';

// write a contract blob to a temp file and return its path.
function writeContract(blob: unknown): string {
  const dir = mkdtempSync(join(tmpdir(), 'funcd-contract-'));
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
test('loadFromPath compiles a validator per side and enforces it', () => {
  const v = loadFromPath(writeContract({ input: CLOSED, output: {} }));
  assert.equal(v.input({ hello: 'world' }).length, 0, 'valid input → no errors');
  assert.ok(v.input({ hello: 5 }).length > 0, 'wrong-typed field → errors');
});

// a void side ({"type":"null"}) accepts only null.
test('a void side accepts only null', () => {
  const v = loadFromPath(writeContract({ input: { type: 'null' }, output: { type: 'null' } }));
  assert.equal(v.input(null).length, 0);
  assert.ok(v.input({ x: 1 }).length > 0, 'a non-null value against a void side is invalid');
});

// the empty schema {} (the `Json` form) accepts anything.
test('a Json side ({}) accepts any value', () => {
  const v = loadFromPath(writeContract({ input: {}, output: {} }));
  assert.equal(v.input(['literally', 1, true]).length, 0);
});

// scenario: no-fail-open — a missing / unparseable / half contract throws ContractError.
test('fail-closed: missing / unparseable / half contract throws', () => {
  assert.throws(() => loadFromPath('/nope/does-not-exist.json'), ContractError);
  const bad = writeContract('{'); // writeContract JSON-stringifies, so craft a broken file directly
  writeFileSync(bad, '{not json');
  assert.throws(() => loadFromPath(bad), ContractError);
  assert.throws(() => loadFromPath(writeContract({ input: { type: 'null' } })), ContractError); // no output
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
test('compiled validators enforce 422/500/204 through createApp', async () => {
  const v = loadFromPath(
    writeContract({
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

  const voidV = loadFromPath(writeContract({ input: {}, output: { type: 'null' } }));
  const empty = createApp(() => undefined, voidV);
  assert.equal((await empty.request('/', ce({}))).status, 204, 'void empty → 204');
  const nonEmpty = createApp(() => ({ surprise: true }), voidV);
  assert.equal((await nonEmpty.request('/', ce({}))).status, 500, 'void non-empty → 500');
});

// The ADR-0058 profile's string formats are enforced (advertised == enforced, ADR-0123), as the
// Python shim's fastjsonschema does: a mismatch is a 422, never passed to the handler.
test('issue 133: the compiled validator enforces the profile string formats', async () => {
  const valid: Record<string, string> = {
    'date-time': '2026-10-02T12:00:00Z',
    uuid: '3f2b8c1e-9d4a-4b6e-8f10-2a7c5e9d1b34',
    email: 'someone@example.com',
    uri: 'https://example.com/a?b=c',
  };
  for (const [format, ok] of Object.entries(valid)) {
    const v = loadFromPath(
      writeContract({
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
test('issue 185: a void input contract accepts absent or null data', async () => {
  const v = loadFromPath(writeContract({ input: { type: 'null' }, output: { type: 'null' } }));
  const app = createApp(() => undefined, v);
  const post = (body: string) =>
    app.request('/', { method: 'POST', headers: { 'content-type': 'application/json' }, body });

  for (const body of ['', '{}', '{"data":null}', '{"specversion":"1.0","id":"x","type":"t","source":"s"}']) {
    assert.equal((await post(body)).status, 204, `body ${JSON.stringify(body)} → 204`);
  }
  assert.equal((await post('{"data":{"x":1}}')).status, 422, 'non-null data → 422');
});
