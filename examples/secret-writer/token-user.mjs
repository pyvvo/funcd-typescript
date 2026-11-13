import { createRequire as __funcdCreateRequire } from "node:module";
__funcdCreateRequire(import.meta.url);
//#region src/token-user/main.ts
async function handle(ctx, event) {
	const token = await ctx.secret.get("TOKEN") ?? null;
	try {
		await ctx.secret.put("demo-token", "TOKEN", event.data?.value ?? "");
	} catch (err) {
		return {
			token,
			error: err.message
		};
	}
	return { token: await ctx.secret.get("TOKEN") ?? null };
}
//#endregion
export { handle };
