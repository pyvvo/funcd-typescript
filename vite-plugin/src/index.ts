// The funcd Vite plugin (funcd ADR-0144): it bundles each function into one self-contained ES module that the
// nodejs22 shim loads, and puts the function's funcdctl.yaml where `funcdctl push` resolves it. Each function is its
// own Vite environment, because one build with several inputs splits shared code into chunks. Each environment builds
// into its own staging directory, and the plugin copies the result into outDir: Vite would otherwise empty a shared
// outDir once per function, and warns when outDir is the project root. Under `vite build --watch` (funcd ADR-0244)
// Vite starts every environment's watcher before any build ends, so each function is delivered when its own
// environment's write ends instead, and its manifest is watched too.
import { copyFileSync, existsSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { basename, dirname, join, resolve } from 'node:path';

import type { EnvironmentOptions, Plugin } from 'vite';

export interface FuncdPluginOptions {
  /** Function name → handler source, relative to the Vite root. Default: { [basename(root)]: 'src/handler.ts' }. */
  functions?: Record<string, string>;
  /** Directory for `<name>.mjs` (and the copied manifest), relative to the Vite root. Default: 'dist'. */
  outDir?: string;
}

const prefix = 'funcd_';
const manifestSuffix = '.funcdctl.yaml';
const genericManifest = 'funcdctl.yaml';

// Bundled CommonJS calls require() for Node builtins; an ES module has none, so give it a real one.
const requireBanner =
  "import { createRequire as __funcdCreateRequire } from 'node:module'; const require = __funcdCreateRequire(import.meta.url);";

/** The Vite environment name for a function name (Vite allows only [A-Za-z0-9_$]). */
export function environmentName(name: string): string {
  return prefix + name.replace(/[^A-Za-z0-9_$]/g, '_');
}

/** One Vite environment per function; `vite build` writes `<outDir>/<name>.mjs` for each. */
export function funcd(options: FuncdPluginOptions = {}): Plugin[] {
  const outDirOption = options.outDir ?? 'dist';
  let functions: Record<string, string> = {};
  let root = '';
  let staging = '';
  const byEnvironment = new Map<string, string>();

  const plugin: Plugin = {
    name: 'funcd',
    config(userConfig) {
      root = resolve(userConfig.root ?? process.cwd());
      staging = resolve(root, userConfig.cacheDir ?? 'node_modules/.vite', 'funcd');
      functions = options.functions ?? { [basename(root)]: 'src/handler.ts' };
      const names = Object.keys(functions);
      if (names.length === 0) {
        throw new Error('funcd: no function to build (options.functions is empty)');
      }
      byEnvironment.clear();
      const environments: Record<string, EnvironmentOptions> = {};
      for (const name of names) {
        const env = environmentName(name);
        const other = byEnvironment.get(env);
        if (other !== undefined) {
          throw new Error(`funcd: functions "${other}" and "${name}" map to the same Vite environment "${env}"`);
        }
        byEnvironment.set(env, name);
        manifestFor(root, name); // fail before building when a function has no manifest
        environments[env] = {
          consumer: 'server',
          resolve: { noExternal: true },
          build: {
            outDir: join(staging, env),
            emptyOutDir: true,
            copyPublicDir: false,
            minify: false,
            target: 'node22',
            ssr: true,
            rolldownOptions: {
              input: { [name]: resolve(root, functions[name]) },
              external: [...builtinModules, /^node:/],
              output: {
                format: 'es',
                entryFileNames: '[name].mjs',
                codeSplitting: false,
                banner: requireBanner,
              },
            },
          },
        };
      }
      return {
        environments,
        builder: {
          async buildApp(builder) {
            for (const env of Object.values(builder.environments)) {
              if (byEnvironment.has(env.name)) {
                await builder.build(env);
              }
            }
            if (builder.config.build.watch) {
              return; // build() returned the watchers before any build ended; writeBundle delivers each function
            }
            deliver(root, staging, resolve(root, outDirOption), names, copyFileSync);
          },
        },
      };
    },
    buildStart() {
      const name = byEnvironment.get(this.environment.name);
      if (name !== undefined) {
        this.addWatchFile(manifestFor(root, name));
      }
    },
    writeBundle() {
      const name = byEnvironment.get(this.environment.name);
      if (name !== undefined && this.environment.config.build.watch) {
        deliver(root, staging, resolve(root, outDirOption), [name], replaceFile);
      }
    },
  };
  return [plugin];
}

// deliver copies each function's staged <name>.mjs and its manifest into outDir.
function deliver(
  root: string,
  staging: string,
  outDir: string,
  names: string[],
  copy: (from: string, to: string) => void,
): void {
  mkdirSync(outDir, { recursive: true });
  for (const name of names) {
    copy(join(staging, environmentName(name), `${name}.mjs`), join(outDir, `${name}.mjs`));
  }
  copyManifests(root, outDir, names, copy);
}

// replaceFile copies from over to by a rename, so a reader that polls outDir (funcdctl dev) never loads half a file.
// The temporary file is a dot-file beside the target: the rename stays on one filesystem, and funcdctl dev's
// directory scan skips it.
function replaceFile(from: string, to: string): void {
  const tmp = join(dirname(to), `.${basename(to)}.${process.pid}.tmp`);
  try {
    copyFileSync(from, tmp);
    renameSync(tmp, to);
  } catch (err) {
    rmSync(tmp, { force: true });
    throw err;
  }
}

// manifestFor returns the function's manifest: <root>/<name>.funcdctl.yaml, else <root>/funcdctl.yaml (ADR-0124).
function manifestFor(root: string, name: string): string {
  const stem = join(root, name + manifestSuffix);
  if (existsSync(stem)) {
    return stem;
  }
  const generic = join(root, genericManifest);
  if (existsSync(generic)) {
    return generic;
  }
  throw new Error(`funcd: function "${name}" has no manifest: neither ${stem} nor ${generic} exists`);
}

// copyManifests puts each manifest beside its output as <name>.funcdctl.yaml, unless the output directory is the one
// that holds it: there funcdctl's resolver already finds it for <name>.mjs.
function copyManifests(root: string, outDir: string, names: string[], copy: (from: string, to: string) => void): void {
  for (const name of names) {
    const manifest = manifestFor(root, name);
    if (dirname(manifest) === outDir) {
      continue;
    }
    copy(manifest, join(outDir, name + manifestSuffix));
  }
}
