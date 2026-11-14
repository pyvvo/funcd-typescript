// env-echo: a handler that takes no input and returns three values: APP_MODE from its environment, where funcd puts
// the keys of the bound ConfigMap, and API_KEY and SHARED from the bound Secret, through ctx.secret.
import type { Handler } from '@funcd-dev/shim';

/** The function takes no input, so a call needs no body. */
export type FuncInput = void;

/** What the handler returns: config is APP_MODE from the ConfigMap; secret and shared are API_KEY and SHARED from
 *  the Secret. */
export interface FuncOutput {
  config: string;
  secret: string;
  shared: string;
}

// No Secret value is in the worker's environment: ctx.secret asks funcd for each value on each call. The ConfigMap's
// keys are in the environment, except SHARED, which the Secret also holds.
export const handle: Handler<FuncInput, FuncOutput> = async (ctx) => {
  return {
    config: process.env.APP_MODE ?? '',
    secret: (await ctx.secret.get('API_KEY')) ?? '',
    shared: (await ctx.secret.get('SHARED')) ?? '',
  };
};
