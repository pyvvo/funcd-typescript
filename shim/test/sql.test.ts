// Tests for context.sql (funcd ADR-0233) over a fake worker-node local API: the wire form of statements and
// parameters, rows as objects or values, a batch, RETURNING rows, the pool member header and a refused call.
import assert from 'node:assert';
import http from 'node:http';
import { join } from 'node:path';
import { type TestContext, test } from 'node:test';

import { makeSQL, type SQLClient } from '../src/sql.ts';
import { type Reply, send } from './reply.ts';
import { tempDir } from './tempdir.ts';

interface Recorded {
  url: string;
  member: string | undefined;
  type: string | undefined;
  body: unknown;
}

function withServer(
  handler: (req: Recorded) => Reply,
  fn: (sql: SQLClient, recorded: Recorded[]) => Promise<void>,
  member?: string,
) {
  return async (t: TestContext) => {
    const sock = join(tempDir(t, 'funcd-sql-'), 'api.sock');
    const recorded: Recorded[] = [];
    const server = http.createServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on('data', (c: Buffer) => chunks.push(c));
      req.on('end', () => {
        const rec: Recorded = {
          url: `${req.method} ${req.url}`,
          member: req.headers['x-funcd-member'] as string | undefined,
          type: req.headers['content-type'],
          body: JSON.parse(Buffer.concat(chunks).toString('utf8')),
        };
        recorded.push(rec);
        send(res, handler(rec));
      });
    });
    await new Promise<void>((resolve) => server.listen(sock, resolve));
    server.unref();
    const prev = process.env.FUNCD_INVOKE_SOCKET;
    process.env.FUNCD_INVOKE_SOCKET = sock;
    try {
      await fn(makeSQL(member), recorded);
    } finally {
      if (prev === undefined) delete process.env.FUNCD_INVOKE_SOCKET;
      else process.env.FUNCD_INVOKE_SOCKET = prev;
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  };
}

const join2 = {
  status: 200,
  body: '{"results":[{"columns":["id","id","title"],"values":[[1,7,"milk"],[2,8,"eggs"]]}]}',
};

test(
  'scenario bound-function-reads: query returns objects, queryValues keeps duplicate columns',
  withServer(
    () => join2,
    async (sql, recorded) => {
      assert.deepStrictEqual(await sql.query('app', 'SELECT … WHERE done = ?', [0]), [
        { id: 7, title: 'milk' },
        { id: 8, title: 'eggs' },
      ]);
      assert.deepStrictEqual(await sql.queryValues('app', 'SELECT …'), {
        columns: ['id', 'id', 'title'],
        values: [
          [1, 7, 'milk'],
          [2, 8, 'eggs'],
        ],
      });
      assert.deepStrictEqual(
        recorded.map((r) => [r.url, r.type, r.body]),
        [
          ['POST /sql/app/query', 'application/json', { statements: [['SELECT … WHERE done = ?', 0]] }],
          ['POST /sql/app/query', 'application/json', { statements: [['SELECT …']] }],
        ],
      );
      assert.strictEqual(recorded[0].member, undefined, 'the solo shim names no member');
    },
  ),
);

test(
  'scenario named-parameters: a map goes as the one parameter',
  withServer(
    () => ({ status: 200, body: '{"results":[{"columns":["id"],"values":[]}]}' }),
    async (sql, recorded) => {
      assert.deepStrictEqual(await sql.query('app', 'SELECT id FROM todos WHERE done = :done', { done: 0 }), []);
      assert.deepStrictEqual(recorded[0].body, {
        statements: [['SELECT id FROM todos WHERE done = :done', { done: 0 }]],
      });
    },
  ),
);

test(
  'scenario owner-writes: execute returns rowsAffected, the new id and RETURNING rows',
  withServer(
    (req) =>
      (req.body as { statements: unknown[] }).statements.length === 1
        ? { status: 200, body: '{"results":[{"rowsAffected":1,"lastInsertId":3}]}' }
        : {
            status: 200,
            body: '{"results":[{"rowsAffected":1,"lastInsertId":4},{"rowsAffected":0,"lastInsertId":0,"columns":["id"],"values":[[4]]}]}',
          },
    async (sql, recorded) => {
      assert.deepStrictEqual(await sql.execute('app', 'INSERT INTO todos(title, done) VALUES(?, ?)', ['milk', 0]), {
        rowsAffected: 1,
        lastInsertId: 3,
      });
      const batch = await sql.execute('app', [
        ['INSERT INTO todos(title, done) VALUES(:t, 0)', { t: 'eggs' }],
        'SELECT 1',
      ]);
      assert.strictEqual(batch.length, 2);
      assert.deepStrictEqual(batch[1].values, [[4]]);
      assert.deepStrictEqual(recorded[1], {
        url: 'POST /sql/app/execute',
        member: 'todo-api',
        type: 'application/json',
        body: { statements: [['INSERT INTO todos(title, done) VALUES(:t, 0)', { t: 'eggs' }], ['SELECT 1']] },
      });
    },
    'todo-api',
  ),
);

test(
  'scenario non-writer-write-refused: a refused call rejects with the status and the problem',
  withServer(
    () => ({ status: 403, body: '{"title":"Forbidden"}' }),
    async (sql) => {
      await assert.rejects(
        sql.execute('app', 'DELETE FROM todos'),
        /context\.sql\.execute failed: 403 \{"title":"Forbidden"\}/,
      );
    },
  ),
);
