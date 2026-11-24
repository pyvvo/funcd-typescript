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
import type { AddonClient } from './addon.ts';
import type { Approval, JobClient } from './job.ts';

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
export type { AddonClient, AddonError, AddonProblem } from './addon.ts';
export type { Approval, JobClient, JobError, JobProblem, JobRunState } from './job.ts';

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
   *  that starts with FUNCD_ is left out, since funcd reserves that prefix. A key that a bound Secret also holds is
   *  left out too, and ctx.secret reads the Secret's value. While funcd's S3 gateway runs, a function that binds a
   *  Bucket reads the AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY that funcd issues it, in place of a ConfigMap's. */
  config: ConfigClient;
  /** The Secrets that the function binds. get and list read their keys and values at each call, with no cache, so a
   *  changed Secret shows at the next read; a key that starts with FUNCD_ is never read: get returns undefined for
   *  it, and list leaves it out. put and del change one key of a bound Secret that the function may write, as the
   *  Secret's owner or through a writer role such as Secret Data Writer. */
  secret: SecretClient;
  /** The Lakes that the function binds, by alias: the address of each Lake's gateway, and the token that the gateway
   *  accepts from the function. */
  lake: LakeClient;
  /** The add-on objects that the function binds, by alias: fetch calls an object's engine through funcd, which serves
   *  only the paths that the object's edge entry serves. */
  addon: AddonClient;
  /** The Jobs that the function binds, by alias: start a run of one with an input, and read a run back. */
  job: JobClient;
  /** The whole milliseconds left before the call's deadline, 0 once it has passed, or null when the call has none. */
  remainingMs(): number | null;
  /** Who signed in to the call, when funcd's edge signed a user in with an OpenID Connect provider: provider is the
   *  name of the OIDCProvider, id the user's subject (the sub claim), name the first of the claims name,
   *  preferred_username and email that is not empty, and claims the payload of the token that signed the user in, the
   *  ID token of a browser session or the Bearer token of an API call. Undefined when nobody signed in. */
  principal?: { provider: string; id: string; name?: string; claims: Record<string, unknown> };
}

/** A Job run's facts (funcd ADR-0347): the run, its Job and the revision it pinned, the call's phase and who
 *  started the run. */
export interface RunInfo {
  name: string;
  job: string;
  revision: string;
  /** `run`, or `preview` in a run's preview call (funcd ADR-0348). */
  phase: 'run' | 'preview';
  startedBy: string;
}

/** The context a Job's handler and its preview get (funcd ADR-0347, ADR-0348): the FunctionContext plus its run and,
 *  in the run's call, the approval it runs under. */
export interface JobContext extends FunctionContext {
  run: RunInfo;
  /** The person's approval of the preview that this run runs: who approved it, the preview's digest and its document.
   *  Null in the preview call, and for a run of a Job with approval.bypass. */
  approval: Approval | null;
}

/** A Job module's optional preview export (funcd ADR-0348): called in a run's preview call, before a person approves
 *  the run, it answers what the run would change, as JSON. A module with none previews its run's input. */
export type Preview<In = unknown> = (context: JobContext, event: CloudEvent<In>) => Json | Promise<Json>;

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
