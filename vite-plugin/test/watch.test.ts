// Scenario tests for the funcd Vite plugin under `vite build --watch` (funcd ADR-0244). Each runs Vite's CLI on a
// fixture project and edits the project while the watch runs.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative } from 'node:path';
import { type TestContext, test } from 'node:test';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { tempDir } from '../../shim/test/tempdir.ts';
import { environmentName } from '../src/index.ts';

const plugin = fileURLToPath(new URL('../src/index.ts', import.meta.url));
// vite's package exports do not include its bin, so resolve it from the package directory.
const vite = join(dirname(createRequire(import.meta.url).resolve('vite/package.json')), 'bin', 'vite.js');
const deadline = 30_000;

const manifest = 'runtime: nodejs22\nhandler: handle\n';
const greet = (word: string): string => `export const greet = (name: string): string => '${word} ' + name;\n`;
const changes = "const changes = { name: 'changes', watchChange(id) { console.error('[changed] ' + id); } };\n";
const handler = (msg: string): string =>
  `import { greet } from './shared.ts';\nexport async function handle(): Promise<unknown> { return { msg: greet('${msg}') }; }\n`;

// project writes the scenarios' project: functions front and env-echo, which both import src/shared.ts. Its Vite
// config also prints each file whose change starts a build.
function project(t: TestContext, files: Record<string, string>, outDir = 'dist'): string {
  const root = tempDir(t, 'funcd-vite-watch-');
  const options = { functions: { 'env-echo': 'src/env-echo.ts', front: 'src/front.ts' }, outDir };
  const all: Record<string, string> = {
    'package.json': '{ "type": "module" }\n',
    'vite.config.ts': `import { funcd } from ${JSON.stringify(plugin)};\n${changes}export default { plugins: [funcd(${JSON.stringify(options)}), changes] };\n`,
    'src/shared.ts': greet('hello'),
    'src/env-echo.ts': handler('echo'),
    'src/front.ts': handler('front'),
    ...files,
  };
  for (const [path, body] of Object.entries(all)) {
    mkdirSync(join(root, path, '..'), { recursive: true });
    writeFileSync(join(root, path), body);
  }
  return root;
}

interface Watch {
  // builds counts a function's writes: Vite prints the staged file after each one, once writeBundle has delivered it.
  // One save can start more than one build (macOS may report a write twice), so only a count that must stay put is
  // asserted, never one that must grow by exactly one.
  builds(name: string): number;
  // changed lists the files, relative to the project, whose change started a build.
  changed(): string[];
  failures(): number;
  printed(text: string): boolean;
  alive(): boolean;
  until(what: string, ready: () => boolean): Promise<void>;
  stop(): Promise<void>;
}

// watch runs `vite build --watch` in root. The test stops it in a finally, before tempDir's cleanup removes root.
function watch(root: string): Watch {
  const child = spawn(process.execPath, [vite, 'build', '--watch'], {
    cwd: root,
    // Vite's CLI turns on Node's compile cache, which would stay behind in the OS temp dir.
    env: { ...process.env, NO_COLOR: '1', NODE_DISABLE_COMPILE_CACHE: '1' },
  });
  let out = '';
  child.stdout.on('data', (d) => {
    out += d;
  });
  child.stderr.on('data', (d) => {
    out += d;
  });
  const count = (text: string): number => out.split(text).length - 1;
  const alive = (): boolean => child.exitCode === null && child.signalCode === null;
  return {
    builds: (name) => count(`${environmentName(name)}/${name}.mjs`),
    changed: () =>
      out
        .split('\n')
        .filter((l) => l.startsWith('[changed] '))
        .map((l) => relative(realpathSync(root), l.slice('[changed] '.length))),
    failures: () => count('Build failed'),
    printed: (text) => out.includes(text),
    alive,
    async until(what, ready) {
      const end = Date.now() + deadline;
      while (!ready()) {
        assert.ok(alive(), `vite exited while waiting for ${what}:\n${out}`);
        assert.ok(Date.now() < end, `timed out waiting for ${what}:\n${out}`);
        await sleep(25);
      }
    },
    async stop() {
      if (alive()) {
        const exited = once(child, 'exit');
        child.kill();
        await exited;
      }
    },
  };
}

// stamp identifies one version of a file: a rewrite in place keeps the inode, a rename gives a new one.
function stamp(path: string): [number, number] {
  const st = statSync(path);
  return [st.ino, st.mtimeMs];
}

// holds reads a file that may not exist yet.
function holds(path: string, text: string): boolean {
  return existsSync(path) && readFileSync(path, 'utf8').includes(text);
}

function firstBuilds(w: Watch): Promise<void> {
  return w.until('the first builds', () => w.builds('front') >= 1 && w.builds('env-echo') >= 1);
}

