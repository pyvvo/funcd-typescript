import { createRequire as __funcdCreateRequire } from "node:module";
__funcdCreateRequire(import.meta.url);
//#region src/token-owner/main.ts
async function handle(ctx, event) {
	const input = event.data;
	if (input?.op === "put") await ctx.secret.put("demo-token", "TOKEN", input.value ?? "");
	else if (input?.op === "delete") {
		await ctx.secret.del("demo-token", "TOKEN");
		await ctx.secret.del("demo-token", "TOKEN");
	}
	return { token: await ctx.secret.get("TOKEN") ?? null };
}
//#endregion
export { handle };
