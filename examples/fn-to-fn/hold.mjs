import { createRequire as __funcdCreateRequire } from "node:module";
__funcdCreateRequire(import.meta.url);
//#region src/hold.ts
/**
* hold — the CALLEE of the fan-out demo (funcd ADR-0147). It keeps each call in flight for `ms`, so
* concurrent calls from fanout pile up against the daemon's per-target nested in-flight cap.
*/
var handle = async (_context, event) => {
	const ms = event.data.ms;
	await new Promise((resolve) => setTimeout(resolve, ms));
	return { held: ms };
};
//#endregion
export { handle };
