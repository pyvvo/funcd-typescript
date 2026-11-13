import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { api } from '../scripts/api.ts';

test('api.json is what yarn build:api writes from FunctionContext', () => {
  const committed = JSON.parse(readFileSync(new URL('../api.json', import.meta.url), 'utf8'));
  assert.deepEqual(committed, api(), 'api.json is stale: run yarn build:api');
});

test('api.json lists ctx.kv with every method of KVClient', () => {
  const kv = api().clients.find((c) => c.name === 'kv');
  assert.equal(kv?.type, 'KVClient');
  assert.deepEqual(
    kv?.methods.map((m) => m.name),
    ['get', 'getEntry', 'getText', 'getJSON', 'put', 'putIfAbsent', 'compareAndSet', 'del', 'delIf', 'list'],
  );
});
