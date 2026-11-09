// kv-claim — a function that races for a claim on a key with context.kv's conditional writes. "claim" creates the
// key with the caller's holder (putIfAbsent, with an optional ttl in seconds); "renew" replaces it while it is at
// version (compareAndSet with a new ttl); "release" deletes it while it is at version (delIf). Each answers whether
// this call won and, when it lost, the key's version and holder as they are now.
import type { CloudEvent, FunctionContext } from '@funcd-dev/shim';

export interface FuncInput {
  key: string;
  holder: string;
  op?: string;
  version?: string;
  ttl?: number;
}
export interface FuncOutput {
  key: string;
  won: boolean;
  version: string;
  holder: string;
}

export async function handle(ctx: FunctionContext, event: CloudEvent<FuncInput>): Promise<FuncOutput> {
  const { key, holder, op = 'claim', version = '', ttl } = event.data ?? { key: '', holder: '' };
  const opts = ttl === undefined ? undefined : { ttl };
  if (op === 'release') {
    if (await ctx.kv.delIf('claims', key, version)) return { key, won: true, version: '', holder: '' };
  } else {
    const v =
      op === 'renew'
        ? await ctx.kv.compareAndSet('claims', key, holder, version, opts)
        : await ctx.kv.putIfAbsent('claims', key, holder, opts);
    if (v !== null) return { key, won: true, version: v, holder };
  }
  const now = await ctx.kv.getEntry('claims', key);
  return { key, won: false, version: now?.version ?? '', holder: now ? Buffer.from(now.value).toString('utf8') : '' };
}
