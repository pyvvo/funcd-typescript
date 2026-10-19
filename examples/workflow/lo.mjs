import { createRequire as __funcdCreateRequire } from "node:module";
__funcdCreateRequire(import.meta.url);
//#region src/lo/main.ts
var handle = (context, event) => {
	const { amount, score } = event.data;
	return {
		amount,
		score,
		tier: "lo"
	};
};
//#endregion
export { handle };
