import { createRequire as __funcdCreateRequire } from "node:module";
__funcdCreateRequire(import.meta.url);
//#region src/main.ts
async function handle(ctx, event) {
	const month = event.data?.month ?? "";
	const run = await ctx.job.start("report", { month }, `report-${month}`);
	const { phase } = await ctx.job.get("report", run);
	return {
		run,
		phase
	};
}
//#endregion
export { handle };
