# job-planner — a Function that starts a Job's run

A **TypeScript** Function (funcd ADR-0349). The Function `planner` binds the Job `report` of the
[job-report](../job-report) example under the alias `report`. For each event, its handler starts a run of `report`
for the event's month, named `report-<month>`, and reads the run back:

```
{"month":"2026-10"} ──▶ handle(ctx, event) ──▶ ctx.job.start ──▶ {"run":"report-2026-10","phase":"Pending"}
```

| File | What |
|---|---|
| `src/main.ts` | The handler, with its input and output types, `PlanInput` and `PlanOutput` |
| `planner.contract.yaml` | The artifact's runtime and I/O contract (funcd ADR-0247): `month` alone, required |
| `planner.yaml` | The Function resource, with its `bindings.job` |
| `planner.mjs` | The committed build of `src/main.ts` |
| `test/handler.test.ts` | The author's unit tests, with no platform |

`ctx.job.start` returns the run's name at once, without waiting for the run. The name comes from the month, so a
start sent again for one month, with its input, returns the run that the first start made: an event that funcd
delivers twice starts one run. `ctx.job.get` reads a run of the bound Job: its phase, its reason, its times and, once
it Succeeded, its result.

## Build and test it

```bash
yarn build   # → planner.mjs (see vite.config.ts)
yarn test    # the handler's unit tests
```

## Run it

Apply the Job `report` of the job-report example first. Then push the build with its contract beside it, point
`image` in `planner.yaml` at the reference that the push prints, apply the Function and call it on funcd's data
plane:

```bash
funcdctl push planner.mjs "oci-layout://$PWD/registry:planner"
funcdctl apply -f planner.yaml
curl -s -X POST -H 'content-type: application/json' -d '{"month":"2026-10"}' http://127.0.0.1:8081/function/planner
# → {"run":"report-2026-10","phase":"Pending"}
funcdctl job describe report-2026-10
```
