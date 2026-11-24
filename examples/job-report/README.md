# job-report — a Job that reports on one month

A **TypeScript** Job handler (funcd ADR-0347). Each run of the Job `report` takes a month as `YYYY-MM`, logs it with
the name of its run, works for three seconds, so that a cancel can stop the run while it runs, and returns one row
for each day of the month:

```
{"month":"2026-10"} ──▶ handle(ctx, event) ──▶ {"month":"2026-10","rows":31}
```

| File | What |
|---|---|
| `src/main.ts` | The handler, with its input and output types, `JobInput` and `JobOutput` |
| `report.contract.yaml` | The artifact's runtime and I/O contract (funcd ADR-0247): `month` alone, required |
| `report.yaml` | The Job resource (`runtime: nodejs22`, `handler: handle`, `timeout`, `concurrency`) |
| `report.mjs` | The committed build of `src/main.ts` |
| `test/handler.test.ts` | The author's unit tests, with no platform |

`ctx.run` holds the run's facts: its `name`, its `job`, the `revision` that it pinned, its `phase` and `startedBy`, the
subject of the credential that created the run.

## Build and test it

```bash
yarn build   # → report.mjs (see vite.config.ts)
yarn test    # the handler's unit tests
```

## Run it

Push the build with its contract beside it, point `image` in `report.yaml` at the reference that the push prints,
apply the Job to a running funcd, then start a run and read it:

```bash
funcdctl push report.mjs "oci-layout://$PWD/registry:report"
funcdctl apply -f report.yaml
funcdctl job run report report-1 --input '{"month":"2026-10"}'
funcdctl job describe report-1   # → result: {"month":"2026-10","rows":31}
funcdctl job logs report-1       # → building the report of 2026-10 in run report-1
```

funcd's `job` lane runs it on containerd, and the Job page of funcd's guide walks through it.
