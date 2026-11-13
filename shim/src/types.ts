// The funcd function programming model (typed contract). A function module exports
// `handle(context, event)`, which the runtime shim invokes once per CloudEvent, or, for a Function with
// spec.protocol: http, `handle = http(app)`, which serves every request (funcd ADR-0243). Authors import these
// types for a typed handler signature + autocomplete.
import type { KVClient } from './kv.ts';
import type { BlobClient } from './blob.ts';
import type { SQLClient } from './sql.ts';
import type { ConfigClient } from './config.ts';
import type { SecretClient } from './secret.ts';
import type { LakeClient } from './lake.ts';

export type { KVClient, KVEntry, PutOptions } from './kv.ts';
export type { BlobClient, SignOptions } from './blob.ts';
export type {
  SQLClient,
  SQLExecResult,
  SQLParam,
  SQLParams,
  SQLRow,
  SQLStatement,
  SQLValues,
} from './sql.ts';
export type { ConfigClient } from './config.ts';
export type { SecretClient } from './secret.ts';
export type { LakeClient, LakeEndpoint } from './lake.ts';

/** A CloudEvent — the normalized trigger envelope (ADR-0023). */
export interface CloudEvent<T = unknown> {
  id: string;
  source: string;
  type: string;
  specversion?: string;
  time?: string;
  datacontenttype?: string;
  subject?: string;
  data?: T;
  /** Forward-compatible extension attributes. */
  [key: string]: unknown;
}

/** The per-invocation context the shim passes to the handler. */
export interface FunctionContext {
  /** Writes the arguments as one log line at level INFO, as console.log does. */
  log(...args: unknown[]): void;
  /** Calls the function that the link named alias targets, and returns its result parsed from JSON, or null when it
   *  returns nothing. The target's event.data is input, except that an object with a top-level `data` or
   *  `specversion` key is taken as the whole CloudEvent, so event.data is only its `data`: send such an object inside
   *  an envelope, as `{ specversion: '1.0', data: { data: [1], page: 2 } }`. The link's timeout, 30 seconds by
   *  default, bounds the call. Fails with the HTTP status 403 when the function declares no link named alias, 409 when
   *  the target serves HTTP, 422 when input does not match the target's contract, and the target's status when its
   *  handler fails, such as 500. */
  invoke<I = unknown, O = unknown>(alias: string, input: I): Promise<O>;
  /** Sends an HTTP request to the function that the link named alias targets, which serves HTTP, and returns its reply
   *  as a Response, whatever its status. path starts with "/" and may carry a query; init sets the method, the headers
   *  and the body, as for the global fetch. The request body and the reply are each at most 1 MiB, and the link's
   *  timeout, 30 seconds by default, bounds the call. Fails with the HTTP status 403 when the function declares no
   *  link named alias, and 409 when the target does not serve HTTP. */
  fetch(alias: string, path: string, init?: RequestInit): Promise<Response>;
  /** The key-value tables that the function binds, by alias: read, write and list their keys. */
  kv: KVClient;
  /** The Bucket prefixes that the function binds, by alias: read, write, delete and list their objects, whose keys are
   *  relative to the binding's prefix. */
  blob: BlobClient;
  /** The SQL databases that the function binds, by alias: query reads rows, queryValues keeps every column of a join,
   *  and execute writes in one transaction. A call fails with the HTTP status 503 while the database's engine is not
   *  Ready, or when a statement runs past funcd's SQL call timeout, 30 seconds by default. */
  sql: SQLClient;
  /** The keys of the ConfigMaps that the function binds, with the values that the worker got when it started. A key
   *  that starts with FUNCD_, or that a bound Secret also holds, is left out: ctx.secret reads the Secret's value. */
  config: ConfigClient;
  /** The keys and values of the Secrets that the function binds, which funcd reads at each get or list, with no cache,
   *  so a changed Secret shows at the next read. */
  secret: SecretClient;
  /** The Lakes that the function binds, by alias: the address of each Lake's gateway, and the token that the gateway
   *  accepts from the function. */
  lake: LakeClient;
  /** The whole milliseconds left before the call's deadline, 0 once it has passed, or null when the call has none. */
  remainingMs(): number | null;
}

/** A function handler: receives the context + CloudEvent, returns a response (or nothing). */
export type Handler<In = unknown, Out = unknown> = (
  context: FunctionContext,
  event: CloudEvent<In>,
) => Out | Promise<Out>;

/** An HTTP app (funcd ADR-0243): Hono, or any object whose fetch answers a Web Request. */
export interface HttpApp {
  fetch(request: Request, env: { funcd: FunctionContext }): Response | Promise<Response>;
}

/** The tag http(app) puts on its handler. A global symbol, so the copy of http() bundled into a function and the
 *  shim's own agree. */
export const HTTP_HANDLER: unique symbol = Symbol.for('funcd.http');

/** What a Function with spec.protocol: http exports: the shim calls it with each request it rebuilds. */
export type HttpHandler = ((request: Request, context: FunctionContext) => Response | Promise<Response>) & {
  readonly [HTTP_HANDLER]: true;
};

/** http makes a fetch app the export of a Function with spec.protocol: http (funcd ADR-0243):
 *  `export const handle = http(app)`. A Hono route reaches the function context as `c.env.funcd`. */
export function http(app: HttpApp): HttpHandler {
  const handler = (request: Request, context: FunctionContext) => app.fetch(request, { funcd: context });
  return Object.assign(handler, { [HTTP_HANDLER]: true as const });
}

/** Json — the explicit "arbitrary JSON value" contract type (ADR-0058). Declare `FuncInput`/
 *  `FuncOutput = Json`, or a field `payload: Json`, when the shape is genuinely unknown; the
 *  generated contract is the empty schema `{}` (accepts any JSON). Typed as `unknown` so the
 *  handler must narrow before use — deliberately NOT the unsafe `any`. */
export type Json = unknown;
