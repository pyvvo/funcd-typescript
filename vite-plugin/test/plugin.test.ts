// Scenario tests for the funcd Vite plugin (funcd ADR-0144, ADR-0247). Each builds a fixture project in a temp dir.
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { type TestContext, test } from 'node:test';
import { pathToFileURL } from 'node:url';

import { createBuilder } from 'vite';

import { tempDir } from '../../shim/test/tempdir.ts';
import { environmentName, type FuncdPluginOptions, funcd } from '../src/index.ts';

const contract = 'runtime: nodejs22\ninput:\n  type: object\noutput:\n  type: object\n';
const contractJSON = '{"runtime":"nodejs22","input":{"type":"object"},"output":{"type":"object"}}\n';

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
const contracts = { 'env-echo.contract.yaml': contract, 'front.contract.yaml': contract };
const both = { 'env-echo': 'src/env-echo.ts', front: 'src/front.ts' };

// scenario: vite-builds-one-file-per-function
test('scenario: vite-builds-one-file-per-function', async (t) => {
  const root = fixture(t, { ...shared, ...contracts });
  await build(root, { functions: both });

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

// scenario: bundlers-copy-the-contract
test('scenario: bundlers-copy-the-contract (a .yaml and a .json contract, separate outDir)', async (t) => {
  const root = fixture(t, {
    ...shared,
    'front.contract.yaml': contract,
    'env-echo.contract.json': contractJSON,
    // a copy of the variant the project no longer has, left by an earlier build
    'dist/env-echo.contract.yaml': contract,
  });
  await build(root, { functions: both });

  const out = join(root, 'dist');
  assert.equal(readFileSync(join(out, 'front.contract.yaml'), 'utf8'), contract);
  assert.equal(readFileSync(join(out, 'env-echo.contract.json'), 'utf8'), contractJSON);
  assert.ok(!existsSync(join(out, 'env-echo.contract.yaml')), 'the stale copy of the other variant is removed');
});

test('scenario: bundlers-copy-the-contract (outDir is the root: no copy)', async (t) => {
  const root = fixture(t, { ...shared, 'front.contract.yaml': contract });
  await build(root, { functions: { front: 'src/front.ts' }, outDir: '.' });

  assert.ok(existsSync(join(root, 'front.mjs')));
  assert.equal(readFileSync(join(root, 'front.contract.yaml'), 'utf8'), contract, 'the contract file stays as it is');
  assert.ok(existsSync(join(root, 'src', 'front.ts')), 'sources are untouched');
});

test('scenario: bundlers-copy-the-contract (a function without one fails, naming the paths)', async (t) => {
  const root = fixture(t, shared);
  await assert.rejects(build(root, { functions: { front: 'src/front.ts' } }), (err: Error) => {
    assert.match(err.message, /"front" has no contract file/);
    assert.match(err.message, /front\.contract\.yaml/);
    assert.match(err.message, /front\.contract\.json/);
    return true;
  });
});

test('two contract files of one function fail', async (t) => {
  const root = fixture(t, { ...shared, 'front.contract.yaml': contract, 'front.contract.json': contractJSON });
  await assert.rejects(
    build(root, { functions: { front: 'src/front.ts' } }),
    /"front" has two contract files, .*front\.contract\.yaml and .*front\.contract\.json/,
  );
});

// scenario: old-manifest-refused
for (const manifest of ['funcdctl.yaml', 'front.funcdctl.yaml']) {
  test(`scenario: old-manifest-refused (${manifest})`, async (t) => {
    const root = fixture(t, { ...shared, 'front.contract.yaml': contract, [manifest]: 'runtime: nodejs22\n' });
    await assert.rejects(build(root, { functions: { front: 'src/front.ts' } }), (err: Error) => {
      assert.match(err.message, new RegExp(`[/\\\\]${manifest.replace('.', '\\.')} is no longer read`));
      assert.match(err.message, /front\.contract\.yaml/, 'it names the contract file that replaces it');
      assert.match(err.message, /Function resource file/, 'and where the bindings go');
      return true;
    });
  });
}

test('the default entry is src/main.ts, for a function named after the folder', async (t) => {
  const root = fixture(t, { 'src/main.ts': 'export async function handle(): Promise<unknown> { return 1; }\n' });
  const name = basename(root);
  writeFileSync(join(root, `${name}.contract.yaml`), contract);
  await build(root, {});
  assert.ok(existsSync(join(root, 'dist', `${name}.mjs`)));
  assert.ok(existsSync(join(root, 'dist', `${name}.contract.yaml`)));
});

// scenario: vite-build-unchanged
test('scenario: vite-build-unchanged', async (t) => {
  const root = fixture(t, { ...shared, ...contracts });
  const out = join(root, 'dist');
  const files = (): string[][] => readdirSync(out).map((f) => [f, readFileSync(join(out, f), 'utf8')]);
  await build(root, { functions: both });
  const before = files();

  writeFileSync(join(root, 'src/env-echo.ts'), shared['src/env-echo.ts'].replace("greet('echo')", "greet('echo-v2')"));
  writeFileSync(join(root, 'src/front.ts'), 'export async function handle( {\n');
  await assert.rejects(build(root, { functions: both }));
  const staged = join(root, 'node_modules/.vite/funcd', environmentName('env-echo'), 'env-echo.mjs');
  assert.match(readFileSync(staged, 'utf8'), /echo-v2/, 'env-echo was built before front failed');
  assert.deepEqual(files(), before, 'outDir is as it was');
});

test('an environment-name collision fails', async (t) => {
  const root = fixture(t, { ...shared, 'a-b.contract.yaml': contract, 'a_b.contract.yaml': contract });
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
