import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { CloudEvent, JobContext } from '@funcd-dev/shim';
import { handle, type JobInput, preview, settings } from '../src/main.ts';

// The author's unit tests run the handler against a fake context that keeps its log lines, with no wait.
settings.workMs = 0;

function fakeContext() {
  const lines: string[] = [];
  const ctx = {
    log: (...args: unknown[]) => lines.push(args.join(' ')),
    run: { name: 'report-1', job: 'report', revision: 'report-v1', phase: 'run', startedBy: 'dev' },
  } as unknown as JobContext;
  return { ctx, lines };
}

const event = (month: string): CloudEvent<JobInput> => ({
  id: '1',
  source: '/t',
  type: 'funcd.job.run',
  data: { month },
});

test('a report has one row for each day of its month', async () => {
  const { ctx } = fakeContext();
  assert.deepEqual(await handle(ctx, event('2026-10')), { month: '2026-10', rows: 31 });
  assert.deepEqual(await handle(ctx, event('2026-11')), { month: '2026-11', rows: 30 });
  assert.deepEqual(await handle(ctx, event('2028-02')), { month: '2028-02', rows: 29 });
});

test('a report logs its month with the name of its run', async () => {
  const { ctx, lines } = fakeContext();
  await handle(ctx, event('2026-10'));
  assert.deepEqual(lines, ['building the report of 2026-10 in run report-1']);
});

test('a month that is not YYYY-MM fails the run', async () => {
  const { ctx } = fakeContext();
  for (const month of ['2026-13', '2026-1', 'October']) {
    await assert.rejects(handle(ctx, event(month)), new RegExp(`month "${month}" is not YYYY-MM`));
  }
});

test("a run's preview answers what the report would hold, with no work", () => {
  const { ctx, lines } = fakeContext();
  assert.deepEqual(preview(ctx, { ...event('2026-10'), type: 'funcd.job.preview' }), { month: '2026-10', rows: 31 });
  assert.deepEqual(lines, [], 'a preview builds nothing');
  assert.throws(() => preview(ctx, event('October')), /month "October" is not YYYY-MM/);
});
