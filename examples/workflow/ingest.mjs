import { createRequire as __funcdCreateRequire } from "node:module";
__funcdCreateRequire(import.meta.url);
//#region src/ingest.ts
var handle = (context, event) => {
	const amount = event.data.amount;
	context.log("ingest", amount);
	return { amount };
};
//#endregion
export { handle };
