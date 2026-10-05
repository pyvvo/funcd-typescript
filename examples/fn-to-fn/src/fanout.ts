import type { Handler } from '@funcd-dev/shim';

import type { FuncInput as HoldInput, FuncOutput as HoldOutput } from './hold.ts';

/** What fanout accepts: how many calls to make at once, and how long hold keeps each (default 2000 ms). */
export interface FuncInput {
  n: number;
  ms?: number;
}

/** What fanout returns: the calls that succeeded, the calls the nested in-flight cap refused, and one refusal's message. */
export interface FuncOutput {
  ok: number;
  refused: number;
  detail: string;
}

// The fault Op the daemon names in a nested in-flight cap refusal (funcd ADR-0147).
const nestedCapOp = 'workernode.local.nested-cap';

/**
 * fanout — the CALLER of the fan-out demo (funcd ADR-0147). It declares the link `peer → hold` and calls
 * it `n` times at once. The daemon caps the nested calls in flight to one Function (invoke.maxNestedInFlight),
 * so the calls over the cap are refused with 429; fanout counts those and fails on any other error.
 */
export const handle: Handler<FuncInput, FuncOutput> = async (context, event) => {
  const { n, ms = 2000 } = event.data!;
  const calls = Array.from({ length: n }, () =>
    context.invoke<{ data: HoldInput }, HoldOutput>('peer', { data: { ms } }),
  );
  let ok = 0;
  let refused = 0;
  let detail = '';
  for (const result of await Promise.allSettled(calls)) {
    if (result.status === 'fulfilled') {
      ok++;
      continue;
    }
    const message = result.reason instanceof Error ? result.reason.message : String(result.reason);
    if (!message.includes(nestedCapOp)) {
      throw result.reason;
    }
    refused++;
    detail = message;
  }
  return { ok, refused, detail };
};
