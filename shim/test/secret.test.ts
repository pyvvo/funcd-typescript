// Scenario tests for context.secret on funcd's local API (funcd ADR-0249): GET /secret and GET /secret/{key}, over a
// fake funcd that binds Secret api-keys (STRIPE_KEY sk, MODE prod) and ConfigMap app-settings (MODE dev, so funcd
// lists no MODE in FUNCD_CONFIG_KEYS).
import assert from 'node:assert/strict';
import { type TestContext, test } from 'node:test';

import { makeConfig } from '../src/config.ts';
import { makeSecret } from '../src/secret.ts';
import { type Answer, type FakeAPI, fakeDependencies } from './localapi.ts';

/** secretAPI answers the secret routes from values, as funcd's Facade does, or every call with denied when it is set. */
function secretAPI(t: TestContext, values: Record<string, string>, denied?: Answer): Promise<FakeAPI> {
  return fakeDependencies(t, (_member, url) => {
    if (denied) return denied;
    if (url === '/secret') return { status: 200, body: JSON.stringify({ keys: Object.keys(values).sort() }) };
    const key = decodeURIComponent(url.replace(/^\/secret\//, ''));
    if (!(key in values)) return { status: 404, body: '{"title":"Not Found"}' };
    return { status: 200, body: JSON.stringify({ value: values[key] }) };
  });
}

test('scenario secret-read-from-funcd: get returns a bound value and list the sorted keys, read on every call', async (t) => {
  const values = { STRIPE_KEY: 'sk', MODE: 'prod' };
  const api = await secretAPI(t, values);
  const secret = makeSecret();
  assert.equal(await secret.get('STRIPE_KEY'), 'sk');
  assert.deepEqual(await secret.list(), ['MODE', 'STRIPE_KEY']);
  values.STRIPE_KEY = 'sk2';
  assert.equal(await secret.get('STRIPE_KEY'), 'sk2', 'no cache: the next read sees the change');
  assert.deepEqual(api.calls, ['GET /secret/STRIPE_KEY -', 'GET /secret -', 'GET /secret/STRIPE_KEY -']);
});

test('scenario secret-unbound: a key no bound Secret holds reads as undefined', async (t) => {
  await secretAPI(t, { STRIPE_KEY: 'sk' });
  assert.equal(await makeSecret().get('NOPE'), undefined);
});

test('scenario secret-shadows-config: a key a bound Secret holds reads only through secret', async (t) => {
  await secretAPI(t, { MODE: 'prod' });
  assert.equal(await makeSecret().get('MODE'), 'prod');
  assert.equal(makeConfig({ FUNCD_CONFIG_KEYS: 'LOG_LEVEL', LOG_LEVEL: 'debug' }).get('MODE'), undefined);
});

test('a failed check rejects, naming the call and its status', async (t) => {
  await secretAPI(t, {}, { status: 403, body: '{"title":"Forbidden"}' });
  await assert.rejects(makeSecret().get('STRIPE_KEY'), /context\.secret\.get failed: 403/);
  await assert.rejects(makeSecret().list(), /context\.secret\.list failed: 403/);
});

test('a pool member names itself on every read, and a key is path-encoded', async (t) => {
  const api = await secretAPI(t, { 'a/b': 'v' });
  assert.equal(await makeSecret('member-a').get('a/b'), 'v');
  assert.deepEqual(api.calls, ['GET /secret/a%2Fb member-a']);
});
