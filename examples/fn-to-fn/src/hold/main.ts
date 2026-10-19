import type { Handler } from '@funcd-dev/shim';

/** What hold accepts: how long to hold the call, in milliseconds. */
export interface FuncInput {
  ms: number;
}

/** What hold returns: the milliseconds it held. */
export interface FuncOutput {
  held: number;
}

/**
 * hold — the CALLEE of the fan-out demo (funcd ADR-0147). It keeps each call in flight for `ms`, so
 * concurrent calls from fanout pile up against the daemon's per-target nested in-flight cap.
 */
export const handle: Handler<FuncInput, FuncOutput> = async (_context, event) => {
  const ms = event.data!.ms;
  await new Promise((resolve) => setTimeout(resolve, ms));
  return { held: ms };
};
