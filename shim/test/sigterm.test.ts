import { type TestContext, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

import { startEntrypoint } from './entrypoint.ts';
import { tempDir } from './tempdir.ts';

// In a container the shim is PID 1, and the kernel drops any signal PID 1 does not handle. This preload stands in for
// that: the process reads PID 1, and a listener swallows each SIGTERM the shim does not act on itself, as the kernel
// did, so funcd's stop waited out its grace and sent SIGKILL.
const asPid1 = [
  '--import',
  'data:text/javascript,Object.defineProperty(process,"pid",{value:1});process.on("SIGTERM",()=>{})',
];

// envFor writes a handler and returns the env that runs entry over it.
function envFor(t: TestContext, entry: 'shim' | 'pool'): Record<string, string> {
  const dir = tempDir(t, 'funcd-sigterm-');
  const artifact = join(dir, 'handler.mjs');
  writeFileSync(artifact, 'export function handle() { return { ok: true }; }');
  if (entry === 'shim') return { FUNCD_ARTIFACT: artifact };
  const manifest = join(dir, 'manifest.json');
  writeFileSync(manifest, JSON.stringify([{ name: 'a', artifact }]));
  return { FUNCD_POOL_MANIFEST: manifest };
}

const endedWithin2s = (exited: Promise<unknown>) =>
  Promise.race([exited, sleep(2_000, 'still running', { ref: false })]);

for (const entry of ['shim', 'pool'] as const) {
  test(`the ${entry} exits 143 on SIGTERM when it runs as PID 1`, { timeout: 10_000 }, async (t) => {
    const proc = await startEntrypoint(entry, envFor(t, entry), asPid1);
    t.after(() => proc.child.kill('SIGKILL'));
    proc.child.kill('SIGTERM');
    assert.deepEqual(await endedWithin2s(proc.exited), { code: 143, signal: null });
  });

  // funcd's process driver runs the shim as a child, not as PID 1, and reads its SIGTERM end as that signal (ADR-0160).
  test(`the ${entry} still ends by SIGTERM when it is not PID 1`, { timeout: 10_000 }, async (t) => {
    const proc = await startEntrypoint(entry, envFor(t, entry));
    proc.child.kill('SIGTERM');
    assert.deepEqual(await proc.exited, { code: null, signal: 'SIGTERM' });
  });
}

// A SIGTERM listener runs only on a free event loop. A shim that is not PID 1 keeps Node's default action, which also
// ends it while a stuck call blocks the loop (the solo case of funcd ADR-0226).
test('a shim that is not PID 1 ends by SIGTERM at once while a call blocks its event loop', {
  timeout: 10_000,
}, async (t) => {
  const dir = tempDir(t, 'funcd-sigterm-');
  const artifact = join(dir, 'handler.mjs');
  const started = join(dir, 'started');
  writeFileSync(
    artifact,
    `import { writeFileSync } from 'node:fs';
export function handle() { writeFileSync(${JSON.stringify(started)}, ''); for (;;); }`,
  );
  const proc = await startEntrypoint('shim', { FUNCD_ARTIFACT: artifact });
  t.after(() => proc.child.kill('SIGKILL'));
  void fetch(`http://127.0.0.1:${proc.port}/`, { method: 'POST', body: '{}' }).catch(() => {});
  while (!existsSync(started)) await sleep(10);
  proc.child.kill('SIGTERM');
  assert.deepEqual(await endedWithin2s(proc.exited), { code: null, signal: 'SIGTERM' });
});
