// funcd per-invocation context carrier (ADR-0101). A tiny AsyncLocalStorage the shim sets around
// each handler call so BOTH the trace span (tracespan.ts) and the log capture (funclog.ts read it in
// buildRecord) tag their records with the SAME inv/trace/span ids — the logs↔trace correlation that
// closes ADR-0081's provenance open question. ADR-0081 specified this carrier but never shipped it
// (inv/trace_id/span_id were hardcoded empty); this is where it is introduced. It also carries the
// call's deadline, which ctx.remainingMs() reads (ADR-0226).
//
// Built-ins only (node:async_hooks) so it bundles into shim.mjs/pool.mjs.
import { AsyncLocalStorage } from 'node:async_hooks';

/** The identity of the currently-executing invocation. */
export interface InvContext {
  inv: string; // per-invocation id (hex16)
  traceId: string; // hex32 — adopted from traceparent or minted (root)
  spanId: string; // hex16 — this invocation's span
  parentId: string; // hex16 — the traceparent span-id, "" for a root
  deadline?: number; // the nowMs() value at which X-Funcd-Timeout-Ms runs out; none without a valid header
}

/** invStore holds the active InvContext for the duration of a handler call (and its async
 *  continuations). Per-thread: each worker/process imports its own instance, which is correct —
 *  the context is set and read within the same execution. */
export const invStore = new AsyncLocalStorage<InvContext>();

/** currentInv returns the active invocation context, or undefined outside an invocation (e.g. a
 *  pre-invocation log line) — in which case log records emit empty inv/trace/span (back-compat). */
export function currentInv(): InvContext | undefined {
  return invStore.getStore();
}

// setTimeout's largest delay (2^31 - 1 ms) less the pool's 1 s margin.
const maxTimeoutMs = 2_147_482_647;

/** parseTimeoutMs reads a timeout in milliseconds: a decimal integer in 1..2_147_482_647, else undefined. */
export function parseTimeoutMs(value: string | undefined): number | undefined {
  if (value === undefined || !/^[0-9]+$/.test(value)) return undefined;
  const ms = Number(value);
  return ms >= 1 && ms <= maxTimeoutMs ? ms : undefined;
}

/** nowMs reads the deadline clock in milliseconds. process.hrtime is one monotonic clock for every thread of the
 *  process, so a deadline the pool host sets holds in the member's worker (ADR-0226). */
export function nowMs(): number {
  return Number(process.hrtime.bigint()) / 1e6;
}

/** deadlineFrom turns a valid X-Funcd-Timeout-Ms (funcd ADR-0151) into the call's deadline; undefined without one. */
export function deadlineFrom(header: string | undefined): number | undefined {
  const ms = parseTimeoutMs(header);
  return ms === undefined ? undefined : nowMs() + ms;
}

/** remainingMs is FunctionContext.remainingMs: the whole milliseconds left before the active call's deadline, floored
 *  at 0; null without a deadline. */
export function remainingMs(): number | null {
  const deadline = currentInv()?.deadline;
  return deadline === undefined ? null : Math.max(0, Math.floor(deadline - nowMs()));
}
