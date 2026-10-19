import { createRequire as __funcdCreateRequire } from "node:module";
__funcdCreateRequire(import.meta.url);
//#region src/main.ts
var handle = async (ctx) => {
	return {
		config: process.env.APP_MODE ?? "",
		secret: await ctx.secret.get("API_KEY") ?? "",
		shared: await ctx.secret.get("SHARED") ?? ""
	};
};
//#endregion
export { handle };
