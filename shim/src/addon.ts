// context.addon (funcd ADR-0338): a call of the engine of an add-on object that the function binds, through funcd's
// worker-node local API, which checks the binding and the path before it forwards the request.
import http from 'node:http';

import { type InvokeOptions, MEMBER_HEADER } from './invoke.ts';
import { startClientSpan } from './tracespan.ts';

/** The local API header that marks an answer as the engine's; a call that funcd refused carries none. */
export const ADDON_REPLY_HEADER = 'x-funcd-addon-reply';

/** The statuses whose Response carries no body. */
const NULL_BODY = new Set([101, 204, 205, 304]);

/** funcd's problem, the body of a refusal (RFC 9457). */
export interface AddonProblem {
  type: string;
  title: string;
  status: number;
  detail: string;
}

/** A call that funcd refused before it reached the engine. */
export class AddonError extends Error {
  /** The HTTP status of the refusal. */
  readonly status: number;
  /** funcd's problem. */
  readonly problem: AddonProblem;
  /** The seconds to wait before a retry, from the Retry-After of a 503, as while the namespace is held. */
  readonly retryAfter?: number;

  constructor(alias: string, problem: AddonProblem, retryAfter?: number) {
    super(`context.addon.fetch("${alias}") failed: ${problem.status} ${problem.detail}`);
    this.name = 'AddonError';
    this.status = problem.status;
    this.problem = problem;
    this.retryAfter = retryAfter;
  }
}

export interface AddonClient {
  /** Sends an HTTP request to the engine of the add-on object that the function binds under alias, through funcd, and
   *  returns the engine's answer as a Response, whatever its status; funcd follows no redirect. path starts with "/"
   *  and may carry a query, and init sets the method, the headers and the body, as for the global fetch. Rejects with
   *  an AddonError when funcd refuses the call: 403 for an alias the function does not bind or a call a Policy
   *  forbids, 404 for a path the object's edge entry does not serve, 413 for a request or an answer body over
   *  addons.callPayloadLimit, 1 MiB by default, and 503 while the object is not Ready, while its namespace is held
   *  (with retryAfter), or when the engine does not answer within addons.callTimeout, 10 seconds by default. */
  fetch(alias: string, path: string, init?: RequestInit): Promise<Response>;
}

/** Build context.addon: fetch sends the request to /addon/<alias><path> on the local API, as the pool member when one
 *  is given, with the CLIENT span's traceparent. */
export function makeAddon(opts: InvokeOptions = {}): AddonClient {
  return {
    async fetch(alias, path, init) {
      const span = startClientSpan(opts.sink ?? null, alias, opts.member, opts.bound);
      const fail = (err: Error, httpStatus?: number): never => {
        span?.end('ERROR', err.message, httpStatus);
        throw err;
      };
      const socketPath = process.env.FUNCD_INVOKE_SOCKET;
      if (!socketPath) {
        return fail(new Error('context.addon: worker-node local API socket unavailable (FUNCD_INVOKE_SOCKET unset)'));
      }
      if (!path.startsWith('/')) {
        return fail(new Error(`context.addon.fetch("${alias}"): path "${path}" must start with "/"`));
      }
      const request = new Request(new URL(path, 'http://funcd.local'), init);
      const body = request.body ? Buffer.from(await request.arrayBuffer()) : undefined;
      const headers: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        headers[key] = value;
      });
      if (body) headers['content-length'] = String(body.length);
      if (opts.member) headers[MEMBER_HEADER] = opts.member;
      if (span) headers.traceparent = span.traceparent;
      const target = new URL(request.url);
      const reply = await new Promise<{ status: number; headers: Headers; body: Buffer }>((resolve, reject) => {
        const req = http.request(
          {
            socketPath,
            path: `/addon/${encodeURIComponent(alias)}${target.pathname}${target.search}`,
            method: request.method,
            headers,
          },
          (res) => {
            const chunks: Buffer[] = [];
            res.on('error', (err) =>
              reject(
                new Error(`context.addon.fetch("${alias}") failed: connection closed before the reply ended`, {
                  cause: err,
                }),
              ),
            );
            res.on('data', (c: Buffer) => chunks.push(c));
            res.on('end', () => {
              const replyHeaders = new Headers();
              for (const [key, value] of Object.entries(res.headers)) {
                for (const v of Array.isArray(value) ? value : [value]) {
                  if (v !== undefined) replyHeaders.append(key, v);
                }
              }
              resolve({ status: res.statusCode ?? 0, headers: replyHeaders, body: Buffer.concat(chunks) });
            });
          },
        );
        req.on('error', (err) =>
          reject(new Error(`context.addon.fetch("${alias}") failed: ${err.message}`, { cause: err })),
        );
        req.end(body);
      }).catch((err: Error) => fail(err));
      if (!reply.headers.has(ADDON_REPLY_HEADER)) {
        return fail(refusal(alias, reply.status, reply.headers, reply.body), reply.status);
      }
      reply.headers.delete(ADDON_REPLY_HEADER);
      span?.end(reply.status >= 500 ? 'ERROR' : 'OK', '', reply.status);
      return new Response(NULL_BODY.has(reply.status) ? null : new Uint8Array(reply.body), {
        status: reply.status,
        headers: reply.headers,
      });
    },
  };
}

/** refusal is funcd's problem as an AddonError; a body that is no problem keeps its text as the detail. */
function refusal(alias: string, status: number, headers: Headers, body: Buffer): AddonError {
  const text = body.toString('utf8');
  let problem: AddonProblem = { type: 'about:blank', title: '', status, detail: text };
  try {
    const parsed = JSON.parse(text) as Partial<AddonProblem>;
    problem = {
      type: parsed.type ?? 'about:blank',
      title: parsed.title ?? '',
      status: parsed.status ?? status,
      detail: parsed.detail ?? '',
    };
  } catch {
    // not a problem body: keep its text
  }
  const after = status === 503 ? Number.parseInt(headers.get('retry-after') ?? '', 10) : Number.NaN;
  return new AddonError(alias, problem, Number.isFinite(after) ? after : undefined);
}