// scenario: vite-watch-first-build
test('scenario: vite-watch-first-build', async (t) => {
  const root = project(t, { 'funcdctl.yaml': manifest });
  const w = watch(root);
  try {
    await firstBuilds(w);
    for (const [name, msg] of [
      ['front', 'hello front'],
      ['env-echo', 'hello echo'],
    ]) {
      const mod = await import(pathToFileURL(join(root, 'dist', `${name}.mjs`)).href);
      assert.equal(((await mod.handle()) as { msg: string }).msg, msg);
      assert.equal(readFileSync(join(root, 'dist', `${name}.funcdctl.yaml`), 'utf8'), manifest);
    }
    assert.ok(w.alive(), 'vite keeps watching');
  } finally {
    await w.stop();
  }
});

for (const outDir of ['dist', '.']) {
  // scenario: vite-watch-rebuilds-one
  test(`scenario: vite-watch-rebuilds-one (outDir ${outDir})`, async (t) => {
    const root = project(t, { 'funcdctl.yaml': manifest }, outDir);
    const out = join(root, outDir);
    const w = watch(root);
    try {
      await firstBuilds(w);
      const front = stamp(join(out, 'front.mjs'));
      const echo = stamp(join(out, 'env-echo.mjs'));

      writeFileSync(join(root, 'src/front.ts'), handler('front-v2'));
      await w.until('the front rebuild', () => holds(join(out, 'front.mjs'), 'front-v2'));
      assert.notEqual(stamp(join(out, 'front.mjs'))[0], front[0], 'front.mjs is replaced by a rename');
      assert.equal(w.builds('env-echo'), 1, 'env-echo does not rebuild');
      assert.deepEqual(stamp(join(out, 'env-echo.mjs')), echo, 'env-echo.mjs is not rewritten');
      assert.deepEqual(
        readdirSync(out).filter((f) => f.endsWith('.tmp')),
        [],
        'no temporary file is left',
      );

      writeFileSync(join(root, 'src/shared.ts'), greet('salut'));
      await w.until(
        'both rebuilds',
        () => holds(join(out, 'front.mjs'), 'salut') && holds(join(out, 'env-echo.mjs'), 'salut'),
      );
      // A delivery into outDir, the project root included, must start no build: a loop would show here.
      await sleep(500);
      assert.deepEqual(new Set(w.changed()), new Set(['src/front.ts', 'src/shared.ts']), 'only the saves start builds');
    } finally {
      await w.stop();
    }
  });
}

// scenario: vite-watch-manifest
test('scenario: vite-watch-manifest (each function has its own manifest)', async (t) => {
  const root = project(t, { 'front.funcdctl.yaml': manifest, 'env-echo.funcdctl.yaml': manifest });
  const w = watch(root);
  try {
    await firstBuilds(w);
    const echo = stamp(join(root, 'dist/env-echo.funcdctl.yaml'));

    writeFileSync(join(root, 'front.funcdctl.yaml'), `${manifest}# edited\n`);
    await w.until('the front rebuild', () => holds(join(root, 'dist/front.funcdctl.yaml'), '# edited'));
    assert.equal(w.builds('env-echo'), 1, 'env-echo does not rebuild');
    assert.deepEqual(stamp(join(root, 'dist/env-echo.funcdctl.yaml')), echo, "env-echo's copy is not rewritten");
  } finally {
    await w.stop();
  }
});

test('scenario: vite-watch-manifest (both functions use one funcdctl.yaml)', async (t) => {
  const root = project(t, { 'funcdctl.yaml': manifest });
  const w = watch(root);
  try {
    await firstBuilds(w);

    writeFileSync(join(root, 'funcdctl.yaml'), `${manifest}# edited\n`);
    await w.until('both copies', () =>
      ['front', 'env-echo'].every((name) => holds(join(root, `dist/${name}.funcdctl.yaml`), '# edited')),
    );
  } finally {
    await w.stop();
  }
});

// scenario: vite-watch-error-keeps-last
test('scenario: vite-watch-error-keeps-last', async (t) => {
  const root = project(t, { 'front.funcdctl.yaml': manifest, 'env-echo.funcdctl.yaml': manifest });
  const bundle = join(root, 'dist/front.mjs');
  const w = watch(root);
  try {
    await firstBuilds(w);
    const good = readFileSync(bundle, 'utf8');

    writeFileSync(join(root, 'src/front.ts'), 'export async function handle( {\n');
    await w.until('the syntax error', () => w.failures() >= 1);
    assert.equal(readFileSync(bundle, 'utf8'), good, 'the last good build stays');

    writeFileSync(join(root, 'src/front.ts'), handler('front-fixed'));
    await w.until('the fixed rebuild', () => holds(bundle, 'front-fixed'));
    const fixed = readFileSync(bundle, 'utf8');

    rmSync(join(root, 'front.funcdctl.yaml'));
    await w.until('the missing manifest', () => w.failures() >= 2 && w.printed('"front" has no manifest'));
    assert.equal(readFileSync(bundle, 'utf8'), fixed, 'the last good build stays');

    writeFileSync(join(root, 'front.funcdctl.yaml'), `${manifest}# restored\n`);
    await w.until('the rebuild after the restore', () => holds(join(root, 'dist/front.funcdctl.yaml'), '# restored'));
    assert.ok(w.alive(), 'vite keeps watching');
  } finally {
    await w.stop();
  }
});
