// token-user: a Function that binds the Secret demo-token but does not own it. Each call reads the key TOKEN, then
// tries to write the call's value into it, which funcd refuses until a role allows it.
// #region handler
import type { CloudEvent, FunctionContext } from '@funcd-dev/shim';

export interface FuncInput {
  value: string;
}

/** TOKEN as this call last read it, and the error of a refused write. */
export interface FuncOutput {
  token: string | null;
  error?: string;
}

export async function handle(ctx: FunctionContext, event: CloudEvent<FuncInput>): Promise<FuncOutput> {
  const token = (await ctx.secret.get('TOKEN')) ?? null;
  try {
    await ctx.secret.put('demo-token', 'TOKEN', event.data?.value ?? '');
  } catch (err) {
    return { token, error: (err as Error).message };
  }
  return { token: (await ctx.secret.get('TOKEN')) ?? null };
}
// #endregion handler
