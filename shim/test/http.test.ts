// Scenario tests for a Function with spec.protocol: http (funcd ADR-0243): the http(app) export, the request the
// shim rebuilds from what the edge forwards, the streamed response, the start check, and context.fetch.
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import http from 'node:http';
import { join } from 'node:path';
import { type TestContext, test } from 'node:test';

import { FETCH_REPLY_HEADER, makeFetch } from '../src/invoke.ts';
import { protocolFrom, resolveHandler, resolveHttpHandler } from '../src/runtime.ts';
import { createHttpApp, http as httpApp, type FunctionContext } from '../src/shim.ts';
import { startEntrypoint } from './entrypoint.ts';
import { tempDir } from './tempdir.ts';

/** What the app saw of one request. */
interface Seen {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | null;
}

/** echoApp answers each request with what it saw, as JSON. */
function echoApp() {
  return httpApp({
    async fetch(request) {
      const headers: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        headers[key] = value;
      });
      const seen: Seen = {
        method: request.method,
        url: request.url,
        headers,
        body: request.body ? await request.text() : null,
      };
      return Response.json(seen);
    },
  });
}

const envelope = (data: unknown) =>
  JSON.stringify({
    specversion: '1.0',
    type: 'io.funcd.invoke',
    source: 'funcd://staging/function/devices-api',
    id: '9f2c41d07a3b5e18',
    data,
  });

async function seen(res: Response): Promise<Seen> {
  assert.equal(res.status, 200);
  return (await res.json()) as Seen;
}

test('scenario http-rest: a GET reaches the app with its path, query and headers, without funcd headers', async () => {
  const app = createHttpApp(echoApp());
  const res = await app.request('/devices/42?full=1', {
    headers: { accept: 'application/json', 'x-funcd-timeout-ms': '5000', 'x-funcd-span-id': 'aaaaaaaaaaaaaaaa' },
  });
  const got = await seen(res);
  assert.equal(got.method, 'GET');
  assert.equal(new URL(got.url).pathname + new URL(got.url).search, '/devices/42?full=1');
  assert.equal(got.headers.accept, 'application/json');
  assert.equal(Object.keys(got.headers).filter((k) => k.startsWith('x-funcd-')).length, 0);
  assert.equal(got.body, null);
});

test('scenario http-rest: a JSON body reaches the app as the data of its envelope, even one with a top-level data key', async () => {
  const app = createHttpApp(echoApp());
  const body = { data: { name: 'truck-7' }, meta: { page: 2 } };
  const res = await app.request('/devices', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'content-length': String(envelope(body).length) },
    body: envelope(body),
  });
  const got = await seen(res);
  assert.equal(got.method, 'POST');
  assert.deepEqual(JSON.parse(got.body ?? ''), body);
  assert.equal(got.headers['content-type'], 'application/json');
  assert.notEqual(got.headers['content-length'], String(envelope(body).length), 'the envelope length is not kept');
});

test('an envelope with no data reaches the app with no body, whatever the method', async () => {
  const app = createHttpApp(echoApp());
  for (const method of ['DELETE', 'POST']) {
    const got = await seen(await app.request('/devices/42', { method, body: envelope(null) }));
    assert.equal(got.method, method);
    assert.equal(got.body, null);
  }
});

test('scenario http-limits: a body that is no envelope reaches the app byte for byte', async () => {
  const app = createHttpApp(echoApp());
  for (const raw of ['name=truck-7&kind=van', '{"name":"not wrapped"}']) {
    const got = await seen(
      await app.request('/devices', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: raw }),
    );
    assert.equal(got.body, raw);
  }
});

test('the app sets its status, headers and body', async () => {
  const app = createHttpApp(
    httpApp({ fetch: () => new Response('{"id":"42"}', { status: 201, headers: { location: '/devices/42' } }) }),
  );
  const res = await app.request('/devices', { method: 'POST', body: envelope({ name: 'truck-7' }) });
  assert.equal(res.status, 201);
  assert.equal(res.headers.get('location'), '/devices/42');
  assert.equal(await res.text(), '{"id":"42"}');
});

