import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';

import type { CloudEvent, FunctionContext, SQLExecResult, SQLParams, SQLStatement, SQLValues } from '@funcd-dev/shim';

import { applyMigrations } from '@funcd-dev/drizzle';
import { type FuncInput, handle } from '../src/notes/main.ts';

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

function drizzleFiles(): Record<string, string> {
  const dir = new URL('../drizzle/', import.meta.url).pathname;
  const files: Record<string, string> = { 'meta/_journal.json': readFileSync(join(dir, 'meta/_journal.json'), 'utf8') };
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.sql'))) files[f] = readFileSync(join(dir, f), 'utf8');
  return files;
}

// The committed notes-migrate.mjs inlines every migration and the journal: a glob that matches nothing builds a bundle
// that fails at its first call, and running it here would not show that, since drizzle falls back to drizzle/ on disk.
test('the notes-migrate bundle carries the journal and every migration', () => {
  const bundle = readFileSync(new URL('../notes-migrate.mjs', import.meta.url), 'utf8');
  for (const [name, content] of Object.entries(drizzleFiles())) {
    // the bundler writes a string as JSON does, except that a tab stays a raw tab
    const literal = JSON.stringify(content).replaceAll('\\t', '\t');
    assert.ok(bundle.includes(literal), `notes-migrate.mjs inlines drizzle/${name}`);
  }
});

const call = (ctx: FunctionContext, data: FuncInput) =>
  handle(ctx, { id: '1', source: '/test', type: 'test', data } as CloudEvent<FuncInput>);

test('the migrator applies each migration once', async () => {
  const ctx = fakeSQL();
  assert.equal(
    await applyMigrations(ctx, drizzleFiles()),
    readdirSync(new URL('../drizzle/', import.meta.url)).filter((f) => f.endsWith('.sql')).length,
  );
  assert.equal(await applyMigrations(ctx, drizzleFiles()), 0, 'a second run finds nothing pending');
});

test('notes are added, listed with their notebook, done, moved and removed', async () => {
  const ctx = fakeSQL();
  await applyMigrations(ctx, drizzleFiles());
  const milk = (await call(ctx, { op: 'add', notebook: 'shopping', title: 'milk' })).note;
  await call(ctx, { op: 'add', notebook: 'shopping', title: 'eggs' });
  await call(ctx, { op: 'add', title: 'call the bank', priority: 2 });
  assert.deepEqual(await call(ctx, { op: 'done', id: milk?.id }), { changed: 1 });

  const { notes } = await call(ctx, { op: 'list', notebook: 'shopping' });
  assert.deepEqual(
    notes?.map((n) => [n.title, n.notebook, n.done]),
    [
      ['milk', 'shopping', true],
      ['eggs', 'shopping', false],
    ],
  );

  await call(ctx, { op: 'move', notebook: 'shopping', to: 'archive' });
  assert.equal((await call(ctx, { op: 'list', notebook: 'archive' })).notes?.length, 2);
  assert.deepEqual(await call(ctx, { op: 'remove', id: milk?.id }), { changed: 1 });
  assert.deepEqual(
    (await call(ctx, { op: 'list' })).notes?.map((n) => n.title),
    ['call the bank', 'eggs'],
    'a higher priority comes first',
  );
});
