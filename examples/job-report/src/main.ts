// report: a Job's handler that reports on one month. It logs the month with the name of its run, works for a few
// seconds, so that a cancel can catch the run while it runs, and returns one row for each day of the month.
//
// Authored in TypeScript against @funcd-dev/shim; `yarn build` (vite.config.ts) bundles it to report.mjs.
import type { CloudEvent, JobContext } from '@funcd-dev/shim';

// #region types
export interface JobInput {
  /** The month to report on, as YYYY-MM. */
  month: string;
}
export interface JobOutput {
  month: string;
  /** One row for each day of the month. */
  rows: number;
}
// #endregion types

/** How long a report works; the tests set it to 0. */
export const settings = { workMs: 3000 };

// #region handler
export async function handle(ctx: JobContext, event: CloudEvent<JobInput>): Promise<JobOutput> {
  const month = event.data?.month ?? '';
  const [year, mm] = month.split('-').map(Number);
  if (!/^\d{4}-\d{2}$/.test(month) || mm < 1 || mm > 12) {
    throw new Error(`month "${month}" is not YYYY-MM`);
  }
  ctx.log(`building the report of ${month} in run ${ctx.run.name}`);
  await new Promise((resolve) => setTimeout(resolve, settings.workMs));
  // Day 0 of the next month is the last day of this one.
  return { month, rows: new Date(Date.UTC(year, mm, 0)).getUTCDate() };
}
// #endregion handler
