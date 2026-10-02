import { createRequire as __funcdCreateRequire } from "node:module";
__funcdCreateRequire(import.meta.url);
//#region src/handler.ts
/**
* hello-world funcd function. Typed against `Handler<FuncInput, FuncOutput>`, so `context`, the
* CloudEvent `event`, and the return value are all checked at compile time (`yarn typecheck`)
* against the *same* contract the platform enforces at runtime. `yarn build` bundles this to
* `handler.mjs` — the artifact `funcdctl push` ships. The export name (`handle`) is what
* `FUNCD_HANDLER` resolves.
*/
var handle = (context, event) => {
	const { name, excited } = event.data;
	context.log("greeting", name);
	return { greeting: excited ? `Hello, ${name}!` : `Hello, ${name}.` };
};
//#endregion
export { handle };
