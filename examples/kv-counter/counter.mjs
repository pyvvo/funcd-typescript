import { createRequire as __funcdCreateRequire } from "node:module";
__funcdCreateRequire(import.meta.url);
//#region src/counter.ts
async function handle(ctx, event) {
	const name = event.data?.name ?? "world";
	const cur = await ctx.kv.getText("counters", name);
	const count = Number(cur ?? 0) + 1;
	await ctx.kv.put("counters", name, String(count));
	ctx.log(`kv-counter: ${name} → ${count}`);
	return {
		name,
		count
	};
}
//#endregion
export { handle };
