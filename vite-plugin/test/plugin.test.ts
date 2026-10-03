// Scenario tests for the funcd Vite plugin (funcd ADR-0144). Each builds a fixture project in a temp dir.
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { type TestContext, test } from 'node:test';
import { pathToFileURL } from 'node:url';

import { createBuilder } from 'vite';

import { tempDir } from '../../shim/test/tempdir.ts';
import { environmentName, type FuncdPluginOptions, funcd } from '../src/index.ts';

const manifest = 'runtime: nodejs22\nhandler: handle\n';

function fixture(t: TestContext, files: Record<string, string>): string {
  const root = tempDir(t, 'funcd-vite-');
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(join(root, path, '..'), { recursive: true });
    writeFileSync(join(root, path), body);
  }
  return root;
}

async function build(root: string, options: FuncdPluginOptions): Promise<void> {
  const builder = await createBuilder({ root, configFile: false, logLevel: 'silent', plugins: [funcd(options)] });
  await builder.buildApp();
}

const shared = {
  'src/shared.ts': "export const greet = (name: string): string => 'hello ' + name;\n",
  'src/env-echo.ts':
    "import { createHash } from 'node:crypto';\nimport { greet } from './shared.ts';\n" +
    "export async function handle(): Promise<unknown> { return { msg: greet('echo'), h: createHash('sha1').update('x').digest('hex') }; }\n",
  'src/front.ts':
    "import { greet } from './shared.ts';\nexport async function handle(): Promise<unknown> { return { msg: greet('front') }; }\n",
};

// scenario: vite-builds-one-file-per-function
test('scenario: vite-builds-one-file-per-function', async (t) => {
  const root = fixture(t, { ...shared, 'funcdctl.yaml': manifest });
  await build(root, { functions: { 'env-echo': 'src/env-echo.ts', front: 'src/front.ts' } });

  const out = join(root, 'dist');
  const mjs = readdirSync(out).filter((f) => f.endsWith('.js') || f.endsWith('.mjs'));
  assert.deepEqual(mjs.sort(), ['env-echo.mjs', 'front.mjs'], 'one file per function, no shared chunk');
  for (const [name, msg] of [
    ['env-echo', 'hello echo'],
    ['front', 'hello front'],
  ]) {
    const src = readFileSync(join(out, `${name}.mjs`), 'utf8');
    assert.doesNotMatch(src, /from ['"]\.\//, `${name}.mjs imports no sibling file`);
    const mod = await import(pathToFileURL(join(out, `${name}.mjs`)).href);
    const result = (await mod.handle()) as { msg: string };
    assert.equal(result.msg, msg);
  }
});

// scenario: vite-output-pushes-from-manifest
test('scenario: vite-output-pushes-from-manifest (stem and generic manifests, separate outDir)', async (t) => {
  const root = fixture(t, { ...shared, 'front.funcdctl.yaml': `${manifest}# front\n`, 'funcdctl.yaml': manifest });
  await build(root, { functions: { 'env-echo': 'src/env-echo.ts', front: 'src/front.ts' } });

  const out = join(root, 'dist');
  assert.equal(
    readFileSync(join(out, 'front.funcdctl.yaml'), 'utf8'),
    `${manifest}# front\n`,
    'the stem manifest wins',
  );
  assert.equal(readFileSync(join(out, 'env-echo.funcdctl.yaml'), 'utf8'), manifest, 'else the generic manifest');
});

test('scenario: vite-output-pushes-from-manifest (outDir is the root: no copy)', async (t) => {
  const root = fixture(t, { ...shared, 'funcdctl.yaml': manifest });
  await build(root, { functions: { front: 'src/front.ts' }, outDir: '.' });

  assert.ok(existsSync(join(root, 'front.mjs')));
  assert.ok(!existsSync(join(root, 'front.funcdctl.yaml')), 'funcdctl resolves the root funcdctl.yaml already');
  assert.ok(existsSync(join(root, 'src', 'front.ts')), 'sources are untouched');
});

// scenario: vite-missing-manifest-fails
test('scenario: vite-missing-manifest-fails', async (t) => {
  const root = fixture(t, shared);
  await assert.rejects(build(root, { functions: { front: 'src/front.ts' } }), (err: Error) => {
    assert.match(err.message, /front\.funcdctl\.yaml/);
    // the generic path, which the stem path cannot satisfy
    assert.match(err.message, /[/\\]funcdctl\.yaml/);
    return true;
  });
});

test('an environment-name collision fails', async (t) => {
  const root = fixture(t, { ...shared, 'funcdctl.yaml': manifest });
  await assert.rejects(
    build(root, { functions: { 'a-b': 'src/front.ts', a_b: 'src/front.ts' } }),
    /same Vite environment "funcd_a_b"/,
  );
});

test('environment names are valid Vite names', () => {
  assert.equal(environmentName('env-echo'), 'funcd_env_echo');
  assert.equal(environmentName('kv.counter'), 'funcd_kv_counter');
  assert.match(environmentName('hello-world'), /^[\w$]+$/);
});
