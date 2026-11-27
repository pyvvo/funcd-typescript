// Scenario tests for WebSocket in a Function with spec.protocol: http (funcd ADR-0360): upgradeWebSocket from
// @funcd-dev/shim/ws, the handshake the shim completes with @hono/node-server's own support, the message cap, the
// context each event runs in, and the span of the upgrade call.
import assert from 'node:assert/strict';
import { once } from 'node:events';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { type TestContext, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import WebSocket from 'ws';

import { createHttpApp, wsServer } from '../src/shim.ts';
import { WS_UPGRADE } from '../src/types.ts';
import { upgradeWebSocket } from '../src/ws.ts';
import { startEntrypoint } from './entrypoint.ts';
import { handle } from './wsapp.ts';

type Sink = (line: string) => void;

/** serveShim serves the test app through the shim's http app and its WebSocket server, as main() does, and returns
 *  the address it listens on. */
async function serveShim(t: TestContext, sink?: Sink): Promise<string> {
  const server = serve({
    fetch: createHttpApp(handle, { sink, fnName: 'devices-api' }).fetch,
    hostname: '127.0.0.1',
    port: 0,
    websocket: { server: wsServer() },
  });
  await once(server, 'listening');
  t.after(() => {
    if ('closeAllConnections' in server) server.closeAllConnections();
    server.close();
  });
  return `127.0.0.1:${(server.address() as AddressInfo).port}`;
}

/** connect opens a socket on path and closes it when the test ends. */
async function connect(t: TestContext, address: string, path: string, headers: Record<string, string> = {}) {
  const ws = new WebSocket(`ws://${address}${path}`, { headers });
  t.after(() => ws.terminate());
  await once(ws, 'open');
  return ws;
}

const nextMessage = async (ws: WebSocket) => String((await once(ws, 'message'))[0]);

/** A bound on each test, so a socket that never answers fails the test instead of hanging it. */
const bounded = { timeout: 10_000 };

test('scenario ws-relay: a message from one socket reaches the other, and not the sender', bounded, async (t) => {
  const address = await serveShim(t);
  const a = await connect(t, address, '/relay');
  const b = await connect(t, address, '/relay');
  const atB = nextMessage(b);
  a.send('left');
  assert.equal(await atB, 'left');
  const atA = nextMessage(a);
  b.send('right');
  assert.equal(await atA, 'right', 'the first message at A is B’s, not its own echoed');
});

test(
  'scenario ws-not-taken: an upgrade that no route takes gets the app’s status and headers, with an empty body',
  bounded,
  async (t) => {
    const address = await serveShim(t);
    const [host, port] = address.split(':');
    const req = http.request({
      host,
      port: Number(port),
      path: '/plain',
      headers: {
        connection: 'Upgrade',
        upgrade: 'websocket',
        'sec-websocket-version': '13',
        'sec-websocket-key': 'dGhlIHNhbXBsZSBub25jZQ==',
      },
    });
    req.end();
    const [res] = (await once(req, 'response')) as [http.IncomingMessage];
    let body = '';
    for await (const chunk of res) body += String(chunk);
    assert.equal(res.statusCode, 200);
    assert.equal(res.headers['x-plain'], 'yes');
    assert.equal(body, '');

    const plain = await fetch(`http://${address}/relay`);
    assert.equal(plain.status, 404, 'a GET with no Upgrade header goes to the next handler');
  },
);

test(
  'scenario ws-message-cap: a message over 1 MiB closes its socket with 1009, and a new socket opens',
  bounded,
  async (t) => {
    const address = await serveShim(t);
    const ws = await connect(t, address, '/relay');
    const closed = once(ws, 'close');
    ws.send('x'.repeat((1 << 20) + 1));
    const [code] = (await closed) as [number];
    assert.equal(code, 1009);
    await connect(t, address, '/relay');
  },
);

test(
  'an event runs after onOpen, in the upgrade call’s context: its principal, with no deadline',
  bounded,
  async (t) => {
    const address = await serveShim(t);
    const principal = Buffer.from(JSON.stringify({ provider: 'oidc', claims: {} })).toString('base64');
    const ws = await connect(t, address, '/order', {
      'x-funcd-principal': principal,
      'x-funcd-principal-id': 'ada',
      'x-funcd-timeout-ms': '5000',
    });
    const answer = nextMessage(ws);
    ws.send('hi');
    assert.equal(await answer, 'open,message,ada,null');
  },
);

test('the upgrade call’s span ends at the handshake, and at a refused upgrade', bounded, async (t) => {
  const lines: string[] = [];
  const spans = () =>
    lines
      .join('')
      .split('\n')
      .filter((l) => l.length > 0)
      .map((l) => JSON.parse(l) as Record<string, unknown>)
      .filter((r) => r['funcd.signal'] === 'traces');
  const address = await serveShim(t, (line) => lines.push(line));
  await connect(t, address, '/relay');
  assert.equal(spans().length, 1, 'one span once the socket is open');

  const [host, port] = address.split(':');
  const req = http.request({
    host,
    port: Number(port),
    path: '/plain',
    headers: { connection: 'Upgrade', upgrade: 'websocket' },
  });
  req.end();
  const [res] = (await once(req, 'response')) as [http.IncomingMessage];
  res.resume();
  await once(res, 'end');
  assert.equal(spans().length, 2, 'and one for the refused upgrade');
});

test(
  'upgradeWebSocket goes to the next handler without an Upgrade header, and fails with no hook',
  bounded,
  async () => {
    const app = new Hono()
      .get(
        '/relay',
        upgradeWebSocket(() => ({})),
      )
      .get('/relay', (c) => c.text('next'))
      .onError((err, c) => c.text(err.message, 500));
    assert.equal(await (await app.request('/relay')).text(), 'next');
    const noHook = await app.request('/relay', { headers: { upgrade: 'websocket' } }, { funcd: {} });
    assert.equal(noHook.status, 500);
    assert.match(await noHook.text(), /ADR-0360/);
    const hooked = await app.request(
      '/relay',
      { headers: { upgrade: 'WebSocket' } },
      { funcd: { [WS_UPGRADE]: async () => new Response('taken') } },
    );
    assert.equal(await hooked.text(), 'taken', 'the Upgrade header matches in any case');
  },
);

test('the shim’s entrypoint takes WebSockets under FUNCD_PROTOCOL=http', bounded, async (t) => {
  const shim = await startEntrypoint('shim', {
    FUNCD_ARTIFACT: fileURLToPath(new URL('./wsapp.ts', import.meta.url)),
    FUNCD_PROTOCOL: 'http',
  });
  t.after(() => shim.child.kill());
  const address = `127.0.0.1:${shim.port}`;
  const a = await connect(t, address, '/relay');
  const b = await connect(t, address, '/relay');
  const atB = nextMessage(b);
  a.send('left');
  assert.equal(await atB, 'left');
});
