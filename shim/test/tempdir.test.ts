import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { tempDir } from './tempdir.ts';

const self = fileURLToPath(import.meta.url);
const testDir = dirname(self);

// NODE_TEST_CONTEXT is cleared because node:test skips a run nested in a test file that inherits it.
test('issue r25: the shim tests leave nothing in the OS temp dir', (t) => {
  const tmp = tempDir(t, 'funcd-tmp-');
  const files = readdirSync(testDir)
    .filter((f) => f.endsWith('.test.ts') && f !== basename(self))
    .map((f) => join(testDir, f));
  const run = spawnSync(process.execPath, ['--test', '--test-reporter=tap', '--experimental-strip-types', ...files], {
    cwd: dirname(testDir),
    env: { ...process.env, TMPDIR: tmp, NODE_TEST_CONTEXT: undefined },
    encoding: 'utf8',
  });
  assert.match(run.stdout, /^# pass [1-9]/m, `the test files did not run: ${run.stderr}`);
  assert.deepEqual(readdirSync(tmp), [], 'a test left its temp dir behind');
});
