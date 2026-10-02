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

## Bundle your functions

```bash
yarn add -D vite @funcd-dev/vite-plugin
```

```ts
// vite.config.ts
import { funcd } from '@funcd-dev/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({ plugins: [funcd({ functions: { counter: 'src/counter.ts' } })] });
```

`vite build` writes `dist/counter.mjs` and the function's `funcdctl.yaml` beside it as
`dist/counter.funcdctl.yaml`, so `funcdctl push dist/counter.mjs <ref>` reads the contract from it.
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
