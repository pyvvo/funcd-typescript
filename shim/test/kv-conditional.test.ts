// Scenario tests for context.kv's conditional writes and expiring keys over a fake worker-node local API: the
// headers each call sends, and how it reads 201/204/412 and the ETag.
import assert from 'node:assert';
import http from 'node:http';
import { join } from 'node:path';
import { type TestContext, test } from 'node:test';

import { type KVClient, makeKV } from '../src/kv.ts';
import { tempDir } from './tempdir.ts';

interface Seen {
  method: string;
  url: string;
  headers: http.IncomingHttpHeaders;
}
interface Canned {
  status: number;
  etag?: string;
  body?: string;
}

// withServer answers `replies` in order and records each request in `seen`.
function withServer(replies: Canned[], fn: (kv: KVClient, seen: Seen[]) => Promise<void>) {
  return async (t: TestContext) => {
    const sock = join(tempDir(t, 'funcd-kvc-'), 'api.sock');
    const seen: Seen[] = [];
    const server = http.createServer((req, res) => {
      req.resume();
      req.on('end', () => {
        seen.push({ method: req.method ?? '', url: req.url ?? '', headers: req.headers });
        const r = replies.shift() ?? { status: 500, body: 'no reply left' };
        if (r.etag) res.setHeader('etag', r.etag);
        res.statusCode = r.status;
        res.end(r.body ?? '');
      });
    });
    await new Promise<void>((resolve) => server.listen(sock, resolve));
    server.unref();
    const prev = process.env.FUNCD_INVOKE_SOCKET;
    process.env.FUNCD_INVOKE_SOCKET = sock;
    try {
      await fn(makeKV(), seen);
    } finally {
      if (prev === undefined) delete process.env.FUNCD_INVOKE_SOCKET;
      else process.env.FUNCD_INVOKE_SOCKET = prev;
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  };
}

test(
  'scenario put-if-absent-reports-who-won: the winner gets the version, the loser null',
  withServer(
    [
      { status: 201, etag: '"7"' },
      { status: 412, etag: '"7"', body: 'held' },
    ],
    async (kv, seen) => {
      assert.strictEqual(await kv.putIfAbsent('claims', 'run/1', 'me', { ttl: 30 }), '7');
      assert.strictEqual(await kv.putIfAbsent('claims', 'run/1', 'you'), null);
      assert.deepStrictEqual(
        [seen[0].method, seen[0].url, seen[0].headers['if-none-match']],
        ['PUT', '/kv/claims/run/1?ttl=30', '*'],
      );
      assert.strictEqual(seen[1].url, '/kv/claims/run/1');
    },
  ),
);

test(
  'scenario compare-and-set-names-the-version',
  withServer(
    [
      { status: 204, etag: '"9"' },
      { status: 412, etag: '"9"' },
    ],
    async (kv, seen) => {
      assert.strictEqual(await kv.compareAndSet('claims', 'run/1', 'me', '7', { ttl: 30 }), '9');
      assert.strictEqual(await kv.compareAndSet('claims', 'run/1', 'me', '7'), null);
      assert.strictEqual(seen[0].headers['if-match'], '"7"');
    },
  ),
);

test(
  'scenario del-if-releases-only-what-it-holds',
  withServer([{ status: 412, etag: '"9"' }, { status: 204 }], async (kv, seen) => {
    assert.strictEqual(await kv.delIf('claims', 'run/1', '7'), false);
    assert.strictEqual(await kv.delIf('claims', 'run/1', '9'), true);
    assert.deepStrictEqual(
      seen.map((s) => [s.method, s.headers['if-match']]),
      [
        ['DELETE', '"7"'],
        ['DELETE', '"9"'],
      ],
    );
  }),
);

test(
  'scenario get-entry-has-the-version',
  withServer([{ status: 200, etag: '"9"', body: 'me' }, { status: 404 }], async (kv) => {
    const e = await kv.getEntry('claims', 'run/1');
    assert.deepStrictEqual([Buffer.from(e?.value ?? []).toString('utf8'), e?.version], ['me', '9']);
    assert.strictEqual(await kv.getEntry('claims', 'run/2'), null);
  }),
);

test(
  'a put with a ttl and the plain calls send no condition',
  withServer([{ status: 204, etag: '"3"' }, { status: 204 }], async (kv, seen) => {
    await kv.put('cache', 'k', 'x', { ttl: 60 });
    await kv.del('cache', 'k');
    assert.strictEqual(seen[0].url, '/kv/cache/k?ttl=60');
    for (const s of seen) assert.ok(!s.headers['if-match'] && !s.headers['if-none-match']);
  }),
);

test(
  'a bad ttl sends nothing',
  withServer([], async (kv, seen) => {
    for (const ttl of [0, -1, 1.5, Number.NaN]) {
      await assert.rejects(kv.putIfAbsent('claims', 'k', 'x', { ttl }), RangeError);
    }
    assert.strictEqual(seen.length, 0);
  }),
);

test(
  'an unexpected status rejects',
  withServer([{ status: 403, body: 'denied' }, { status: 412 }], async (kv) => {
    await assert.rejects(kv.putIfAbsent('claims', 'k', 'x'), /context\.kv\.putIfAbsent failed: 403/);
    await assert.rejects(kv.del('claims', 'k'), /context\.kv\.del failed: 412/);
  }),
);
