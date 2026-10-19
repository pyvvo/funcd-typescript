// Scenario tests for context.config, context.secret and context.catalog (funcd ADR-0245) over the environment funcd
// gives a worker: ConfigMap app-settings (LOG_LEVEL, MODE), Secret api-keys (STRIPE_KEY, MODE) and catalog lake.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { makeCatalog } from '../src/catalog.ts';
import { makeConfig } from '../src/config.ts';
import { createPool } from '../src/pool.ts';
import { makeSecret } from '../src/secret.ts';
import { post, writeHandlers } from './poolapp.ts';

const env = {
  PATH: '/usr/bin',
  FUNCD_INVOKE_SOCKET: '/run/funcd/api.sock',
  LOG_LEVEL: 'debug',
  MODE: 'prod',
  STRIPE_KEY: 'sk',
  FUNCD_CONFIG_KEYS: 'LOG_LEVEL',
  FUNCD_SECRET_KEYS: 'MODE,STRIPE_KEY',
  FUNCD_CATALOG_LAKE_URL: '127.0.0.1:9100',
  FUNCD_CATALOG_LAKE_TOKEN: 'tok-a',
};

test('scenario ctx-config-get: config.get returns a bound key and list() the listed keys', () => {
  const config = makeConfig(env);
  assert.equal(config.get('LOG_LEVEL'), 'debug');
  assert.deepEqual(config.list(), ['LOG_LEVEL']);
});

test('scenario ctx-secret-get: secret.get returns a bound secret, which config.get does not', async () => {
  const secret = makeSecret(env);
  assert.equal(await secret.get('STRIPE_KEY'), 'sk');
  assert.deepEqual(await secret.list(), ['MODE', 'STRIPE_KEY']);
  assert.equal(makeConfig(env).get('STRIPE_KEY'), undefined);
});

test('scenario ctx-secret-shadows-config: a key a secret overrides reads only through secret', async () => {
  assert.equal(await makeSecret(env).get('MODE'), 'prod');
  assert.equal(makeConfig(env).get('MODE'), undefined);
});

test('scenario ctx-unbound-key: an unbound variable reads as undefined', async () => {
  assert.equal(makeConfig(env).get('PATH'), undefined);
  assert.equal(await makeSecret(env).get('FUNCD_INVOKE_SOCKET'), undefined);
});

test('scenario ctx-catalog-get: catalog.get returns the URL and token, and throws naming an unbound alias', () => {
  const catalog = makeCatalog(env);
  assert.deepEqual(catalog.get('lake'), { url: '127.0.0.1:9100', token: 'tok-a' });
  assert.throws(() => catalog.get('other'), /"other"/);
});

test('an absent or empty key list is no keys', async () => {
  for (const list of [{}, { FUNCD_CONFIG_KEYS: '', FUNCD_SECRET_KEYS: '' }]) {
    const e = { ...list, LOG_LEVEL: 'debug', STRIPE_KEY: 'sk' };
    assert.deepEqual(makeConfig(e).list(), []);
    assert.equal(makeConfig(e).get('LOG_LEVEL'), undefined);
    assert.deepEqual(await makeSecret(e).list(), []);
    assert.equal(await makeSecret(e).get('STRIPE_KEY'), undefined);
  }
});

test('the clients read the environment at call time', () => {
  const live: Record<string, string> = { FUNCD_CONFIG_KEYS: 'A', A: '1' };
  const config = makeConfig(live);
  assert.equal(config.get('A'), '1');
  live.A = '2';
  assert.equal(config.get('A'), '2');
});

test('scenario ctx-pooled-member: each member reads its own catalog token and the pool config and secrets', async (t) => {
  const shared = {
    LOG_LEVEL: 'debug',
    STRIPE_KEY: 'sk',
    FUNCD_CONFIG_KEYS: 'LOG_LEVEL',
    FUNCD_SECRET_KEYS: 'STRIPE_KEY',
  };
  const prev = Object.fromEntries(Object.keys(shared).map((k) => [k, process.env[k]]));
  Object.assign(process.env, shared, { FUNCD_CATALOG_LAKE_URL: '127.0.0.1:9100' });
  t.after(() => {
    for (const [k, v] of Object.entries(prev)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    delete process.env.FUNCD_CATALOG_LAKE_URL;
  });
  const handler =
    'export async function handle(ctx) { return { lake: ctx.catalog.get("lake"), level: ctx.config.get("LOG_LEVEL"), key: await ctx.secret.get("STRIPE_KEY") }; }';
  const [a, b] = writeHandlers(t, { a: handler, b: handler });
  const pool = createPool([
    { ...a, env: { FUNCD_CATALOG_LAKE_TOKEN: 'tok-a' } },
    { ...b, env: { FUNCD_CATALOG_LAKE_TOKEN: 'tok-b' } },
  ]);
  await pool.ready;
  try {
    for (const [name, token] of [
      ['a', 'tok-a'],
      ['b', 'tok-b'],
    ]) {
      const r = await post(pool.app, name, {});
      assert.equal(r.status, 200);
      assert.deepEqual(await r.json(), { lake: { url: '127.0.0.1:9100', token }, level: 'debug', key: 'sk' });
    }
  } finally {
    await pool.close();
  }
});
