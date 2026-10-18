# @funcd-dev/vite-plugin

A [Vite](https://vite.dev) plugin that bundles each [funcd](https://github.com/pyvvo/funcd) function
into one self-contained ES module for the funcd Node runtime (funcd ADR-0144).

```bash
yarn add -D vite @funcd-dev/vite-plugin
```

```ts
// vite.config.ts
import { funcd } from '@funcd-dev/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [funcd({ functions: { front: 'src/front.ts', greeter: 'src/greeter.ts' } })],
});
```

`vite build` builds each function as its own Vite environment, so no code is split into a shared
chunk:

- `dist/<name>.mjs`: the handler with its dependencies inlined, ESM for Node 22, Node builtins left
  external, not minified.
- `dist/<name>.funcdctl.yaml`: the function's manifest, copied from `<name>.funcdctl.yaml` or else
  `funcdctl.yaml` at the project root. A function with neither fails the build.

Then `funcdctl push dist/<name>.mjs <ref>` takes the contract and runtime from the manifest beside
the file.

| Option | Default | What |
|---|---|---|
| `functions` | `{ <root dir name>: 'src/handler.ts' }` | function name → handler source, relative to the Vite root |
| `outDir` | `'dist'` | where `<name>.mjs` goes; the project root (`'.'`) works too, and then the manifest is not copied |

Each function builds into a staging directory under Vite's cache directory, and the plugin copies the
result into `outDir`, so a shared output directory is never emptied.

## Watch mode

`vite build --watch` keeps `outDir` current, one function at a time (funcd ADR-0244):

- When a function's rebuild ends, its `<name>.mjs` and manifest are written to `outDir`; the other
  functions' files are not touched. Each file is written beside its target and renamed over it, so a
  reader never sees half a file.
- Saving a function's manifest rebuilds it, and saving the shared `funcdctl.yaml` rebuilds every
  function that uses it. A manifest created while the watch runs takes effect at that function's next
  rebuild.
- A failed rebuild prints the error and keeps the function's last good files; the watch goes on.

Beside it, `funcdctl dev` reloads each function whose files change, so a saved handler answers with
its new code within about a second:

```bash
vite build --watch    # terminal 1
funcdctl dev dist     # terminal 2
```

A plain `vite build` still writes `outDir` only after every function has built, and writes nothing
when one fails.
