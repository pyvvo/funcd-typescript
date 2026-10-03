import assert from 'node:assert/strict';
import { dirname } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { runInTempDir, siblingTests } from '../../shim/test/tempdir.ts';

const pluginDir = dirname(dirname(fileURLToPath(import.meta.url)));

test('issue r33: the vite-plugin tests leave nothing in the OS temp dir', (t) => {
  const run = runInTempDir(t, pluginDir, [
    '--test',
    '--test-reporter=tap',
    '--experimental-strip-types',
    ...siblingTests(import.meta.url),
  ]);
  assert.match(run.stdout, /^# pass [1-9]/m, `the test files did not run: ${run.stderr}`);
  assert.deepEqual(run.left, [], 'a test left its temp dir behind');
});
