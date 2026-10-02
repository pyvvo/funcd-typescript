import { createRequire as __funcdCreateRequire } from "node:module";
__funcdCreateRequire(import.meta.url);
//#region src/greeter.ts
/**
* greeter — the CALLEE in the fn-to-fn link example (ADR-0064). An ordinary function; another
* function reaches it only through a declared link (see front.ts). The shim already validated
* `event.data` against FuncInput, so `name` is present and a string here.
*/
var handle = (context, event) => {
	const name = event.data.name;
	context.log("greeting", name);
	return { greeting: `Hello, ${name}!` };
};
//#endregion
export { handle };
