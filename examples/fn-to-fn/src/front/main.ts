import type { Handler } from '@funcd-dev/shim';

// A TYPE-only import of the callee's contract — erased at build, so front.mjs does NOT bundle
// greeter's code. It borrows greeter's input/output types so the invoke is type-checked, aliased
// because this module declares its OWN FuncInput/FuncOutput (its contract).
import type { FuncInput as GreeterInput, FuncOutput as GreeterOutput } from '../greeter/main.ts';

/**
 * What front accepts. `name` is OPTIONAL here (front is permissive) — so front can forward a payload
 * to greeter that greeter's stricter contract rejects, demonstrating that a target's 422 propagates
 * back through context.invoke.
 */
export interface FuncInput {
  name?: string;
}

/** What front returns — greeter's greeting, wrapped. */
export interface FuncOutput {
  via: string;
  greeting: string;
}

/**
 * front: the caller. Its Function declares a link under spec.bindings.links, with the alias greeter and
 * the target greeter, and the handler calls it with context.invoke. The link is the grant: without it,
 * context.invoke fails with 403. front forwards the caller's name as it is, so a missing name reaches
 * greeter, whose contract refuses it with 422, and the awaited invoke throws.
 */
export const handle: Handler<FuncInput, FuncOutput> = async (context, event) => {
  const reply = await context.invoke<{ data: GreeterInput }, GreeterOutput>('greeter', {
    data: { name: event.data?.name as string },
  });
  return { via: 'front', greeting: reply.greeting };
};
