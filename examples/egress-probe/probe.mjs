import { createRequire as __funcdCreateRequire } from "node:module";
__funcdCreateRequire(import.meta.url);
//#region src/handler.ts
var handle = async (context, event) => {
	const { url } = event.data;
	try {
		return {
			ok: true,
			status: (await fetch(url, { signal: AbortSignal.timeout(5e3) })).status,
			error: ""
		};
	} catch (e) {
		context.log("egress-probe connect failed", url, String(e));
		return {
			ok: false,
			status: 0,
			error: e instanceof Error ? e.message : String(e)
		};
	}
};
//#endregion
export { handle };
