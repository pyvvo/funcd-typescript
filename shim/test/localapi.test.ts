import { type TestContext, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { createServer, type IncomingHttpHeaders } from 'node:http';
import type { AddressInfo } from 'node:net';
import { fileURLToPath } from 'node:url';

import { makeInvoke } from '../src/invoke.ts';
import { localApi, TOKEN_HEADER } from '../src/localapi.ts';
import { send } from '../src/socket.ts';

// funcd ADR-0346 Decision 6: a worker in a container under funcdctl dev reaches the local API on a listener of its
// own, FUNCD_INVOKE_URL, sending FUNCD_INVOKE_TOKEN in a header; any other worker keeps its socket.

test('localApi prefers FUNCD_INVOKE_URL, with its token, to the socket', () => {
  const api = localApi({
    FUNCD_INVOKE_URL: 'http://127.0.0.1:43210',
    FUNCD_INVOKE_TOKEN: 'tok',
    FUNCD_INVOKE_SOCKET: '/run/funcd/invoke.sock',
  });
  assert.deepEqual(api, { options: { host: '127.0.0.1', port: 43210 }, headers: { [TOKEN_HEADER]: 'tok' } });
  assert.deepEqual(localApi({ FUNCD_INVOKE_URL: 'http://funcd.host:8081' })?.options, {
    host: 'funcd.host',
    port: 8081,
  });
  assert.deepEqual(localApi({ FUNCD_INVOKE_SOCKET: '/run/funcd/invoke.sock' }), {
    options: { socketPath: '/run/funcd/invoke.sock' },
    headers: {},
  });
  assert.equal(localApi({}), undefined);
});

// withEnv sets the env keys for the test and restores them after it.
function withEnv(t: TestContext, env: Record<string, string>): void {
  const saved = Object.fromEntries(Object.keys(env).map((k) => [k, process.env[k]]));
  Object.assign(process.env, env);
  t.after(() => {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });
}

test('the clients send the token to FUNCD_INVOKE_URL', async (t) => {
  const seen: { method?: string; url?: string; headers: IncomingHttpHeaders }[] = [];
  const server = createServer((req, res) => {
    seen.push({ method: req.method, url: req.url, headers: req.headers });
    req.resume();
    req.on('end', () => {
      res.setHeader('content-type', 'application/json');
      res.end('{"ok":true}');
    });
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());
  const { port } = server.address() as AddressInfo;
  withEnv(t, { FUNCD_INVOKE_URL: `http://127.0.0.1:${port}`, FUNCD_INVOKE_TOKEN: 'secret-token' });

  const resp = await send('context.kv', 'GET', '/kv/counter/a', undefined, undefined);
  assert.equal(resp.status, 200);
  const out = await makeInvoke()('pricing', { item: 1 });
  assert.deepEqual(out, { ok: true });

  assert.equal(seen.length, 2);
  assert.equal(seen[0]?.url, '/kv/counter/a');
  assert.equal(seen[1]?.method, 'POST');
  assert.equal(seen[1]?.url, '/invoke/pricing');
  for (const s of seen) assert.equal(s.headers[TOKEN_HEADER], 'secret-token');
});

// funcd ADR-0346 Decision 4: with FUNCD_LOG_STDOUT and no log channel, every console call prints its line to stdout.
test('FUNCD_LOG_STDOUT prints each console record to stdout', () => {
  const funclog = fileURLToPath(new URL('../src/funclog.ts', import.meta.url));
  const script = `import { installConsoleCapture } from ${JSON.stringify(funclog)};
if (!installConsoleCapture({ FUNCD_LOG_STDOUT: '1' }, null)) process.exit(9);
console.log('hello', 42);
console.error('oops');`;
  const run = spawnSync(process.execPath, ['--experimental-strip-types', '--input-type=module', '-e', script], {
    env: { ...process.env, NODE_TEST_CONTEXT: undefined },
    encoding: 'utf8',
  });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(run.stdout, 'hello 42\noops\n');
  assert.doesNotMatch(run.stderr, /oops/);
});
