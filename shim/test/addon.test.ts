// context.addon.fetch (funcd ADR-0338): the call goes to /addon/<alias><path> on the local API, the engine's answer
// comes back as a Response, and funcd's refusal rejects with an AddonError.
import assert from 'node:assert';
import { test } from 'node:test';

import { AddonError, makeAddon } from '../src/addon.ts';
import { fakeDependencies } from './localapi.ts';

test('fetch sends the request through funcd and returns the engine answer', async (t) => {
  const api = await fakeDependencies(t, () => ({
    status: 201,
    body: '{"lengthMin":16}',
    headers: { 'x-funcd-addon-reply': '1', 'x-policy': 'strict' },
  }));
  const res = await makeAddon({ member: 'rauthy-settings' }).fetch('idp', '/auth/v1/password_policy?x=1', {
    method: 'PUT',
    headers: { 'api-key': 'k' },
    body: '{"lengthMin":16}',
  });
  assert.equal(res.status, 201);
  assert.equal(res.headers.get('x-policy'), 'strict');
  assert.equal(res.headers.get('x-funcd-addon-reply'), null, 'the reply header is funcd’s, not the engine’s');
  assert.equal(await res.text(), '{"lengthMin":16}');
  assert.deepEqual(api.calls, ['PUT /addon/idp/auth/v1/password_policy?x=1 rauthy-settings']);
  assert.deepEqual(api.bodies, ['{"lengthMin":16}']);
});

test('an engine answer of any status resolves', async (t) => {
  await fakeDependencies(t, () => ({ status: 404, body: 'no user', headers: { 'x-funcd-addon-reply': '1' } }));
  const res = await makeAddon().fetch('idp', '/auth/v1/users/x');
  assert.equal(res.status, 404);
  assert.equal(await res.text(), 'no user');
});

test('a refusal of funcd rejects with its problem, and a 503 with its Retry-After', async (t) => {
  await fakeDependencies(t, (_m, url) =>
    url.includes('held')
      ? {
          status: 503,
          body: '{"type":"urn:funcd:problem:unavailable","title":"Service Unavailable","status":503,"detail":"held"}',
          headers: { 'retry-after': '30' },
        }
      : {
          status: 403,
          body: '{"type":"urn:funcd:problem:forbidden","title":"Forbidden","status":403,"detail":"no binding"}',
        },
  );
  await assert.rejects(makeAddon().fetch('other', '/x'), (err: AddonError) => {
    assert.ok(err instanceof AddonError);
    assert.equal(err.status, 403);
    assert.equal(err.problem.detail, 'no binding');
    assert.equal(err.retryAfter, undefined);
    return true;
  });
  await assert.rejects(makeAddon().fetch('idp', '/held'), (err: AddonError) => {
    assert.equal(err.status, 503);
    assert.equal(err.retryAfter, 30);
    return true;
  });
});

test('a path that does not start with / is refused before any call', async (t) => {
  const api = await fakeDependencies(t, () => ({ status: 200, body: '' }));
  await assert.rejects(makeAddon().fetch('idp', 'auth/v1'), /must start with "\/"/);
  assert.deepEqual(api.calls, []);
});