test('scenario http-stream: a streamed body reaches the client chunk by chunk', async () => {
  let second: () => void = () => {};
  const secondWritten = new Promise<void>((resolve) => {
    second = resolve;
  });
  const app = createHttpApp(
    httpApp({
      fetch: () =>
        new Response(
          new ReadableStream<Uint8Array>({
            async start(controller) {
              controller.enqueue(new TextEncoder().encode('line 1\n'));
              await secondWritten;
              controller.enqueue(new TextEncoder().encode('line 2\n'));
              controller.close();
            },
          }),
        ),
    }),
  );
  const res = await app.request('/devices/export');
  const reader = res.body?.getReader();
  assert.ok(reader);
  const first = await reader.read();
  assert.equal(
    new TextDecoder().decode(first.value),
    'line 1\n',
    'the first line arrives before the second is written',
  );
  second();
  const next = await reader.read();
  assert.equal(new TextDecoder().decode(next.value), 'line 2\n');
  assert.equal((await reader.read()).done, true);
});

test("the shim's /health/* shadows the app's routes", async () => {
  let called = false;
  const app = createHttpApp(
    httpApp({
      fetch: () => {
        called = true;
        return new Response('app');
      },
    }),
  );
  const res = await app.request('/health/liveness');
  assert.equal(await res.text(), 'ok');
  assert.equal(called, false);
});

test('an app that throws answers 500 with its message', async () => {
  const app = createHttpApp(
    httpApp({
      fetch: () => {
        throw new Error('boom');
      },
    }),
  );
  const res = await app.request('/devices');
  assert.equal(res.status, 500);
  assert.match(((await res.json()) as { error: string }).error, /boom/);
});

test('a route reaches the function context as env.funcd', async () => {
  let ctx: FunctionContext | undefined;
  const app = createHttpApp(
    httpApp({
      fetch: (_request, env) => {
        ctx = env.funcd;
        return new Response(null, { status: 204 });
      },
    }),
  );
  assert.equal((await app.request('/')).status, 204);
  assert.equal(typeof ctx?.fetch, 'function');
  assert.equal(typeof ctx?.invoke, 'function');
});

test('the export must match the protocol', () => {
  const app = echoApp();
  const event = () => ({});
  assert.equal(resolveHttpHandler({ handle: app }, 'handle'), app);
  assert.throws(() => resolveHttpHandler({ handle: event }, 'handle'), /is not an http\(app\) handler/);
  assert.throws(() => resolveHandler({ handle: app }, 'handle'), /needs spec\.protocol: http/);
  assert.equal(resolveHandler({ handle: event }, 'handle'), event);
});

test('FUNCD_PROTOCOL is cloudevent, http, or unset', () => {
  assert.equal(protocolFrom({}), 'cloudevent');
  assert.equal(protocolFrom({ FUNCD_PROTOCOL: 'cloudevent' }), 'cloudevent');
  assert.equal(protocolFrom({ FUNCD_PROTOCOL: 'http' }), 'http');
  assert.throws(() => protocolFrom({ FUNCD_PROTOCOL: 'grpc' }), /neither cloudevent nor http/);
});

const httpArtifact = `export const handle = Object.assign(
  (request) => new Response('served ' + new URL(request.url).pathname),
  { [Symbol.for('funcd.http')]: true },
);
`;
const eventArtifact = 'export const handle = () => ({});\n';

function artifact(t: TestContext, code: string): string {
  const path = join(tempDir(t, 'funcd-http-test-'), 'handler.mjs');
  writeFileSync(path, code);
  return path;
}

test('scenario http-rest: the shim serves an http(app) export under FUNCD_PROTOCOL=http', {
  timeout: 15_000,
}, async (t) => {
  const shim = await startEntrypoint('shim', { FUNCD_ARTIFACT: artifact(t, httpArtifact), FUNCD_PROTOCOL: 'http' });
  try {
    const res = await fetch(`http://127.0.0.1:${shim.port}/devices/42`);
    assert.equal(await res.text(), 'served /devices/42');
  } finally {
    shim.child.kill();
  }
});

test('scenario http-mismatch: a protocol and an export that disagree, or a delivered contract, stop the shim with exit 3', {
  timeout: 15_000,
}, async (t) => {
  const cases: Record<string, string>[] = [
    { FUNCD_ARTIFACT: artifact(t, eventArtifact), FUNCD_PROTOCOL: 'http' },
    { FUNCD_ARTIFACT: artifact(t, httpArtifact) },
    { FUNCD_ARTIFACT: artifact(t, httpArtifact), FUNCD_PROTOCOL: 'http', FUNCD_CONTRACT_PATH: '/absent/contract.json' },
  ];
  for (const env of cases) {
    await assert.rejects(startEntrypoint('shim', env), /exited 3 before listening/);
  }
});

