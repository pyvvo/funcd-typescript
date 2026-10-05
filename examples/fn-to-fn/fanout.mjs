import { createRequire as __funcdCreateRequire } from "node:module";
__funcdCreateRequire(import.meta.url);
//#region src/fanout.ts
var nestedCapOp = "workernode.local.nested-cap";
/**
* fanout — the CALLER of the fan-out demo (funcd ADR-0147). It declares the link `peer → hold` and calls
* it `n` times at once. The daemon caps the nested calls in flight to one Function (invoke.maxNestedInFlight),
* so the calls over the cap are refused with 429; fanout counts those and fails on any other error.
*/
var handle = async (context, event) => {
	const { n, ms = 2e3 } = event.data;
	const calls = Array.from({ length: n }, () => context.invoke("peer", { data: { ms } }));
	let ok = 0;
	let refused = 0;
	let detail = "";
	for (const result of await Promise.allSettled(calls)) {
		if (result.status === "fulfilled") {
			ok++;
			continue;
		}
		const message = result.reason instanceof Error ? result.reason.message : String(result.reason);
		if (!message.includes(nestedCapOp)) throw result.reason;
		refused++;
		detail = message;
	}
	return {
		ok,
		refused,
		detail
	};
};
//#endregion
export { handle };
