import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { CloudEvent, FunctionContext, JobRunState } from '@funcd-dev/shim';
import { handle, type PlanInput } from '../src/main.ts';

// The author's unit tests run the handler against a fake ctx.job that keeps each start and answers each read.
function fakeContext() {
  const starts: { alias: string; input: unknown; name?: string }[] = [];
  const ctx = {
    job: {
      start: async (alias: string, input: unknown, name?: string) => {
        starts.push({ alias, input, name });
        return name ?? 'report-x1y2';
      },
      get: async (_alias: string, run: string): Promise<JobRunState> => ({
        name: run,
        phase: 'Pending',
        reason: '',
        startedAt: null,
        endedAt: null,
        result: null,
      }),
    },
  } as unknown as FunctionContext;
  return { ctx, starts };
}

const event = (month: string): CloudEvent<PlanInput> => ({ id: '1', source: '/t', type: 'plan', data: { month } });

test('the planner starts the month run of report, named after the month, and reads it back', async () => {
  const { ctx, starts } = fakeContext();
  assert.deepEqual(await handle(ctx, event('2026-10')), { run: 'report-2026-10', phase: 'Pending' });
  assert.deepEqual(starts, [{ alias: 'report', input: { month: '2026-10' }, name: 'report-2026-10' }]);
});

test('an event sent again starts the run under the same name, with the same input', async () => {
  const { ctx, starts } = fakeContext();
  await handle(ctx, event('2026-11'));
  await handle(ctx, event('2026-11'));
  assert.equal(starts.length, 2);
  assert.deepEqual(starts[0], starts[1], 'funcd answers the second start with the run that the first made');
});