/** One request the fake local API received. */
interface Received {
  method: string;
  url: string;
  headers: http.IncomingHttpHeaders;
  body: string;
}

// fakeFetchAPI serves the worker-node local API's fetch route on a unix socket, records each request, answers with
// `reply`, and points FUNCD_INVOKE_SOCKET at it for the rest of the test.
async function fakeFetchAPI(
  t: TestContext,
  reply: { status: number; headers?: Record<string, string>; body?: string },
) {
  const socket = join(tempDir(t, 'funcd-fetch-'), 'api.sock');
  const received: Received[] = [];
  const server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => {
      received.push({
        method: req.method ?? '',
        url: req.url ?? '',
        headers: req.headers,
        body: Buffer.concat(chunks).toString(),
      });
      res.writeHead(reply.status, reply.headers);
      res.end(reply.body);
    });
  });
  await new Promise<void>((resolve) => server.listen(socket, resolve));
  server.unref();
  const prev = process.env.FUNCD_INVOKE_SOCKET;
  process.env.FUNCD_INVOKE_SOCKET = socket;
  t.after(() => {
    if (prev === undefined) delete process.env.FUNCD_INVOKE_SOCKET;
    else process.env.FUNCD_INVOKE_SOCKET = prev;
    server.close();
  });
  return received;
}

// reply is a target's reply as the local API forwards it, marked so the shim tells it from a refusal.
const reply = (status: number, body?: string, headers: Record<string, string> = {}) => ({
  status,
  body,
  headers: { ...headers, [FETCH_REPLY_HEADER]: '1' },
});

test('scenario http-fetch: context.fetch sends the request to /fetch/<alias><path> and returns the reply whole', async (t) => {
  const received = await fakeFetchAPI(t, reply(201, '{"id":"7"}', { location: '/devices/7' }));
  const fetchLinked = makeFetch({ member: 'bridge' });
  const res = await fetchLinked('devices', '/devices?dry=1', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{"name":"truck-7"}',
  });
  assert.equal(res.status, 201);
  assert.equal(res.headers.get('location'), '/devices/7');
  assert.equal(res.headers.get(FETCH_REPLY_HEADER), null, 'the marker stays in the shim');
  assert.equal(await res.text(), '{"id":"7"}');
  assert.equal(received.length, 1);
  assert.equal(received[0].method, 'POST');
  assert.equal(received[0].url, '/fetch/devices/devices?dry=1');
  assert.equal(received[0].body, '{"name":"truck-7"}');
  assert.equal(received[0].headers['content-type'], 'application/json');
  assert.equal(received[0].headers['x-funcd-member'], 'bridge');
});

test("context.fetch to '/' keeps the trailing slash, and the target's error status comes back as the Response", async (t) => {
  const received = await fakeFetchAPI(t, reply(404, '{"error":"no such device"}'));
  const res = await makeFetch()('devices', '/');
  assert.equal(res.status, 404);
  assert.match(await res.text(), /no such device/);
  assert.equal(received[0].url, '/fetch/devices/');
});

test('scenario http-fetch: a call funcd refuses before the target rejects, naming the reason', async (t) => {
  await fakeFetchAPI(t, { status: 409, body: '{"detail":"call it with context.invoke, not fetch"}' });
  await assert.rejects(makeFetch()('events', '/'), /context\.fetch\("events"\) failed: 409 .*context\.invoke/);
});

test('context.fetch rejects a path without a leading slash and a missing socket', async () => {
  const prev = process.env.FUNCD_INVOKE_SOCKET;
  delete process.env.FUNCD_INVOKE_SOCKET;
  try {
    await assert.rejects(makeFetch()('devices', '/x'), /FUNCD_INVOKE_SOCKET unset/);
    process.env.FUNCD_INVOKE_SOCKET = '/absent.sock';
    await assert.rejects(makeFetch()('devices', 'devices'), /must start with "\/"/);
  } finally {
    if (prev === undefined) delete process.env.FUNCD_INVOKE_SOCKET;
    else process.env.FUNCD_INVOKE_SOCKET = prev;
  }
});
