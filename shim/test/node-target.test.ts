import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

// The engines floor is the Node major of the runtime image the shim ships in (funcd ADR-0039). yarn runs the tests
// on the Node that runs yarn itself, so a toolchain change can move them off that major without failing anything else.
test('issue r61: the tests run on the Node major the shim targets', () => {
  const engines: string = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).engines.node;
  const floor = /^>=\s*(\d+)(\.\d+){0,2}$/.exec(engines);
  assert.ok(floor, `shim/package.json engines.node is not a >= floor: ${engines}`);
  assert.equal(
    process.versions.node.split('.')[0],
    floor[1],
    `the tests run on Node ${process.versions.node}, but the shim targets Node ${floor[1]} (shim/package.json engines.node)`,
  );
});
