# funcd-typescript

The Node.js runtime shim and the TypeScript example functions for
[funcd](https://github.com/pyvvo/funcd), a single-binary serverless platform.

| Path | What |
|---|---|
| `shim/` | The shim that loads a function's handler inside a funcd worker |
| `vite-plugin/` | `@funcd-dev/vite-plugin`, which bundles each function into one self-contained `.mjs` |
| `examples/` | Example functions, with their built bundles committed |

[funcd](https://github.com/pyvvo/funcd) pins this repo as a Go module at a release tag, embeds
`shim/shim.mjs` and `shim/pool.mjs`, and runs the examples in its e2e tests and lanes.

## Use the types in your functions

```bash
yarn add -D @funcd-dev/shim
```

`import type { Handler, FunctionContext } from '@funcd-dev/shim'` types a handler, and
`import { buildContract } from '@funcd-dev/shim/build'` builds its input and output contract.

## Read config, secrets and lakes

A handler reads its bound values through the context (funcd ADR-0245):

```ts
const level = context.config.get('LOG_LEVEL');
const key = await context.secret.get('STRIPE_KEY');
const { url, token } = context.lake.get('lake');
```

`config` holds the keys of the Function's bound ConfigMaps and `secret` those of its Secrets; a key a secret overrides
reads only through `secret`, and an unbound key reads as `undefined`. `list()` returns the bound keys, sorted.
`secret` asks funcd on every call (funcd ADR-0249), so its methods return Promises and no secret sits in the worker's
environment. `lake.get(alias)` throws an Error naming the alias when it is not bound.

## Serve HTTP from a function

A Function with `spec.protocol: http` exports an HTTP app instead of an event handler (funcd ADR-0243):

```ts
import { http } from '@funcd-dev/shim';
import { Hono } from 'hono';

const app = new Hono().get('/devices/:id', (c) => c.json({ id: c.req.param('id') }));
export const handle = http(app);
```

Every request but the shim's own `/health/*` reaches the app with its method, path, query and headers, and the app's
`Response` goes back as is, streamed. funcd's edge answers a path under `/health/` itself with 404 (funcd ADR-0316), so
keep the app's routes outside that prefix; `/health` itself reaches the app. Only funcd's edge calls such a Function;
another Function reaches it with `context.fetch(alias, path, init)` over a link, which resolves with the app's reply,
whatever its status, and rejects when funcd refuses the call (no link, or a target that does not serve HTTP). See
[`examples/http-api`](examples/http-api).

## Know who signed in

When funcd's edge signs the caller in with an OpenID Connect provider (funcd ADR-0335), `context.principal` says who
it is. It is `undefined` for a call that nobody signed in to:

```ts
export const handle: Handler = (context) => ({ hello: context.principal?.name ?? 'stranger' });
```

`provider` is the OIDCProvider's name, `id` the user's `sub` claim, `name` the first of the claims `name`,
`preferred_username` and `email` that is not empty, and `claims` the payload of the token that signed the user in.
An http app also receives the headers that the edge sets: `X-Funcd-Principal`, `X-Funcd-Principal-Id`,
`X-Funcd-Principal-Name` and, for a browser session, the ID token in `X-Funcd-Id-Token`. The shim removes every other
`x-funcd-*` header.

## Bundle your functions

```bash
yarn add -D vite @funcd-dev/vite-plugin
```

```ts
// vite.config.ts
import { funcd } from '@funcd-dev/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({ plugins: [funcd({ functions: { counter: 'src/main.ts' } })] });
```

`vite build` writes `dist/counter.mjs` and copies the function's contract file, `counter.contract.yaml` at the
project root, beside it, so `funcdctl push dist/counter.mjs <ref>` reads the runtime and the contract from it (funcd
ADR-0247). The Function's bindings and stores live in its resource file, `counter.yaml`.
See [`vite-plugin/README.md`](vite-plugin/README.md).

## Develop

```bash
nix develop -c just ci
```

The dev shell also installs the git hooks. They format and lint staged files, check the commit
message, and run the tests before a push.

## Releases

Versions follow semver and come from [release-please](https://github.com/googleapis/release-please).
PR titles are Conventional Commits, and merging the release PR tags `vX.Y.Z`.

Some example READMEs mention funcd's `just` recipes and `e2e/` suites. Those live in
[pyvvo/funcd](https://github.com/pyvvo/funcd).

## License

[Apache-2.0](LICENSE). Copyright 2026 The funcd Authors.
