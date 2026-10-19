import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';

import type { CloudEvent, FunctionContext, SQLExecResult, SQLParams, SQLStatement, SQLValues } from '@funcd-dev/shim';

import { type FuncInput, handle } from '../src/main.ts';

// fakeSQL is context.sql over an in-memory SQLite: an execute of several statements runs in one transaction, as
// rqlite runs it, so a failure applies none of them.
function fakeSQL(): FunctionContext {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON');
  const run = (sql: string, params: SQLParams = []): SQLValues & SQLExecResult => {
    const st = db.prepare(sql);
    const args = Array.isArray(params) ? params : [params];
    const columns = st.columns().map((c) => c.name);
    if (columns.length > 0) {
      const rows = st.all(...(args as never[])) as Record<string, unknown>[];
      return { columns, values: rows.map((r) => columns.map((c) => r[c])), rowsAffected: 0, lastInsertId: 0 };
    }
    const r = st.run(...(args as never[]));
    return { columns: [], values: [], rowsAffected: Number(r.changes), lastInsertId: Number(r.lastInsertRowid) };
  };
  const one = (s: SQLStatement) => (typeof s === 'string' ? run(s) : run(s[0], s[1]));
  const sql = {
    query: async (_: string, q: string, p?: SQLParams) => {
      const r = run(q, p);
      return r.values.map((v) => Object.fromEntries(r.columns.map((c, i) => [c, v[i]])));
    },
    queryValues: async (_: string, q: string, p?: SQLParams) => run(q, p),
    execute: async (_: string, s: string | SQLStatement[], p?: SQLParams) => {
      if (typeof s === 'string') return run(s, p);
      db.exec('BEGIN');
      try {
        const out = s.map(one);
        db.exec('COMMIT');
        return out;
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    },
  };
  return { sql, log: () => {} } as unknown as FunctionContext;
}

const call = (ctx: FunctionContext, data: FuncInput) =>
  handle(ctx, { id: '1', source: '/test', type: 'test', data } as CloudEvent<FuncInput>);

test('articles are found by words, ranked, filtered by tag and counted by tag', async () => {
  const ctx = fakeSQL();
  await call(ctx, { op: 'init' });
  await call(ctx, { op: 'init' });
  const { id } = await call(ctx, {
    op: 'add',
    title: 'Raft in practice',
    body: 'rqlite replicates SQLite with the Raft consensus protocol',
    tags: ['raft', 'sqlite'],
  });
  await call(ctx, { op: 'add', title: 'SQLite tips', body: 'indexes make SQLite queries fast', tags: ['sqlite'] });
  await call(ctx, { op: 'add', title: 'Gardening', body: 'water the tomatoes', tags: ['home'] });

  const hits = (await call(ctx, { op: 'search', q: 'sqlite' })).hits ?? [];
  assert.deepEqual(hits.map((h) => h.title).sort(), ['Raft in practice', 'SQLite tips']);
  assert.match(hits.find((h) => h.id === id)?.snippet ?? '', /\[SQLite\]/);
  assert.deepEqual(
    (await call(ctx, { op: 'search', q: 'sqlite', tag: 'raft' })).hits?.map((h) => h.title),
    ['Raft in practice'],
  );
  assert.deepEqual((await call(ctx, { op: 'tags' })).tags, [
    { tag: 'sqlite', articles: 2 },
    { tag: 'home', articles: 1 },
    { tag: 'raft', articles: 1 },
  ]);

  assert.deepEqual(await call(ctx, { op: 'remove', id }), { changed: 1 });
  assert.deepEqual((await call(ctx, { op: 'search', q: 'raft' })).hits, [], 'the index follows a delete');
});
