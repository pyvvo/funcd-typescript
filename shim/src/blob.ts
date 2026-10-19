// context.blob — function-facing blob over the worker-node local API (HTTP-over-UDS, ADR-0127). Dials the
// same per-sandbox socket as context.kv/context.invoke (FUNCD_INVOKE_SOCKET); the platform routes /blob/…
// to the binding-gated, PDP-authorized Facade with the sandbox's function identity (bind-as-grant on
// spec.bindings.blob). Reached only through the built-in shim — no @aws-sdk, no keypair. The blob twin of context.kv;
// v1 is bytes-in-memory (streaming is a v2 follow-up).
import { type Resp, send as sendOn } from './socket.ts';

const send = (method: string, path: string, body: Buffer | undefined, member: string | undefined) =>
  sendOn('context.blob', method, path, body, member);

/** Options for a presigned URL: the HTTP method it grants (default GET) and its lifetime, a duration string
 * such as "10m" or "1h30m" (funcd ADR-0198: units h, m, s, ms in that order, whole seconds from 1s to 168h). The
 * server checks it and answers 400 for a bad value, "" included; only an absent expiry gets the driver's default.
 * A PUT/DELETE URL requires s3::write. */
export interface SignOptions {
  method?: 'GET' | 'PUT' | 'DELETE';
  expiry?: string;
}

/** A function's binding-scoped blob storage (ADR-0127): get/put/delete a bound prefix's objects, list
 * keys, or mint a presigned URL — the blob twin of KVClient. */
export interface BlobClient {
  get(binding: string, key: string): Promise<Uint8Array | null>;
  put(binding: string, key: string, value: Uint8Array): Promise<void>;
  del(binding: string, key: string): Promise<void>;
  list(binding: string, prefix?: string): Promise<string[]>;
  signedUrl(binding: string, key: string, opts?: SignOptions): Promise<string>;
}

const enc = encodeURIComponent;
// key may be hierarchical ("a/b"); keep the "/" separators (the server's {key...} captures them), encode segments.
const keyPath = (binding: string, key: string) => `/blob/${enc(binding)}/${key.split('/').map(enc).join('/')}`;
const fail = (verb: string, r: Resp) =>
  new Error(`context.blob.${verb} failed: ${r.status} ${r.body.toString('utf8')}`);
const ok = (r: Resp) => r.status >= 200 && r.status < 300;
const json = (verb: string, r: Resp, text: string) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`context.blob.${verb} failed: ${r.status} reply is not JSON: ${(err as Error).message}`, {
      cause: err,
    });
  }
};

/** Build the context.blob client. In a pool, `member` names the calling function on every request
 *  (funcd checks it against the pool's members); the solo shim passes none. */
export function makeBlob(member?: string): BlobClient {
  const request = (method: string, path: string, body?: Buffer) => send(method, path, body, member);
  return {
    async get(binding, key) {
      const r = await request('GET', keyPath(binding, key));
      if (r.status === 404) return null;
      if (!ok(r)) throw fail('get', r);
      return new Uint8Array(r.body);
    },
    async put(binding, key, value) {
      const r = await request('PUT', keyPath(binding, key), Buffer.from(value));
      if (!ok(r)) throw fail('put', r);
    },
    async del(binding, key) {
      const r = await request('DELETE', keyPath(binding, key));
      if (!ok(r)) throw fail('del', r);
    },
    async list(binding, prefix) {
      const q = prefix ? `?prefix=${enc(prefix)}` : '';
      const r = await request('GET', `/blob/${enc(binding)}${q}`);
      if (!ok(r)) throw fail('list', r);
      return json('list', r, r.body.toString('utf8') || '[]') as string[];
    },
    async signedUrl(binding, key, opts) {
      let path = `${keyPath(binding, key)}?sign=1&method=${enc(opts?.method ?? 'GET')}`;
      if (opts?.expiry != null) path += `&expiry=${enc(opts.expiry)}`;
      const r = await request('GET', path);
      if (!ok(r)) throw fail('signedUrl', r);
      return r.body.toString('utf8');
    },
  };
}
