// token-owner: the owner of the Secret demo-token. Each call writes the key TOKEN or deletes it, then returns TOKEN as
// the next read returns it.
// #region handler
import type { CloudEvent, FunctionContext } from '@funcd-dev/shim';

/** A put writes value into TOKEN; a delete removes TOKEN. */
export interface FuncInput {
  op: 'put' | 'delete';
  value?: string;
}

/** TOKEN as read after the write, or null when demo-token no longer holds it. */
export interface FuncOutput {
  token: string | null;
}

export async function handle(ctx: FunctionContext, event: CloudEvent<FuncInput>): Promise<FuncOutput> {
  const input = event.data;
  if (input?.op === 'put') {
    await ctx.secret.put('demo-token', 'TOKEN', input.value ?? '');
  } else if (input?.op === 'delete') {
    await ctx.secret.del('demo-token', 'TOKEN');
    // TOKEN is gone now: deleting a key that the Secret does not hold succeeds too.
    await ctx.secret.del('demo-token', 'TOKEN');
  }
  return { token: (await ctx.secret.get('TOKEN')) ?? null };
}
// #endregion handler
