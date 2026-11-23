import { createRequire as __funcdCreateRequire } from "node:module";
__funcdCreateRequire(import.meta.url);
//#region src/main.ts
/** How long a report works; the tests set it to 0. */
var settings = { workMs: 3e3 };
async function handle(ctx, event) {
	const month = event.data?.month ?? "";
	const [year, mm] = month.split("-").map(Number);
	if (!/^\d{4}-\d{2}$/.test(month) || mm < 1 || mm > 12) throw new Error(`month "${month}" is not YYYY-MM`);
	ctx.log(`building the report of ${month} in run ${ctx.run.name}`);
	await new Promise((resolve) => setTimeout(resolve, settings.workMs));
	return {
		month,
		rows: new Date(Date.UTC(year, mm, 0)).getUTCDate()
	};
}
//#endregion
export { handle, settings };
