import { createRequire as __funcdCreateRequire } from "node:module";
__funcdCreateRequire(import.meta.url);
//#region src/object.ts
var GOLD = "gold";
var OTHER = "other";
async function handle(ctx, event) {
	const inv = event.data?.inv ?? "x";
	const key = `roundtrip-${inv}.txt`;
	const body = `hello from blob-object ${inv}`;
	await ctx.blob.put(GOLD, key, new TextEncoder().encode(body));
	const got = await ctx.blob.get(GOLD, key);
	const getOK = got !== null && new TextDecoder().decode(got) === body;
	const keys = await ctx.blob.list(GOLD, "roundtrip-");
	let denied = false;
	try {
		await ctx.blob.put(OTHER, "x.txt", new TextEncoder().encode("nope"));
	} catch {
		denied = true;
	}
	ctx.log(`blob-object: put=true get=${getOK} list=${keys.length} denied=${denied}`);
	return {
		put: true,
		get: getOK,
		list: keys.length,
		denied
	};
}
//#endregion
export { handle };
