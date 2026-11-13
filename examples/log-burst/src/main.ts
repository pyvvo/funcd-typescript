// log-burst: each call logs at least 100 items with console.log, a warning every 10th item and an
// error every 25th, then returns how many console calls it made.
//
// Authored in TypeScript against @funcd-dev/shim; `yarn build` (vite.config.ts) bundles it to
// log-burst.mjs.
import type { CloudEvent, FunctionContext } from '@funcd-dev/shim';

export interface FuncInput {
  /** How many items to log; fewer than 100 still logs 100. */
  items?: number;
  /** A batch label echoed into the structured logs. */
  batch?: string;
  /** When set, one more log call carries a value of this many bytes, to show a record cut at the bound. */
  big?: number;
}
export interface FuncOutput {
  emitted: number;
}

export function handle(_ctx: FunctionContext, event: CloudEvent<FuncInput>): FuncOutput {
  const items = Math.max(100, event.data?.items ?? 100); // at least 100 items
  const batch = event.data?.batch ?? 'default';
  let emitted = 0;

  // a line on standard output becomes an INFO record, one on standard error an ERROR record.
  process.stdout.write(`burst stdout ${batch}\n`);
  process.stderr.write(`burst stderr ${batch}\n`);
  if (event.data?.big) {
    console.log('big value', { big: 'x'.repeat(event.data.big) });
    emitted++;
  }

  for (let i = 0; i < items; i++) {
    // INFO: the object argument becomes the record's attributes, which funcdctl logs -o wide shows.
    console.log('processing item', { i, batch });
    emitted++;

    // a WARN record every 10th item and an ERROR record every 25th.
    if (i % 10 === 0) {
      console.warn('slow item', { i, batch, latencyMs: 120 });
      emitted++;
    }
    if (i % 25 === 0) {
      console.error('item failed', { i, batch, reason: 'simulated' });
      emitted++;
    }
  }

  // a final summary record, at INFO.
  console.log('burst complete', { batch, emitted });
  emitted++;

  return { emitted };
}
