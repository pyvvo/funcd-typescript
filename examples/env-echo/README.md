# env-echo — config + secret env injection on real containerd

A minimal funcd example proving that a Function receives **both** its bound configuration sources as
environment at runtime:

- **`spec.bindings.config: [app-config]`** — a **ConfigMap** (ADR-0093), non-sensitive `Data` (plain string map).
- **`spec.bindings.secret: [app-secret]`** — a **Secret** (ADR-0057), sensitive `Data` (base64-encoded `[]byte`).

The Function declares both at its root (funcd ADR-0248): `configMaps` names the ConfigMap by `ref`, and
`secrets` declares the Secret with the keys it must hold (`API_KEY`, `SHARED`); the Function waits until it does.

The handler ([`src/main.ts`](src/main.ts)) takes **no input** (`FuncInput = void` → the ADR-0090
void-input contract `{"type":"null"}`) and echoes three env vars back:

```json
{ "config": "$APP_MODE", "secret": "$API_KEY", "shared": "$SHARED" }
```

`APP_MODE` comes only from the ConfigMap, `API_KEY` only from the Secret, and `SHARED` is present in
**both** — so the response proves the **config-then-secrets merge order** (ADR-0092/0093): the Secret wins
the shared key.

Expected invoke body:

```json
{ "config": "prod", "secret": "s3cr3t", "shared": "from-secret" }
```

## Run it locally (`funcdctl dev`)

`funcdctl dev` runs the function from its resource and contract files (funcd ADR-0247) — printing a colored services
banner + live logs (it builds the `-tags dev` funcdctl for you). It loads every manifest in the dir,
so the `app-config` ConfigMap and `app-secret` Secret are injected as env:

```bash
just dev-example js/env-echo      # gateway :3005 · S3 :3006 — override: just dev-example js/env-echo 4000 4001
```

Invoke the gateway the banner prints (default `http://127.0.0.1:3005`). Dev runs the
Function its resource file names (`env-echo`), from the build beside `env-echo.contract.yaml`; its input is **void**
(`input: {type: "null"}`), so the **CloudEvent envelope** carries `null` data:

```bash
curl -sS -XPOST http://127.0.0.1:3005/function/env-echo \
  -H 'Content-Type: application/json' -d '{"data":null}'
# → {"config":"prod","secret":"s3cr3t","shared":"from-secret"}   (the Secret wins the shared key)
```

## Run it on containerd (Lima)

This is the container-mode counterpart to the in-process scenario
`pkg/funcd/config_secret_e2e_test.go`. Run the full Lima/containerd lane (build → self-deploying VM →
Venom):

```bash
nix develop -c just lima-example env-echo
```

Run it in [pyvvo/funcd](https://github.com/pyvvo/funcd). The recipe stages this example's committed
`env-echo.mjs` with the four manifests into the VM bundle, boots the generic lane
VM (which pushes the artifact and applies configmap → secret → function, then probes the Function to
`Ready` — both bindings resolved), and runs `e2e/env-echo.venom.yml`.

## Files

- `src/main.ts` — the typed void-input handler that echoes the injected env.
- `vite.config.ts`, `package.json`, `tsconfig.json` — the build (`yarn build` bundles
  `src/main.ts` into the self-contained `env-echo.mjs`, committed beside the manifests).
- `env-echo.contract.yaml` — the client push/dev config: runtime, handler, bindings and the I/O contract
  (`funcdctl push env-echo.mjs <ref>` reads it from beside the file).
- `configmap.yaml` — the `app-config` ConfigMap (`APP_MODE=prod`, `SHARED=from-config`).
- `secret.yaml` — the `app-secret` Secret (`API_KEY=s3cr3t`, `SHARED=from-secret`, base64-encoded).
- `function.yaml` — the `env-echo` Function binding both.
- `funcdconfig.yaml` — the daemon config for the containerd lane.
