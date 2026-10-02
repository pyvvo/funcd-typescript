import { createRequire as __funcdCreateRequire } from "node:module";
__funcdCreateRequire(import.meta.url);
//#region src/handler.ts
var handle = () => {
	return {
		config: process.env.APP_MODE ?? "",
		secret: process.env.API_KEY ?? "",
		shared: process.env.SHARED ?? ""
	};
};
//#endregion
export { handle };
