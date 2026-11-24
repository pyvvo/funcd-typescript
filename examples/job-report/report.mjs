import { createRequire as __funcdCreateRequire } from "node:module";
__funcdCreateRequire(import.meta.url);
//#region src/main.ts
/** How long a report works; the tests set it to 0. */
var settings = { workMs: 3e3 };
/** rowsOf is the number of days of month, YYYY-MM; any other month fails the call. */
function rowsOf(month) {
	const [year, mm] = month.split("-").map(Number);
	if (!/^\d{4}-\d{2}$/.test(month) || mm < 1 || mm > 12) throw new Error(`month "${month}" is not YYYY-MM`);
	return new Date(Date.UTC(year, mm, 0)).getUTCDate();
}
async function handle(ctx, event) {
	const month = event.data?.month ?? "";
	const rows = rowsOf(month);
	ctx.log(`building the report of ${month} in run ${ctx.run.name}`);
	await new Promise((resolve) => setTimeout(resolve, settings.workMs));
	return {
		month,
		rows
	};
}
/** A run's preview, which a person approves before a Job without approval.bypass runs (funcd ADR-0348): what the
*  report would hold, at once and with no work. */
function preview(_ctx, event) {
	const month = event.data?.month ?? "";
	return {
		month,
		rows: rowsOf(month)
	};
}
//#endregion
export { handle, preview, settings };
