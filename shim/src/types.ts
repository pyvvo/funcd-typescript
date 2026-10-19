// The funcd function programming model (typed contract). A function module exports
// `handle(context, event)`, which the runtime shim invokes once per CloudEvent, or, for a Function with
// spec.protocol: http, `handle = http(app)`, which serves every request (funcd ADR-0243). Authors import these
// types for a typed handler signature + autocomplete.
import type { KVClient } from './kv.ts';
import type { BlobClient } from './blob.ts';
import type { SQLClient } from './sql.ts';
import type { ConfigClient } from './config.ts';
import type { SecretClient } from './secret.ts';
import type { CatalogClient } from './catalog.ts';

export type { KVClient } from './kv.ts';
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
export type { CatalogClient, CatalogEndpoint } from './catalog.ts';

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
  /** Structured log line → stdout (collected by the platform, ADR-0010). */
  log(...args: unknown[]): void;
  /** Synchronously invoke a linked function by its spec.links alias (ADR-0064). The input is
   *  validated against the target's contract by the target's shim; its result is returned. Fails
   *  closed (rejects) if the caller declares no such link.
   *
   *  The target receives `input` as its `event.data`, except that an object with a top-level `data` or
   *  `specversion` key is taken as a full CloudEvent envelope (ADR-0134): the target receives only its
   *  `data`, and the other keys are dropped. To send an object that has its own `data` key, wrap it in an
   *  envelope: `{ specversion: '1.0', data: { data: [1], page: 2 } }`. */
  invoke<I = unknown, O = unknown>(alias: string, input: I): Promise<O>;
  /** Send an HTTP request to a linked Function that serves HTTP (spec.protocol: http) by its spec.links alias
   *  (funcd ADR-0243). `path` starts with "/" and may carry a query. The reply comes back whole, at most 1 MiB, with
   *  its status and headers; funcd answers an error status, and calls nothing, for an undeclared link or a target
   *  that does not serve HTTP (call it with invoke). */
  fetch(alias: string, path: string, init?: RequestInit): Promise<Response>;
  /** Namespace-scoped key-value storage (ADR-0069): get/put/del a binding's key, or list keys. */
  kv: KVClient;
  /** Binding-scoped blob storage (ADR-0127): get/put/del/list a bound prefix's objects, or mint a
   *  presigned URL — the blob twin of kv. */
  blob: BlobClient;
  /** The SQL databases a function binds (funcd ADR-0233): query reads, queryValues keeps every column of a join,
   *  execute writes in one transaction. A write needs the database's owner or a writer role. */
  sql: SQLClient;
  /** The keys of the ConfigMaps a function binds (funcd ADR-0245); a key a bound Secret overrides is a secret. */
  config: ConfigClient;
  /** The keys and values of the Secrets a function binds, read from funcd on every call (funcd ADR-0249). */
  secret: SecretClient;
  /** A bound catalog's proxy URL and this function's token, by spec.catalogs alias (funcd ADR-0245). */
  catalog: CatalogClient;
  /** Milliseconds left before the call's deadline (X-Funcd-Timeout-Ms), floored at 0; null without one (ADR-0226). */
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

/** A single error from a precompiled validator. Shape kept loose (AJV vs pydantic differ); the
 *  shim only inspects the array length and echoes the errors as 422/500 details. */
export type ValidationError = unknown;

/** A precompiled, eval-free validator the push build inlines into the bundle from the author's
 *  FuncInput/FuncOutput type (ADR-0058). Returns [] when `data` is valid. The shim runs it; it
 *  never compiles a schema at runtime. */
export type Validator = (data: unknown) => ValidationError[];
