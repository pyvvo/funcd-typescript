// Scenario tests for the context.kv typed read accessors (ADR-0070): getText/getJSON over a minimal fake
// worker-node local API (HTTP-over-UDS), proving the client-side decoders without a real platform.
import assert from 'node:assert';
import http from 'node:http';
import { join } from 'node:path';
import { type TestContext, test } from 'node:test';

import { makeKV, type KVClient } from '../src/kv.ts';
import { named, type Reply, send } from './reply.ts';
import { tempDir } from './tempdir.ts';

// withServer spins a UDS HTTP server serving `routes` (path → {status, body}; 404 otherwise), points
// FUNCD_INVOKE_SOCKET at it, runs fn(kv), then tears it all down.
function withServer(routes: Record<string, Reply>, fn: (kv: KVClient) => Promise<void>) {
  return async (t: TestContext) => {
    const sock = join(tempDir(t, 'funcd-kv-'), 'api.sock');
    const server = http.createServer((req, res) => {
      const r = routes[req.url ?? ''];
      if (!r) {
        res.statusCode = 404;
        res.end('not found');
        return;
      }
      send(res, r);
    });
    await new Promise<void>((resolve) => server.listen(sock, resolve));
    // unref: a call that never settles then fails the test instead of hanging the file.
    server.unref();
    const prev = process.env.FUNCD_INVOKE_SOCKET;
    process.env.FUNCD_INVOKE_SOCKET = sock;
    try {
      await fn(makeKV());
    } finally {
      if (prev === undefined) delete process.env.FUNCD_INVOKE_SOCKET;
      else process.env.FUNCD_INVOKE_SOCKET = prev;
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  };
}

test(
  'scenario get-text-decodes: getText returns the UTF-8 string',
  withServer({ '/kv/counters/n': { status: 200, body: '5' } }, async (kv) => {
    assert.strictEqual(await kv.getText('counters', 'n'), '5');
  }),
);

test(
  'scenario get-json-parses: getJSON returns the parsed object',
  withServer({ '/kv/counters/n': { status: 200, body: '{"n":5}' } }, async (kv) => {
    assert.deepStrictEqual(await kv.getJSON('counters', 'n'), { n: 5 });
  }),
);

test(
  'scenario get-typed-missing-is-null: getText/getJSON on a miss → null',
  withServer({}, async (kv) => {
    assert.strictEqual(await kv.getText('counters', 'x'), null);
    assert.strictEqual(await kv.getJSON('counters', 'x'), null);
  }),
);

test(
  'scenario get-bytes-unchanged: get returns raw bytes',
  withServer({ '/kv/counters/n': { status: 200, body: '5' } }, async (kv) => {
    const b = await kv.get('counters', 'n');
    assert.ok(b instanceof Uint8Array);
    assert.strictEqual(new TextDecoder().decode(b!), '5');
  }),
);

test(
  'issue r21: a reply that drops mid-body rejects kv.get',
  withServer({ '/kv/counters/n': { status: 200, body: '5', cut: true } }, async (kv) => {
    await assert.rejects(
      kv.get('counters', 'n'),
      /context\.kv GET \/kv\/counters\/n failed: connection closed before the reply ended/,
    );
  }),
);

test(
  'issue r29: a local API socket with no listener rejects kv.get with a named error',
  withServer({}, async (kv) => {
    process.env.FUNCD_INVOKE_SOCKET += '.absent';
    await assert.rejects(
      kv.get('counters', 'n'),
      named(/^context\.kv GET \/kv\/counters\/n failed: connect ENOENT/, Error),
    );
  }),
);

test(
  'issue r29: a 2xx reply that is not JSON rejects kv.getJSON and kv.list with a named error',
  withServer(
    {
      '/kv/counters/n': { status: 200, body: 'not json' },
      '/kv/counters': { status: 200, body: 'not json' },
    },
    async (kv) => {
      await assert.rejects(
        kv.getJSON('counters', 'n'),
        named(/^context\.kv\.getJSON failed: 200 reply is not JSON/, SyntaxError),
      );
      await assert.rejects(kv.list('counters'), named(/^context\.kv\.list failed: 200 reply is not JSON/, SyntaxError));
    },
  ),
);
