// Scenario tests for context.config and context.lake (funcd ADR-0245) over the environment funcd gives a worker:
// ConfigMap app-settings (LOG_LEVEL, MODE, which a bound Secret also holds, so it is not listed) and lake lake.
// context.secret reads funcd's local API instead (secret.test.ts, funcd ADR-0249).
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { makeLake } from '../src/lake.ts';
import { makeConfig } from '../src/config.ts';
import { createPool } from '../src/pool.ts';
import { fakeDependencies } from './localapi.ts';
import { post, writeHandlers } from './poolapp.ts';

const env = {
  PATH: '/usr/bin',
  FUNCD_INVOKE_SOCKET: '/run/funcd/api.sock',
  LOG_LEVEL: 'debug',
  FUNCD_CONFIG_KEYS: 'LOG_LEVEL',
  FUNCD_LAKE_LAKE_URL: '127.0.0.1:9100',
  FUNCD_LAKE_LAKE_TOKEN: 'tok-a',
};

test('scenario ctx-config-get: config.get returns a bound key and list() the listed keys', () => {
  const config = makeConfig(env);
  assert.equal(config.get('LOG_LEVEL'), 'debug');
  assert.deepEqual(config.list(), ['LOG_LEVEL']);
});

test('scenario ctx-unbound-key: an unbound variable reads as undefined', () => {
  assert.equal(makeConfig(env).get('PATH'), undefined);
  assert.equal(makeConfig(env).get('FUNCD_INVOKE_SOCKET'), undefined);
});

test('scenario ctx-lake-get: lake.get returns the URL and token, and throws naming an unbound alias', () => {
  const lake = makeLake(env);
  assert.deepEqual(lake.get('lake'), { url: '127.0.0.1:9100', token: 'tok-a' });
  assert.throws(() => lake.get('other'), /"other"/);
});

test('an absent or empty key list is no keys', () => {
  for (const list of [{}, { FUNCD_CONFIG_KEYS: '' }]) {
    const e = { ...list, LOG_LEVEL: 'debug' };
    assert.deepEqual(makeConfig(e).list(), []);
    assert.equal(makeConfig(e).get('LOG_LEVEL'), undefined);
  }
});

test('the clients read the environment at call time', () => {
  const live: Record<string, string> = { FUNCD_CONFIG_KEYS: 'A', A: '1' };
  const config = makeConfig(live);
  const lake = makeLake(live);
  assert.equal(config.get('A'), '1');
  assert.throws(() => lake.get('lake'));
  Object.assign(live, { A: '2', FUNCD_LAKE_LAKE_URL: '127.0.0.1:9100', FUNCD_LAKE_LAKE_TOKEN: 'tok' });
  assert.equal(config.get('A'), '2');
  assert.deepEqual(lake.get('lake'), { url: '127.0.0.1:9100', token: 'tok' });
});

test('scenario ctx-pooled-member: each member reads its own lake token and secrets, and the pool config', async (t) => {
  // funcd answers each member's secret read as that member (funcd ADR-0249): the fake names it in the value.
  await fakeDependencies(t, (member) => ({ status: 200, body: JSON.stringify({ value: `sk-${member}` }) }));
  const shared = { LOG_LEVEL: 'debug', FUNCD_CONFIG_KEYS: 'LOG_LEVEL' };
  const prev = Object.fromEntries(Object.keys(shared).map((k) => [k, process.env[k]]));
  Object.assign(process.env, shared, { FUNCD_LAKE_LAKE_URL: '127.0.0.1:9100' });
  t.after(() => {
    for (const [k, v] of Object.entries(prev)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    delete process.env.FUNCD_LAKE_LAKE_URL;
  });
  const handler =
    'export async function handle(ctx) { return { lake: ctx.lake.get("lake"), level: ctx.config.get("LOG_LEVEL"), key: await ctx.secret.get("STRIPE_KEY") }; }';
  const [a, b] = writeHandlers(t, { a: handler, b: handler });
  const pool = createPool([
    { ...a, env: { FUNCD_LAKE_LAKE_TOKEN: 'tok-a' } },
    { ...b, env: { FUNCD_LAKE_LAKE_TOKEN: 'tok-b' } },
  ]);
  await pool.ready;
  try {
    for (const [name, token] of [
      ['a', 'tok-a'],
      ['b', 'tok-b'],
    ]) {
      const r = await post(pool.app, name, {});
      assert.equal(r.status, 200);
      assert.deepEqual(await r.json(), { lake: { url: '127.0.0.1:9100', token }, level: 'debug', key: `sk-${name}` });
    }
  } finally {
    await pool.close();
  }
});
