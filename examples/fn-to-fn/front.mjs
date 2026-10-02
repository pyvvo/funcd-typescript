import { createRequire as __funcdCreateRequire } from "node:module";
__funcdCreateRequire(import.meta.url);
//#region src/front.ts
/**
* front — the CALLER. It declares a link to greeter on its Function resource:
*   spec: { links: [{ alias: greeter, target: greeter }] }
* and invokes it. The platform brokers the synchronous call over the per-sandbox worker-node local
* API; the link IS the capability (no link ⇒ invoke fails closed). It FORWARDS the caller's `name`
* verbatim — so a missing `name` reaches greeter, whose contract rejects it (422), and that 422
* propagates back here (the awaited invoke throws).
*/
var handle = async (context, event) => {
	return {
		via: "front",
		greeting: (await context.invoke("greeter", { data: { name: event.data?.name } })).greeting
	};
};
//#endregion
export { handle };
