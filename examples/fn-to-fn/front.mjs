import { createRequire as __funcdCreateRequire } from "node:module";
__funcdCreateRequire(import.meta.url);
//#region src/front/main.ts
/**
* front: the caller. Its Function declares a link under spec.bindings.links, with the alias greeter and
* the target greeter, and the handler calls it with context.invoke. The link is the grant: without it,
* context.invoke fails with 403. front forwards the caller's name as it is, so a missing name reaches
* greeter, whose contract refuses it with 422, and the awaited invoke throws.
*/
var handle = async (context, event) => {
	return {
		via: "front",
		greeting: (await context.invoke("greeter", { data: { name: event.data?.name } })).greeting
	};
};
//#endregion
export { handle };
