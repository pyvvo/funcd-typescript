import { test } from 'node:test';
import assert from 'node:assert/strict';

import type { CloudEvent, FunctionContext, SecretClient } from '@funcd-dev/shim';
import { handle as owner, type FuncInput as OwnerInput } from '../src/token-owner/main.ts';
import { handle as user, type FuncInput as UserInput } from '../src/token-user/main.ts';

// The author's unit tests run each handler against a fake context.secret over one Secret, demo-token. Like funcd, the
// fake lets only a writer change the Secret, refuses another function's put with the HTTP status 403, and takes the
// delete of a key that the Secret does not hold as no error. A write lands a tick later, so a handler that did not
// await it would read the old value.
const refused =
  'context.secret.put failed: 403 {"type":"urn:funcd:problem:forbidden","title":"Forbidden","status":403,' +
  '"detail":"cedar: forbidden by policy builtin/secret-single-writer"}';

function fakeSecrets(writer: boolean) {
  const data = new Map([['TOKEN', 'token-v1']]);
  const calls: string[] = [];
  const later = () => new Promise((resolve) => setImmediate(resolve));
  const secret: SecretClient = {
    async get(key) {
      calls.push(`get ${key}`);
      return data.get(key);
    },
    async list() {
      return [...data.keys()].sort();
    },
    async put(binding, key, value) {
      calls.push(`put ${binding} ${key}`);
      if (!writer) throw new Error(refused);
      await later();
      data.set(key, value);
    },
    async del(binding, key) {
      calls.push(`del ${binding} ${key}`);
      await later();
      data.delete(key);
    },
  };
  return { ctx: { log: () => {}, secret } as unknown as FunctionContext, data, calls };
}

const event = <T>(data: T): CloudEvent<T> => ({ id: '1', source: '/t', type: 'x', data });

test('token-owner writes TOKEN, waits for the write, and returns the value that it reads next', async () => {
  const { ctx, data, calls } = fakeSecrets(true);
  assert.deepEqual(await owner(ctx, event<OwnerInput>({ op: 'put', value: 'token-v2' })), { token: 'token-v2' });
  assert.equal(data.get('TOKEN'), 'token-v2');
  assert.deepEqual(calls, ['put demo-token TOKEN', 'get TOKEN']);
});

test('token-owner deletes TOKEN twice, the second time a key that the Secret no longer holds', async () => {
  const { ctx, data, calls } = fakeSecrets(true);
  assert.deepEqual(await owner(ctx, event<OwnerInput>({ op: 'delete' })), { token: null });
  assert.equal(data.has('TOKEN'), false);
  assert.deepEqual(calls, ['del demo-token TOKEN', 'del demo-token TOKEN', 'get TOKEN']);
});

test('token-user reads TOKEN and reports the refusal of its write', async () => {
  const { ctx, data } = fakeSecrets(false);
  assert.deepEqual(await user(ctx, event<UserInput>({ value: 'token-v2' })), { token: 'token-v1', error: refused });
  assert.equal(data.get('TOKEN'), 'token-v1');
});

test('token-user writes TOKEN once a role allows it, and returns the value that it reads next', async () => {
  const { ctx, data } = fakeSecrets(true);
  assert.deepEqual(await user(ctx, event<UserInput>({ value: 'token-v2' })), { token: 'token-v2' });
  assert.equal(data.get('TOKEN'), 'token-v2');
});
