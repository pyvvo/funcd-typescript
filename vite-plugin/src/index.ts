// The funcd Vite plugin (funcd ADR-0144): it bundles each function into one self-contained ES module that the
// nodejs22 shim loads, and copies the function's contract file beside it, where `funcdctl push` reads it (funcd
// ADR-0247). Each function is its own Vite environment, because one build with several inputs splits shared code into chunks. Each environment builds
// into its own staging directory, and the plugin copies the result into outDir: Vite would otherwise empty a shared
// outDir once per function, and warns when outDir is the project root. Under `vite build --watch` (funcd ADR-0244)
// Vite starts every environment's watcher before any build ends, so each function is delivered when its own
// environment's write ends instead, and its contract file is watched too.
import { copyFileSync, existsSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { basename, dirname, join, resolve } from 'node:path';

import type { EnvironmentOptions, Plugin } from 'vite';

export interface FuncdPluginOptions {
  /** Function name → handler source, relative to the Vite root. Default: { [basename(root)]: 'src/main.ts' }. */
  functions?: Record<string, string>;
  /** Directory for `<name>.mjs` (and the copied contract file), relative to the Vite root. Default: 'dist'. */
  outDir?: string;
}

const prefix = 'funcd_';
const contractSuffixes = ['.contract.yaml', '.contract.json'];
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
      functions = options.functions ?? { [basename(root)]: 'src/main.ts' };
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
        contractFor(root, name); // fail before building when a function has no contract file
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
        this.addWatchFile(contractFor(root, name));
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

// deliver copies each function's staged <name>.mjs and its contract file into outDir.
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
  copyContracts(root, outDir, names, copy);
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

// contractFor returns the function's contract file, <root>/<name>.contract.yaml or .json (funcd ADR-0247). A function
// with neither, or with both, fails, and so does a project that still has a funcdctl.yaml, which nothing reads now.
function contractFor(root: string, name: string): string {
  const manifests = [join(root, name + manifestSuffix), join(root, genericManifest)].filter((p) => existsSync(p));
  if (manifests.length > 0) {
    throw new Error(
      `funcd: ${manifests.join(' and ')} is no longer read (funcd ADR-0247): put function "${name}"'s runtime, ` +
        `protocol and contract in ${join(root, name + contractSuffixes[0])}, and its bindings in its Function resource file`,
    );
  }
  const [yaml, json] = contractSuffixes.map((suffix) => join(root, name + suffix));
  const found = [yaml, json].filter((p) => existsSync(p));
  if (found.length === 0) {
    throw new Error(`funcd: function "${name}" has no contract file: neither ${yaml} nor ${json} exists`);
  }
  if (found.length > 1) {
    throw new Error(`funcd: function "${name}" has two contract files, ${yaml} and ${json}: keep one`);
  }
  return found[0];
}

// copyContracts puts each contract file beside its output, unless the output directory is the one that holds it, and
// removes a copy of the other variant there, which push would refuse beside it.
function copyContracts(root: string, outDir: string, names: string[], copy: (from: string, to: string) => void): void {
  for (const name of names) {
    const contract = contractFor(root, name);
    if (dirname(contract) === outDir) {
      continue;
    }
    for (const suffix of contractSuffixes) {
      const target = join(outDir, name + suffix);
      if (contract.endsWith(suffix)) {
        copy(contract, target);
      } else {
        rmSync(target, { force: true });
      }
    }
  }
}
