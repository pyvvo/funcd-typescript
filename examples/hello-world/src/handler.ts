import type { Handler } from '@funcd-dev/shim';

/**
 * The event payload this function accepts — the CloudEvent `data` (ADR-0058 I/O contract).
 *
 * This is a *closed record* in the supported profile: scalar fields, one optional. The matching
 * JSON Schema lives in `funcdctl.yaml` (`contract.input`); `funcdctl push` ships it with the
 * bundle, and the shim compiles a validator from it at worker start. The shim runs that
 * validator on every `event.data` **before** `handle` is called — a bad-shaped event is rejected
 * with **422** and never reaches this code, so inside the handler the input is already valid.
 */
export interface FuncInput {
  /** Who to greet. */
  name: string;
  /** Optional flourish; absent → a plain greeting. (`?:` → an optional property in the schema.) */
  excited?: boolean;
}

/**
 * What the function returns — the HTTP 200 JSON body. `contract.output` is validated too;
 * a return value that doesn't match this type is a **500** (the bug is server-side, not the
 * caller's). Returning nothing (`void`/`undefined`) would instead be a **204** — see the README,
 * which also shows the `Json` escape hatch and a discriminated-union output.
 */
export interface FuncOutput {
  greeting: string;
}

/**
 * hello-world funcd function. Typed against `Handler<FuncInput, FuncOutput>`, so `context`, the
 * CloudEvent `event`, and the return value are all checked at compile time (`yarn typecheck`)
 * against the *same* contract the platform enforces at runtime. `yarn build` bundles this to
 * `handler.mjs` — the artifact `funcdctl push` ships. The export name (`handle`) is what
 * `FUNCD_HANDLER` resolves.
 */
export const handle: Handler<FuncInput, FuncOutput> = (context, event) => {
  // The shim already validated `event.data` against FuncInput (422 otherwise), so it is present
  // and well-shaped here. `!` tells the compiler what the runtime guarantees (`data?:` is optional
  // on the envelope only because a contract-less function may omit it).
  const { name, excited } = event.data!;
  context.log('greeting', name);
  return { greeting: excited ? `Hello, ${name}!` : `Hello, ${name}.` };
};
