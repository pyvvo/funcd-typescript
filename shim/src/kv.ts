// context.kv — function-facing KV over the worker-node local API (HTTP-over-UDS, ADR-0069). Dials the
// same per-sandbox socket as context.invoke (FUNCD_INVOKE_SOCKET); the platform routes /kv/… to the
// PDP-authorized Facade with the sandbox's namespace identity. Reached only through the built-in shim.
import { type Resp, send as sendOn } from './socket.ts';

const send = (
  method: string,
  path: string,
  body: Buffer | undefined,
  member: string | undefined,
  headers?: Record<string, string>,
) => sendOn('context.kv', method, path, body, member, undefined, headers);

/** A key's value with its version, which a compareAndSet or a delIf names. */
export interface KVEntry {
  value: Uint8Array;
  version: string;
}

/** How long a written key lives. Each write sets its own expiry: one without ttl leaves the key with none. */
export interface PutOptions {
  /** Whole seconds from 1: the key lives at least ttl from when funcd takes the write, so a holder that counts its
   *  lease from before the call never counts past the key's expiry. Renew it with a compareAndSet and a new ttl. */
  ttl?: number;
}

/** The key-value tables that a function binds, each by its alias in spec.bindings.kv. putIfAbsent, compareAndSet and
 *  delIf write only while their condition holds and say who won: of racing writers, exactly one gets the new version,
 *  and the others get null (false for delIf). */
export interface KVClient {
  /** The key's value as bytes, or null when the key does not exist. */
  get(binding: string, key: string): Promise<Uint8Array | null>;
  /** The key's value with its version, or null when the key does not exist. */
  getEntry(binding: string, key: string): Promise<KVEntry | null>;
  /** The key's value decoded as UTF-8 text, or null when the key does not exist. */
  getText(binding: string, key: string): Promise<string | null>;
  /** The key's value parsed as JSON, or null when the key does not exist. Write it with
   *  put(binding, key, JSON.stringify(value)). */
  getJSON<T = unknown>(binding: string, key: string): Promise<T | null>;
  /** Writes the value. opts.ttl, in whole seconds, sets the key's expiry; a put without it leaves the key with none.
   *  Only the table's owner and the writers that a RolesAssignment names can write. */
  put(binding: string, key: string, value: Uint8Array | string, opts?: PutOptions): Promise<void>;
  /** Creates the key: its new version, or null when it exists (an expired key does not). */
  putIfAbsent(binding: string, key: string, value: Uint8Array | string, opts?: PutOptions): Promise<string | null>;
  /** Replaces the key while it is at version: its new version, or null when it is not. */
  compareAndSet(
    binding: string,
    key: string,
    value: Uint8Array | string,
    version: string,
    opts?: PutOptions,
  ): Promise<string | null>;
  /** Deletes the key. */
  del(binding: string, key: string): Promise<void>;
  /** Deletes the key while it is at version, as a lease holder releases what it holds: true when it did. */
  delIf(binding: string, key: string, version: string): Promise<boolean>;
  /** The keys that start with prefix; without a prefix, every key of the table. */
  list(binding: string, prefix?: string): Promise<string[]>;
}

const enc = encodeURIComponent;
// key may be hierarchical ("a/b"); keep the "/" separators (the server's {key...} captures them), encode segments.
const keyPath = (binding: string, key: string) => `/kv/${enc(binding)}/${key.split('/').map(enc).join('/')}`;
const fail = (verb: string, r: Resp) => new Error(`context.kv.${verb} failed: ${r.status} ${r.body.toString('utf8')}`);
const ok = (r: Resp) => r.status >= 200 && r.status < 300;
const json = (verb: string, r: Resp, text: string) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`context.kv.${verb} failed: ${r.status} reply is not JSON: ${(err as Error).message}`, {
      cause: err,
    });
  }
};
const version = (r: Resp) => (r.etag ?? '').replace(/^"|"$/g, '');
const withTTL = (path: string, opts?: PutOptions) => {
  if (opts?.ttl === undefined) return path;
  if (!Number.isSafeInteger(opts.ttl) || opts.ttl < 1) {
    throw new RangeError(`context.kv: ttl must be a whole number of seconds from 1, not ${opts.ttl}`);
  }
  return `${path}?ttl=${opts.ttl}`;
};
const bytes = (value: Uint8Array | string) =>
  typeof value === 'string' ? Buffer.from(value, 'utf8') : Buffer.from(value);

/** Build the context.kv client. In a pool, `member` names the calling function on every request
 *  (funcd checks it against the pool's members); the solo shim passes none. */
export function makeKV(member?: string): KVClient {
  const request = (method: string, path: string, body?: Buffer, headers?: Record<string, string>) =>
    send(method, path, body, member, headers);
  const conditionalPut = async (
    verb: string,
    binding: string,
    key: string,
    value: Uint8Array | string,
    opts: PutOptions | undefined,
    headers: Record<string, string>,
  ) => {
    const r = await request('PUT', withTTL(keyPath(binding, key), opts), bytes(value), headers);
    if (r.status === 412) return null;
    if (!ok(r)) throw fail(verb, r);
    return version(r);
  };
  return {
    async get(binding, key) {
      const r = await request('GET', keyPath(binding, key));
      if (r.status === 404) return null;
      if (!ok(r)) throw fail('get', r);
      return new Uint8Array(r.body);
    },
    async getEntry(binding, key) {
      const r = await request('GET', keyPath(binding, key));
      if (r.status === 404) return null;
      if (!ok(r)) throw fail('getEntry', r);
      return { value: new Uint8Array(r.body), version: version(r) };
    },
    async getText(binding, key) {
      const r = await request('GET', keyPath(binding, key));
      if (r.status === 404) return null;
      if (!ok(r)) throw fail('get', r);
      return r.body.toString('utf8');
    },
    async getJSON(binding, key) {
      const r = await request('GET', keyPath(binding, key));
      if (r.status === 404) return null;
      if (!ok(r)) throw fail('get', r);
      return json('getJSON', r, r.body.toString('utf8'));
    },
    async put(binding, key, value, opts) {
      const r = await request('PUT', withTTL(keyPath(binding, key), opts), bytes(value));
      if (!ok(r)) throw fail('put', r);
    },
    putIfAbsent(binding, key, value, opts) {
      return conditionalPut('putIfAbsent', binding, key, value, opts, { 'if-none-match': '*' });
    },
    compareAndSet(binding, key, value, v, opts) {
      return conditionalPut('compareAndSet', binding, key, value, opts, { 'if-match': `"${v}"` });
    },
    async del(binding, key) {
      const r = await request('DELETE', keyPath(binding, key));
      if (!ok(r)) throw fail('del', r);
    },
    async delIf(binding, key, v) {
      const r = await request('DELETE', keyPath(binding, key), undefined, { 'if-match': `"${v}"` });
      if (r.status === 412) return false;
      if (!ok(r)) throw fail('delIf', r);
      return true;
    },
    async list(binding, prefix) {
      const q = prefix ? `?prefix=${enc(prefix)}` : '';
      const r = await request('GET', `/kv/${enc(binding)}${q}`);
      if (!ok(r)) throw fail('list', r);
      return json('list', r, r.body.toString('utf8') || '[]') as string[];
    },
  };
}
