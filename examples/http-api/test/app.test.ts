import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { FunctionContext } from '@funcd-dev/shim';
import { app } from '../src/app.ts';

// The author's unit tests call the Hono app directly; the shim's adapter and the edge are proven by funcd's e2e tests
// and the http-api lane. The context only needs log here.
const env = { funcd: { log: () => {} } as unknown as FunctionContext };
const json = (body: unknown) => ({
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

test('the devices API creates, reads, updates, lists and deletes a device', async () => {
  const created = await app.request('/devices', json({ name: 'truck-7' }), env);
  assert.equal(created.status, 201);
  const device = (await created.json()) as { id: string; name: string };
  assert.equal(device.name, 'truck-7');
  assert.equal(created.headers.get('location'), `/devices/${device.id}`);

  assert.deepEqual(await (await app.request(`/devices/${device.id}`, {}, env)).json(), device);
  const put = await app.request(`/devices/${device.id}`, { ...json({ name: 'van-2' }), method: 'PUT' }, env);
  assert.deepEqual(await put.json(), { id: device.id, name: 'van-2' });
  assert.deepEqual(await (await app.request('/devices', {}, env)).json(), [{ id: device.id, name: 'van-2' }]);

  assert.equal((await app.request(`/devices/${device.id}`, { method: 'DELETE' }, env)).status, 204);
  assert.equal((await app.request(`/devices/${device.id}`, {}, env)).status, 404);
});

test('a device without a name is refused with 400', async () => {
  const res = await app.request('/devices', json({ name: '' }), env);
  assert.equal(res.status, 400);
});

test('the export streams one line per device', async () => {
  await app.request('/devices', json({ name: 'a' }), env);
  await app.request('/devices', json({ name: 'b' }), env);
  const lines = (await (await app.request('/devices/export', {}, env)).text()).trim().split('\n');
  assert.equal(lines.length >= 2, true);
  assert.equal((JSON.parse(lines[lines.length - 1]) as { name: string }).name, 'b');
});

test('the list filters by name, and a reply carries the request id it was sent', async () => {
  await app.request('/devices', json({ name: 'crane-1' }), env);
  const res = await app.request('/devices?name=crane-1', { headers: { 'x-request-id': 'req-1' } }, env);
  assert.equal(res.headers.get('x-request-id'), 'req-1');
  assert.deepEqual(
    ((await res.json()) as { name: string }[]).map((d) => d.name),
    ['crane-1'],
  );
});

test('firmware is stored and served byte for byte, and purge removes every device', async () => {
  const device = (await (await app.request('/devices', json({ name: 'drone-4' }), env)).json()) as { id: string };
  const image = new Uint8Array([0, 255, 13, 10, 128]);
  const put = await app.request(`/devices/${device.id}/firmware`, { method: 'PUT', body: image }, env);
  assert.equal(put.status, 204);
  const got = await app.request(`/devices/${device.id}/firmware`, {}, env);
  assert.deepEqual(new Uint8Array(await got.arrayBuffer()), image);

  const purge = await app.request('/devices/purge', { method: 'POST' }, env);
  assert.equal(((await purge.json()) as { purged: number }).purged > 0, true);
  assert.deepEqual(await (await app.request('/devices', {}, env)).json(), []);
});
