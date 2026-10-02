import { createRequire as __funcdCreateRequire } from "node:module";
__funcdCreateRequire(import.meta.url);
//#region src/score.ts
var handle = (context, event) => {
	const amount = event.data.amount;
	const score = amount * 10;
	context.log("score", score);
	return {
		amount,
		score
	};
};
//#endregion
export { handle };
