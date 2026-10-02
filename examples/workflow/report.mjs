import { createRequire as __funcdCreateRequire } from "node:module";
__funcdCreateRequire(import.meta.url);
//#region src/report.ts
var handle = (context, event) => {
	const branch = event.data.hi ?? event.data.lo;
	context.log("report", branch?.tier);
	return {
		done: true,
		tier: branch.tier
	};
};
//#endregion
export { handle };
