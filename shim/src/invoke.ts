// Synchronous fn-to-fn invoke over the worker-node local API (HTTP-over-UDS, ADR-0064). The
// platform bind-mounts the per-sandbox socket and provides its path via FUNCD_INVOKE_SOCKET; the
// handler calls context.invoke(alias, input) and the platform brokers the call to the linked target.
import http from 'node:http';

import type { Sink } from './funclog.ts';
import { startClientSpan } from './tracespan.ts';

/** Build the context.invoke implementation. The returned function POSTs `input` to
 *  /invoke/<alias> over the worker-node UDS and resolves the target's JSON output, or rejects on a
 *  non-2xx (no link → 403, unknown target → 404, bad input → 422, the target's nested in-flight cap
 *  reached → 429, target down/timeout → 503) or on a 2xx body that is not JSON. */
/** The local API request header that names the calling pool member; funcd serves the call as that
 *  member when it belongs to the pool, else 403. A solo sandbox sends none. */
export const MEMBER_HEADER = 'X-Funcd-Member';

export interface InvokeOptions {
  /** The pool member making the calls; unset in the solo shim. */
  member?: string;
  /** The telemetry channel the CLIENT span of each call is written to (ADR-0165); null or unset ⇒ the
   *  traceparent is still sent, no span line is written. */
  sink?: Sink | null;
  /** The span record bound (FUNCD_FUNCLOG_MAX_RECORD_BYTES, ADR-0168); unset ⇒ the default. */
  bound?: number;
}

export function makeInvoke(
  opts: InvokeOptions = {},
): <I = unknown, O = unknown>(alias: string, input: I) => Promise<O> {
  return <I, O>(alias: string, input: I): Promise<O> =>
    new Promise<O>((resolve, reject) => {
      // ADR-0165: the CLIENT span brackets the whole call, so it opens before any check that can fail.
      const span = startClientSpan(opts.sink ?? null, alias, opts.member, opts.bound);
      const fail = (err: Error, httpStatus?: number) => {
        span?.end('ERROR', err.message, httpStatus);
        reject(err);
      };
      const socketPath = process.env.FUNCD_INVOKE_SOCKET;
      if (!socketPath) {
        fail(new Error('context.invoke: worker-node local API socket unavailable (FUNCD_INVOKE_SOCKET unset)'));
        return;
      }
      const body = JSON.stringify(input ?? null);
      const headers: Record<string, number | string> = {
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(body),
      };
      if (opts.member) headers[MEMBER_HEADER] = opts.member;
      if (span) headers.traceparent = span.traceparent;
      const req = http.request(
        {
          socketPath,
          path: `/invoke/${encodeURIComponent(alias)}`,
          method: 'POST',
          headers,
        },
        (res) => {
          const chunks: Buffer[] = [];
          const status = res.statusCode ?? 0;
          // A connection that drops mid-body errors the response, not the request, and never ends it.
          res.on('error', (err) =>
            fail(
              new Error(`context.invoke("${alias}") failed: connection closed before the reply ended`, { cause: err }),
              status,
            ),
          );
          res.on('data', (c: Buffer) => chunks.push(c));
          res.on('end', () => {
            const text = Buffer.concat(chunks).toString('utf8');
            if (status >= 200 && status < 300) {
              // This listener runs outside the Promise executor: a parse error thrown here would be uncaught.
              let out: O;
              try {
                out = (text ? JSON.parse(text) : null) as O;
              } catch (err) {
                fail(
                  new Error(`context.invoke("${alias}") failed: ${status} reply is not JSON: ${text}`, { cause: err }),
                  status,
                );
                return;
              }
              span?.end('OK', '', status);
              resolve(out);
            } else {
              fail(new Error(`context.invoke("${alias}") failed: ${status} ${text}`), status);
            }
          });
        },
      );
      req.on('error', (err) => fail(new Error(`context.invoke("${alias}") failed: ${err.message}`, { cause: err })));
      req.end(body);
    });
}
