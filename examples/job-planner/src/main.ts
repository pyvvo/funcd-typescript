// planner: a Function that starts a run of the Job report for the month of its event and reads the run back, through
// the job binding of its Function (funcd ADR-0349). The run is named after the month, so a start sent again for one
// month, with its input, returns the run that the first start made instead of starting a second one.
//
// Authored in TypeScript against @funcd-dev/shim; `yarn build` (vite.config.ts) bundles it to planner.mjs.
import type { CloudEvent, FunctionContext } from '@funcd-dev/shim';

// #region types
export interface PlanInput {
  /** The month to report on, as YYYY-MM. */
  month: string;
}
export interface PlanOutput {
  /** The name of the run of report. */
  run: string;
  /** The run's phase when the planner read it back. */
  phase: string;
}
// #endregion types

// #region handler
export async function handle(ctx: FunctionContext, event: CloudEvent<PlanInput>): Promise<PlanOutput> {
  const month = event.data?.month ?? '';
  const run = await ctx.job.start('report', { month }, `report-${month}`);
  const { phase } = await ctx.job.get('report', run);
  return { run, phase };
}
// #endregion handler
