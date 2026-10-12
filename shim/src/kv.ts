// context.kv — function-facing KV over the worker-node local API (HTTP-over-UDS, ADR-0069). Dials the
// same per-sandbox socket as context.invoke (FUNCD_INVOKE_SOCKET); the platform routes /kv/… to the
// PDP-authorized Facade with the sandbox's namespace identity. Reached only through the built-in shim.
import { type Resp, send as sendOn } from './socket.ts';

const send = (method: string, path: string, body: Buffer | undefined, member: string | undefined) =>
  sendOn('context.kv', method, path, body, member);

/** A function's view of its namespace-scoped KV (ADR-0069): get/put/del a binding's key, or list keys. */
export interface KVClient {
  get(binding: string, key: string): Promise<Uint8Array | null>;
  /** get() decoded as UTF-8 text — the common case (a missing key is null). Saves the caller a
   * TextDecoder dance; put() already accepts a string. */
  getText(binding: string, key: string): Promise<string | null>;
  /** get() decoded as UTF-8 text then JSON-parsed (a missing key is null). The structured-value
   * counterpart of getText; write with put(binding, key, JSON.stringify(value)). */
  getJSON<T = unknown>(binding: string, key: string): Promise<T | null>;
  put(binding: string, key: string, value: Uint8Array | string): Promise<void>;
  del(binding: string, key: string): Promise<void>;
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

/** Build the context.kv client. In a pool, `member` names the calling function on every request
 *  (funcd checks it against the pool's members); the solo shim passes none. */
export function makeKV(member?: string): KVClient {
  const request = (method: string, path: string, body?: Buffer) => send(method, path, body, member);
  return {
    async get(binding, key) {
      const r = await request('GET', keyPath(binding, key));
      if (r.status === 404) return null;
      if (!ok(r)) throw fail('get', r);
      return new Uint8Array(r.body);
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
    async put(binding, key, value) {
      const buf = typeof value === 'string' ? Buffer.from(value, 'utf8') : Buffer.from(value);
      const r = await request('PUT', keyPath(binding, key), buf);
      if (!ok(r)) throw fail('put', r);
    },
    async del(binding, key) {
      const r = await request('DELETE', keyPath(binding, key));
      if (!ok(r)) throw fail('del', r);
    },
    async list(binding, prefix) {
      const q = prefix ? `?prefix=${enc(prefix)}` : '';
      const r = await request('GET', `/kv/${enc(binding)}${q}`);
      if (!ok(r)) throw fail('list', r);
      return json('list', r, r.body.toString('utf8') || '[]') as string[];
    },
  };
}
