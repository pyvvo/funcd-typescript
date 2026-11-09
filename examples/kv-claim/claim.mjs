import { createRequire as __funcdCreateRequire } from "node:module";
__funcdCreateRequire(import.meta.url);
//#region src/main.ts
async function handle(ctx, event) {
	const { key, holder, op = "claim", version = "", ttl } = event.data ?? {
		key: "",
		holder: ""
	};
	const opts = ttl === void 0 ? void 0 : { ttl };
	if (op === "release") {
		if (await ctx.kv.delIf("claims", key, version)) return {
			key,
			won: true,
			version: "",
			holder: ""
		};
	} else {
		const v = op === "renew" ? await ctx.kv.compareAndSet("claims", key, holder, version, opts) : await ctx.kv.putIfAbsent("claims", key, holder, opts);
		if (v !== null) return {
			key,
			won: true,
			version: v,
			holder
		};
	}
	const now = await ctx.kv.getEntry("claims", key);
	return {
		key,
		won: false,
		version: now?.version ?? "",
		holder: now ? Buffer.from(now.value).toString("utf8") : ""
	};
}
//#endregion
export { handle };
