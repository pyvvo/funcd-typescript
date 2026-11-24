// context.job (funcd ADR-0349): start sends POST /job/<alias> and returns the run's name; get sends
// GET /job/<alias>/<run>; funcd's refusal rejects with a JobError.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { JobError, makeJob } from '../src/job.ts';
import { fakeDependencies } from './localapi.ts';

test('start sends the input, and the name when given, and returns the run', async (t) => {
  const api = await fakeDependencies(t, () => ({ status: 201, body: '{"run":"tofu-gen-7"}' }));
  const job = makeJob('planner');
  assert.equal(await job.start('stack', { op: 'plan' }, 'tofu-gen-7'), 'tofu-gen-7');
  assert.equal(await job.start('stack', { op: 'plan' }), 'tofu-gen-7');
  assert.equal(await job.start('stack'), 'tofu-gen-7');
  assert.deepEqual(api.calls, ['POST /job/stack planner', 'POST /job/stack planner', 'POST /job/stack planner']);
  assert.deepEqual(
    api.bodies.map((b) => JSON.parse(b)),
    [{ input: { op: 'plan' }, name: 'tofu-gen-7' }, { input: { op: 'plan' } }, {}],
  );
});

test('a start sent again that funcd answers 200 returns the run', async (t) => {
  await fakeDependencies(t, () => ({ status: 200, body: '{"run":"tofu-gen-7"}' }));
  assert.equal(await makeJob().start('stack', {}, 'tofu-gen-7'), 'tofu-gen-7');
});

test('get reads the run', async (t) => {
  const state = {
    name: 'tofu-1',
    phase: 'Succeeded',
    reason: '',
    startedAt: '2026-11-24T09:00:00Z',
    result: { applied: 2 },
  };
  const api = await fakeDependencies(t, () => ({ status: 200, body: JSON.stringify(state) }));
  assert.deepEqual(await makeJob().get('stack', 'tofu-1'), state);
  assert.deepEqual(api.calls, ['GET /job/stack/tofu-1 -']);
});

test("funcd's refusal rejects with a JobError and its problem", async (t) => {
  await fakeDependencies(t, (_m, url) => ({
    status: url.endsWith('/x') ? 404 : 409,
    body: JSON.stringify({
      type: 'urn:funcd:problem:conflict',
      title: 'Conflict',
      status: url.endsWith('/x') ? 404 : 409,
      detail: 'taken',
    }),
  }));
  await assert.rejects(makeJob().start('stack', {}, 'tofu-gen-7'), (err: unknown) => {
    assert.ok(err instanceof JobError);
    assert.equal(err.status, 409);
    assert.equal(err.problem.detail, 'taken');
    assert.match(err.message, /context.job.start\("stack"\) failed: 409 taken/);
    return true;
  });
  await assert.rejects(makeJob().get('stack', 'x'), (err: unknown) => err instanceof JobError && err.status === 404);
});

test('a refusal whose body is no problem keeps its text', async (t) => {
  await fakeDependencies(t, () => ({ status: 403, body: 'denied' }));
  await assert.rejects(makeJob().start('other', {}), (err: unknown) => {
    assert.ok(err instanceof JobError);
    assert.equal(err.problem.detail, 'denied');
    return true;
  });
});
