# env-echo — a ConfigMap in the environment, a Secret through ctx.secret

A minimal funcd example: a Function reads a setting of its bound ConfigMap from its environment, and two values of
its bound Secret through `ctx.secret`.

- **`spec.bindings.config: [app-config]`** binds a **ConfigMap**, whose values are plain text. Each worker gets its
  keys as environment variables when it starts, except a key that starts with `FUNCD_` and a key that a bound Secret
  also holds.
- **`spec.bindings.secret: [app-secret]`** binds a **Secret**, whose values are written in base64. No Secret value is
  in the environment: the handler reads each one through `ctx.secret`, which asks funcd on each call.

The Function declares both at its root: `configMaps` names the ConfigMap by `ref`, and `secrets` declares the Secret
with the keys it must hold (`API_KEY`, `SHARED`); the Function waits until it does.

The handler ([`src/main.ts`](src/main.ts)) takes **no input** (its contract's input is `{"type":"null"}`) and
returns three values: `APP_MODE` from its environment, and `API_KEY` and `SHARED` through `ctx.secret`:

```json
{ "config": "<APP_MODE>", "secret": "<API_KEY>", "shared": "<SHARED>" }
```

`APP_MODE` comes only from the ConfigMap and `API_KEY` only from the Secret. `SHARED` is a key of **both**: funcd
leaves it out of the environment, so the handler reads the Secret's value.

Expected response:

```json
{ "config": "prod", "secret": "s3cr3t", "shared": "from-secret" }
```

## Run it locally (`funcdctl dev`)

`funcdctl dev` runs the folder's resource files on a local platform and runs the Function from its build,
`env-echo.mjs`. Start it from the repository's root folder:

```bash
funcdctl dev examples/env-echo --gport 8080
```

In another terminal, call the Function. It takes no input, so the call sends no body:

```bash
curl -s -X POST http://127.0.0.1:8080/function/env-echo
# → {"config":"prod","secret":"s3cr3t","shared":"from-secret"}
```

## Run it on containerd (Lima)

This is the container-mode counterpart to the in-process scenario
`pkg/funcd/config_secret_e2e_test.go`. Run the full Lima/containerd lane (build → self-deploying VM →
Venom):

```bash
nix develop -c just lima-example env-echo
```

Run it in [pyvvo/funcd](https://github.com/pyvvo/funcd). The recipe stages this example's committed
`env-echo.mjs` with its manifests into the VM bundle, boots the generic lane
VM (which pushes the artifact and applies configmap → secret → function, then probes the Function to
`Ready` — both bindings resolved), and runs `e2e/env-echo.venom.yml`.

## Files

- `src/main.ts` — the handler, which takes no input and returns the three values.
- `vite.config.ts`, `package.json`, `tsconfig.json` — the build (`yarn build` bundles
  `src/main.ts` into the self-contained `env-echo.mjs`, committed beside the manifests).
- `env-echo.contract.yaml` — the runtime and the input and output contract, which `funcdctl push env-echo.mjs <ref>`
  reads from beside the file.
- `configmap.yaml` — the `app-config` ConfigMap (`APP_MODE=prod`, `SHARED=from-config`).
- `secret.yaml` — the `app-secret` Secret (`API_KEY=s3cr3t`, `SHARED=from-secret`, base64-encoded).
- `function.yaml` — the `env-echo` Function binding both.
- `funcdconfig.yaml` — a funcd server configuration for this example on containerd; the lane runs a variant of it,
  with credentials in place of the token, from funcd's e2e fixtures.
