// Scenario tests for oidc-shim-principal (funcd ADR-0335): funcd's edge sets four headers for a call it signed in. A
// handler reads ctx.principal from them, solo and pooled, and an http app receives them while every other x-funcd-*
// header stays in the shim.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { setTimeout as sleep } from 'node:timers/promises';

import type { Hono } from 'hono';

import { createPool } from '../src/pool.ts';
import { createApp, createHttpApp, type FunctionContext, http } from '../src/shim.ts';
import { post, writeHandlers } from './poolapp.ts';

const claims = {
  iss: 'https://login.example.com',
  sub: 'user-7',
  aud: 'app',
  name: 'Zoë Ångström',
  email: 'zoe@example.com',
};
const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64');
// Node reads each byte of a header value as one Latin-1 character, so a UTF-8 value arrives as its bytes.
const asReceived = (text: string) => Buffer.from(text, 'utf8').toString('latin1');

/** The headers funcd's edge sets for a browser session of the user id. */
const signedIn = (id = 'user-7'): Record<string, string> => ({
  'x-funcd-principal': encode({ provider: 'sso', claims: { ...claims, sub: id } }),
  'x-funcd-principal-id': id,
  'x-funcd-principal-name': asReceived('Zoë Ångström'),
  'x-funcd-id-token': 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1c2VyLTcifQ.c2lnbmF0dXJl',
});
const principal = { provider: 'sso', id: 'user-7', name: 'Zoë Ångström', claims };

/** who sends app one call with headers and returns the principal its handler read, null for none. */
async function who(app: Hono, headers: Record<string, string>): Promise<unknown> {
  const res = await app.request('/', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: '{}',
  });
  assert.equal(res.status, 200, 'the call goes on');
  return ((await res.json()) as { principal: unknown }).principal;
}

const whoApp = () => createApp((ctx) => ({ principal: ctx.principal ?? null }));

test('scenario oidc-shim-principal: a signed-in call gives the handler ctx.principal', async () => {
  assert.deepEqual(await who(whoApp(), signedIn()), principal);
  const { 'x-funcd-principal-name': _, ...nameless } = signedIn();
  assert.deepEqual(await who(whoApp(), nameless), { provider: 'sso', id: 'user-7', claims });
});

test('scenario oidc-shim-principal: a call without the principal headers gives the handler none', async () => {
  assert.equal(await who(whoApp(), {}), null);
  const { 'x-funcd-principal': _, ...rest } = signedIn();
  assert.equal(await who(whoApp(), rest), null, 'no X-Funcd-Principal, no principal');
});

test('scenario oidc-shim-principal: a malformed X-Funcd-Principal gives none and the call goes on', async () => {
  const padded = encode({ provider: 'sso', claims: { sub: 'ü~' } });
  const slashed = encode({ provider: 'sso', claims: { sub: 'user-7?' } });
  assert.match(padded, /=$/);
  assert.match(slashed, /\//);
  const malformed: Record<string, string> = {
    'no Base64': 'not base64!',
    'Base64 without its padding': padded.replace(/=+$/, ''),
    'URL-safe Base64': slashed.replaceAll('/', '_'),
    'no JSON': Buffer.from('provider=sso').toString('base64'),
    'no UTF-8': Buffer.concat([
      Buffer.from('{"provider":"s'),
      Buffer.from([0xff]),
      Buffer.from('o","claims":{}}'),
    ]).toString('base64'),
    'a JSON array': encode([{ provider: 'sso', claims }]),
    'no provider': encode({ claims }),
    'an empty provider': encode({ provider: '', claims }),
    'claims that are no object': encode({ provider: 'sso', claims: 'sub=user-7' }),
    'two values': `${encode({ provider: 'sso', claims })}, ${encode({ provider: 'sso', claims })}`,
  };
  const app = whoApp();
  for (const [what, value] of Object.entries(malformed)) {
    assert.equal(await who(app, { ...signedIn(), 'x-funcd-principal': value }), null, what);
  }
  assert.equal(await who(app, { 'x-funcd-principal': signedIn()['x-funcd-principal'] }), null, 'no id');
});

test('scenario oidc-shim-principal: calls that overlap each read their own principal', async () => {
  const app = createApp(async (ctx, event) => {
    await sleep((event.data as { wait: number }).wait);
    return { id: ctx.principal?.id ?? null };
  });
  const send = async (headers: Record<string, string>, wait: number) =>
    (await app.request('/', { method: 'POST', headers, body: JSON.stringify({ data: { wait } }) })).json();
  const calls = await Promise.all([send(signedIn('user-a'), 50), send(signedIn('user-b'), 0), send({}, 0)]);
  assert.deepEqual(calls, [{ id: 'user-a' }, { id: 'user-b' }, { id: null }]);
});

test('scenario oidc-shim-principal: an http app receives the four principal headers and no other x-funcd-* header', async () => {
  let seen: Record<string, string> = {};
  let read: FunctionContext['principal'];
  const app = createHttpApp(
    http({
      fetch: (request, env) => {
        seen = {};
        request.headers.forEach((value, key) => {
          if (key.startsWith('x-funcd-')) seen[key] = value;
        });
        read = env.funcd.principal;
        return new Response(null, { status: 204 });
      },
    }),
  );
  const funcd = {
    'x-funcd-timeout-ms': '5000',
    'x-funcd-span-id': 'aaaaaaaaaaaaaaaa',
    'x-funcd-span-links': 'bbbbbbbbbbbbbbbb',
    'x-funcd-member': 'other',
  };
  assert.equal((await app.request('/me', { headers: { ...signedIn(), ...funcd } })).status, 204);
  assert.deepEqual(seen, signedIn());
  assert.deepEqual(read, principal);
  assert.equal((await app.request('/me', { headers: funcd })).status, 204);
  assert.deepEqual(seen, {});
  assert.equal(read, undefined);
});

test('scenario oidc-shim-principal: a pooled handler reads ctx.principal', async (t) => {
  const pool = createPool(
    writeHandlers(t, { who: 'export function handle(ctx) { return { principal: ctx.principal ?? null }; }' }),
  );
  const pooled = async (headers: Record<string, string>) => {
    const res = await post(pool.app, 'who', {}, headers);
    assert.equal(res.status, 200);
    return ((await res.json()) as { principal: unknown }).principal;
  };
  try {
    await pool.ready;
    assert.deepEqual(await pooled(signedIn()), principal);
    assert.equal(await pooled({}), null);
    assert.equal(await pooled({ ...signedIn(), 'x-funcd-principal': 'not base64!' }), null);
  } finally {
    await pool.close();
  }
});
