import type { Handler } from '@funcd-dev/shim';

/** The input: an amount. */
export interface FuncInput {
  amount: number;
}

/** The output: the amount and its score, amount * 10, which the when conditions of orders test. */
export interface FuncOutput {
  amount: number;
  score: number;
}

export const handle: Handler<FuncInput, FuncOutput> = (context, event) => {
  const amount = event.data!.amount;
  const score = amount * 10;
  context.log('score', score);
  return { amount, score };
};
