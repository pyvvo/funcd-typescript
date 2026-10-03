import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import type { TestContext } from 'node:test';
import { fileURLToPath } from 'node:url';

// tempDir makes a fresh directory under the OS temp dir and removes it when the test ends.
export function tempDir(t: TestContext, prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

// siblingTests lists the other test files in the directory of the test file at url.
export function siblingTests(url: string): string[] {
  const self = fileURLToPath(url);
  const dir = dirname(self);
  return readdirSync(dir)
    .filter((f) => f.endsWith('.test.ts') && f !== basename(self))
    .map((f) => join(dir, f));
}

// runInTempDir runs node with args in cwd and TMPDIR set to a fresh directory, and returns the output and
// what the run left in that directory. NODE_TEST_CONTEXT is cleared because node:test skips a run nested
// in a test file that inherits it.
export function runInTempDir(
  t: TestContext,
  cwd: string,
  args: string[],
): { stdout: string; stderr: string; left: string[] } {
  const tmp = tempDir(t, 'funcd-tmp-');
  const run = spawnSync(process.execPath, args, {
    cwd,
    env: { ...process.env, TMPDIR: tmp, NODE_TEST_CONTEXT: undefined },
    encoding: 'utf8',
  });
  return { stdout: run.stdout, stderr: run.stderr, left: readdirSync(tmp) };
}
