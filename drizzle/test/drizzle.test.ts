import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';

import { count } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { migrate } from 'drizzle-orm/sqlite-proxy/migrator';

import { applyMigrations, funcdDrizzle, type SQLContext, type SQLParam } from '../src/index.ts';

// fakeSQL is context.sql over an in-memory SQLite: an execute of several statements runs in one transaction, as
// rqlite runs it, so a failure applies none of them. calls records which method each statement reached.
function fakeSQL() {
  const db = new DatabaseSync(':memory:');
  const calls: string[] = [];
  const run = (sql: string, params: SQLParam[] = []) => {
    const st = db.prepare(sql);
    const columns = st.columns().map((c) => c.name);
    if (columns.length === 0) {
      st.run(...(params as never[]));
      return { columns, values: [] as unknown[][] };
    }
    const rows = st.all(...(params as never[])) as Record<string, unknown>[];
    return { columns, values: rows.map((r) => columns.map((c) => r[c])) };
  };
  const execute = async (_: string, s: string | [string, SQLParam[]][], p?: SQLParam[]) => {
    if (typeof s === 'string') {
      calls.push(`execute ${s}`);
      return run(s, p);
    }
    calls.push(...s.map(([q]) => `execute ${q}`));
    db.exec('BEGIN');
    try {
      const out = s.map(([q, ps]) => run(q, ps));
      db.exec('COMMIT');
      return out;
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  };
  const ctx = {
    sql: {
      queryValues: async (_: string, q: string, p?: SQLParam[]) => {
        calls.push(`queryValues ${q}`);
        return run(q, p);
      },
      execute,
    },
  } as unknown as SQLContext;
  const tables = () =>
    (db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all() as { name: string }[]).map(
      (r) => r.name,
    );
  const migrated = () => (db.prepare('SELECT hash, created_at FROM _migrations').all() as unknown[]).length;
  return { ctx, calls, tables, migrated };
}

const notes = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
});

// A drizzle-kit folder of two migrations, keyed as import.meta.glob keys it from a function two folders down.
function folder(
  second = 'CREATE TABLE `tags` (`id` integer PRIMARY KEY NOT NULL, `name` text NOT NULL);',
): Record<string, string> {
  const journal = {
    version: '7',
    dialect: 'sqlite',
    entries: [
      { idx: 0, version: '6', when: 1729000000000, tag: '0000_init', breakpoints: true },
      { idx: 1, version: '6', when: 1729000001000, tag: '0001_tags', breakpoints: true },
    ],
  };
  return {
    '../../drizzle/meta/_journal.json': JSON.stringify(journal),
    '../../drizzle/0000_init.sql':
      'CREATE TABLE `notes` (\n\t`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,\n\t`title` text NOT NULL\n);\n',
    '../../drizzle/0001_tags.sql': `${second}\n--> statement-breakpoint\nCREATE INDEX \`tags_name\` ON \`tags\` (\`name\`);`,
  };
}

test('scenario: drizzle-routes-statements — a read goes to queryValues, any other statement to execute, a batch is one execute', async () => {
  const { ctx, calls } = fakeSQL();
  await applyMigrations(ctx, folder());
  const db = funcdDrizzle(ctx, { schema: { notes } });
  calls.length = 0;
  const [added] = await db.insert(notes).values({ title: 'buy milk' }).returning();
  assert.deepEqual(added, { id: 1, title: 'buy milk' });
  assert.deepEqual(await db.select().from(notes), [{ id: 1, title: 'buy milk' }]);
  assert.match(calls[0], /^execute insert into "notes"/, 'an insert with returning() goes to execute');
  assert.match(calls[1], /^queryValues select /, 'a select goes to queryValues');
  await assert.rejects(
    db.batch([db.insert(notes).values({ title: 'a' }), db.insert(notes).values({ title: null as unknown as string })]),
  );
  assert.deepEqual(await db.select({ n: count() }).from(notes), [{ n: 1 }], 'a failed batch changes nothing');
});

test('scenario: drizzle-applies-pending-migrations — each migration applies once, with its row', async () => {
  const { ctx, tables, migrated } = fakeSQL();
  assert.equal(await applyMigrations(ctx, folder()), 2);
  assert.deepEqual(tables(), ['_migrations', 'notes', 'sqlite_sequence', 'tags']);
  assert.equal(migrated(), 2);
  assert.equal(await applyMigrations(ctx, folder()), 0, 'a second run finds nothing pending');
});

test('scenario: drizzle-migrations-all-or-nothing — a failing migration applies nothing', async () => {
  const { ctx, tables, migrated } = fakeSQL();
  await assert.rejects(applyMigrations(ctx, folder('THIS IS NOT SQL;')));
  assert.deepEqual(tables(), ['_migrations'], 'neither migration applied');
  assert.equal(migrated(), 0, 'no row recorded');
});

test("scenario: drizzle-compatible-table — Drizzle's own migrator and applyMigrations read each other's table", async () => {
  const dir = mkdtempSync(join(tmpdir(), 'drizzle-'));
  try {
    for (const [path, text] of Object.entries(folder())) {
      const file = join(dir, path.replace('../../drizzle/', ''));
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, text);
    }
    const drizzleMigrate = (ctx: SQLContext) =>
      migrate(
        funcdDrizzle(ctx),
        async (queries) => {
          if (queries.length > 0)
            await ctx.sql.execute(
              'app',
              queries.map((q): [string, SQLParam[]] => [q, []]),
            );
        },
        { migrationsFolder: dir, migrationsTable: '_migrations' },
      );
    const theirs = fakeSQL();
    await drizzleMigrate(theirs.ctx);
    assert.equal(
      await applyMigrations(theirs.ctx, folder()),
      0,
      "a database Drizzle's migrator migrated reads as migrated",
    );

    const all = fakeSQL();
    assert.equal(await applyMigrations(all.ctx, folder()), 2);
    await drizzleMigrate(all.ctx);
    assert.equal(all.migrated(), 2, "Drizzle's migrator applies nothing after applyMigrations");

    const ours = fakeSQL();
    const first = folder();
    const journal = JSON.parse(first['../../drizzle/meta/_journal.json']);
    journal.entries = journal.entries.slice(0, 1);
    assert.equal(
      await applyMigrations(ours.ctx, { ...first, '../../drizzle/meta/_journal.json': JSON.stringify(journal) }),
      1,
    );
    await drizzleMigrate(ours.ctx);
    assert.equal(ours.migrated(), 2, "Drizzle's migrator applies only what applyMigrations had not");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('applyMigrations names a missing journal, two journals and a missing migration', async () => {
  const { ctx } = fakeSQL();
  await assert.rejects(applyMigrations(ctx, {}), /the files hold no meta\/_journal.json/);
  await assert.rejects(
    applyMigrations(ctx, { ...folder(), 'meta/_journal.json': '{}' }),
    /two journals: \.\.\/\.\.\/drizzle\/meta\/_journal.json, meta\/_journal.json/,
  );
  const files = folder();
  delete files['../../drizzle/0001_tags.sql'];
  await assert.rejects(applyMigrations(ctx, files), /the files hold no \.\.\/\.\.\/drizzle\/0001_tags\.sql/);
});
