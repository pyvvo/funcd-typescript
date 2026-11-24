// report: a Job's handler that reports on one month. It logs the month with the name of its run, works for a few
// seconds, so that a cancel can catch the run while it runs, and returns one row for each day of the month. Its
// preview answers the same at once, for a person to approve when the Job has no approval.bypass.
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

/** rowsOf is the number of days of month, YYYY-MM; any other month fails the call. */
function rowsOf(month: string): number {
  const [year, mm] = month.split('-').map(Number);
  if (!/^\d{4}-\d{2}$/.test(month) || mm < 1 || mm > 12) {
    throw new Error(`month "${month}" is not YYYY-MM`);
  }
  // Day 0 of the next month is the last day of this one.
  return new Date(Date.UTC(year, mm, 0)).getUTCDate();
}

// #region handler
export async function handle(ctx: JobContext, event: CloudEvent<JobInput>): Promise<JobOutput> {
  const month = event.data?.month ?? '';
  const rows = rowsOf(month);
  ctx.log(`building the report of ${month} in run ${ctx.run.name}`);
  await new Promise((resolve) => setTimeout(resolve, settings.workMs));
  return { month, rows };
}
// #endregion handler

// #region preview
/** A run's preview, which a person approves before a Job without approval.bypass runs (funcd ADR-0348): what the
 *  report would hold, at once and with no work. */
export function preview(_ctx: JobContext, event: CloudEvent<JobInput>): JobOutput {
  const month = event.data?.month ?? '';
  return { month, rows: rowsOf(month) };
}
// #endregion preview
