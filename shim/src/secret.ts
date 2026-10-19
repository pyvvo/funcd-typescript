// context.secret — the keys and values of a function's bound Secrets, read from funcd over the worker-node local API
// on every call (funcd ADR-0249): GET /secret and GET /secret/{key}, checked by funcd, with no cache. No secret sits in
// the worker's environment.
import { type Resp, send } from './socket.ts';

/** A function's bound secrets (funcd ADR-0249): an unbound key reads as undefined. */
export interface SecretClient {
  get(key: string): Promise<string | undefined>;
  list(): Promise<string[]>;
}

const fail = (verb: string, r: Resp) =>
  new Error(`context.secret.${verb} failed: ${r.status} ${r.body.toString('utf8')}`);
const json = (verb: string, r: Resp) => {
  try {
    return JSON.parse(r.body.toString('utf8'));
  } catch (err) {
    throw new Error(`context.secret.${verb} failed: ${r.status} reply is not JSON: ${(err as Error).message}`, {
      cause: err,
    });
  }
};

/** Build the context.secret client. In a pool, `member` names the calling function on every request (funcd checks it
 *  against the pool's members); the solo shim passes none. */
export function makeSecret(member?: string): SecretClient {
  return {
    async get(key) {
      const r = await send('context.secret', 'GET', `/secret/${encodeURIComponent(key)}`, undefined, member);
      if (r.status === 404) return undefined;
      if (r.status !== 200) throw fail('get', r);
      return (json('get', r) as { value: string }).value;
    },
    async list() {
      const r = await send('context.secret', 'GET', '/secret', undefined, member);
      if (r.status !== 200) throw fail('list', r);
      return (json('list', r) as { keys: string[] }).keys;
    },
  };
}
