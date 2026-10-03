import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { runInTempDir, siblingTests } from './tempdir.ts';

const shimDir = dirname(dirname(fileURLToPath(import.meta.url)));
const tests = ['--test', '--test-reporter=tap', '--experimental-strip-types'];

test('issue r25: the shim tests leave nothing in the OS temp dir', (t) => {
  const run = runInTempDir(t, shimDir, [...tests, ...siblingTests(import.meta.url)]);
  assert.match(run.stdout, /^# pass [1-9]/m, `the test files did not run: ${run.stderr}`);
  assert.deepEqual(run.left, [], 'a test left its temp dir behind');
});

test('issue r33: the build tests remove their temp dirs when buildContract throws', (t) => {
  const build = pathToFileURL(join(shimDir, 'src', 'build.ts')).href;
  const preload =
    "import { mock } from 'node:test';\n" +
    `mock.module(${JSON.stringify(build)}, { namedExports: { buildContract() { throw new Error('buildContract failed'); } } });\n`;
  const run = runInTempDir(t, shimDir, [
    ...tests,
    '--experimental-test-module-mocks',
    '--import',
    `data:text/javascript,${encodeURIComponent(preload)}`,
    join(shimDir, 'test', 'build.test.ts'),
  ]);
  assert.match(run.stdout, /^# fail [1-9]/m, `the build tests did not fail on the mock: ${run.stderr}`);
  assert.deepEqual(run.left, [], 'a failing build test left its temp dir behind');
});
