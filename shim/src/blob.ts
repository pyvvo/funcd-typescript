// context.blob — function-facing blob over the worker-node local API (HTTP-over-UDS, ADR-0127). Dials the
// same per-sandbox socket as context.kv/context.invoke (FUNCD_INVOKE_SOCKET); the platform routes /blob/…
// to the binding-gated, PDP-authorized Facade with the sandbox's function identity (bind-as-grant on
// spec.bindings.blob). Reached only through the built-in shim — no @aws-sdk, no keypair. The blob twin of context.kv;
// v1 is bytes-in-memory (streaming is a v2 follow-up).
import { type Resp, send as sendOn } from './socket.ts';

const send = (method: string, path: string, body: Buffer | undefined, member: string | undefined) =>
  sendOn('context.blob', method, path, body, member);

/** Options for a presigned URL: the HTTP method it allows, GET by default, and its lifetime, a duration such as "10m"
 * or "1h30m" in whole seconds from 1s to 168h. funcd refuses another value, "" included, with the HTTP status 400;
 * without an expiry, the URL lasts 15 minutes. A PUT or DELETE URL needs permission to write the prefix. */
export interface SignOptions {
  method?: 'GET' | 'PUT' | 'DELETE';
  expiry?: string;
}

/** The Bucket prefixes that a function binds, each by its alias in spec.bindings.blob: read, write, delete and list
 * their objects, whose keys are relative to the binding's prefix. */
export interface BlobClient {
  /** The object's content as bytes, or null when the object does not exist. */
  get(binding: string, key: string): Promise<Uint8Array | null>;
  /** Writes the object, replacing any object with that key. The value is at most 64 MiB, and at most the Bucket's
   *  spec.quota.maxObjectBytes when that is set: a larger one fails with the HTTP status 413. Only the prefix's owner
   *  and the writers that a RolesAssignment names can write. */
  put(binding: string, key: string, value: Uint8Array): Promise<void>;
  /** Deletes the object, and fails with the HTTP status 404 when it does not exist. Only the prefix's owner and the
   *  writers that a RolesAssignment names can delete. */
  del(binding: string, key: string): Promise<void>;
  /** The keys that start with prefix; without a prefix, every key under the binding's prefix. */
  list(binding: string, prefix?: string): Promise<string[]>;
  /** A presigned URL that lets its holder send an opts.method request, GET by default, for the object until
   *  opts.expiry passes: a duration such as "10m" or "1h30m", in whole seconds from 1s to 168h, or 15 minutes when
   *  unset. Any other expiry, "" included, fails with the HTTP status 400. A PUT or DELETE URL needs permission to
   *  write the prefix, and a PUT URL fails with the HTTP status 403 when the Bucket sets maxObjectBytes or a size
   *  quota applies to the Bucket or the prefix, since funcd could not enforce it on the upload. No blob store that
   *  funcd opens signs URLs, so a call that passes these checks fails with the HTTP status 503. */
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
