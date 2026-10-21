// @funcd-dev/drizzle (funcd ADR-0258): Drizzle over context.sql. funcdDrizzle is Drizzle's sqlite-proxy database with
// funcd ADR-0233's routing; applyMigrations applies drizzle-kit's migrations from memory as Drizzle's sqlite-proxy
// migrator applies them from disk, with the same table, hashes and order, in one execute (funcd ADR-0236 Decision 5).
import { createHash } from 'node:crypto';

import { drizzle, type SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';

/** A SQL parameter, as context.sql takes it. */
export type SQLParam = string | number | boolean | null;

/** The part of a function's context the package uses, its context.sql; a FunctionContext is one. */
export interface SQLContext {
  sql: {
    queryValues(alias: string, sql: string, params?: SQLParam[]): Promise<{ values: unknown[][] }>;
    execute(alias: string, sql: string, params?: SQLParam[]): Promise<{ values?: unknown[][] }>;
    execute(alias: string, statements: [string, SQLParam[]][]): Promise<{ values?: unknown[][] }[]>;
  };
}

type Method = 'run' | 'all' | 'values' | 'get';

// Drizzle sends insert … returning() as a read method, so the statement picks the call, not the method.
const reads = /^\s*(select|with)\b/i;

async function rows(ctx: SQLContext, alias: string, query: string, params: unknown[], method: Method) {
  const p = params as SQLParam[];
  const values = reads.test(query)
    ? (await ctx.sql.queryValues(alias, query, p)).values
    : ((await ctx.sql.execute(alias, query, p)).values ?? []);
  return method === 'get' ? (values[0] ?? []) : values;
}

/**
 * Drizzle's sqlite-proxy database over context.sql's alias (default app). A batch is one execute, all or nothing, and is
 * for writes: a select inside it gets no rows, as execute returns rows only for RETURNING.
 */
export function funcdDrizzle<TSchema extends Record<string, unknown> = Record<string, never>>(
  ctx: SQLContext,
  options: { alias?: string; schema?: TSchema } = {},
): SqliteRemoteDatabase<TSchema> {
  const alias = options.alias ?? 'app';
  return drizzle<TSchema>(
    async (query, params, method) => ({ rows: await rows(ctx, alias, query, params, method) }),
    async (queries) => {
      const results = await ctx.sql.execute(
        alias,
        queries.map((q): [string, SQLParam[]] => [q.sql, q.params as SQLParam[]]),
      );
      return results.map((r, i) => ({
        rows: queries[i].method === 'get' ? (r.values?.[0] ?? []) : (r.values ?? []),
      }));
    },
    { schema: options.schema },
  );
}

interface Journal {
  entries: { tag: string; when: number }[];
}

const journalPath = 'meta/_journal.json';

/**
 * Applies the drizzle-kit migrations in files that the table (default _migrations) lacks, with their rows, in one
 * execute, and returns how many it applied. files maps a path to its content, as import.meta.glob with ?raw returns
 * it: the folder is the prefix of the key that ends in meta/_journal.json.
 */
export async function applyMigrations(
  ctx: SQLContext,
  files: Record<string, string>,
  options: { alias?: string; table?: string } = {},
): Promise<number> {
  const alias = options.alias ?? 'app';
  const table = options.table ?? '_migrations';
  const journals = Object.keys(files).filter((k) => k === journalPath || k.endsWith(`/${journalPath}`));
  if (journals.length !== 1) {
    throw new Error(
      `applyMigrations: the files hold ${journals.length === 0 ? `no ${journalPath}` : `two journals: ${journals.join(', ')}`}`,
    );
  }
  const [key] = journals;
  const folder = key.slice(0, -journalPath.length);
  const migrations = (JSON.parse(files[key]) as Journal).entries.map((e) => {
    const path = `${folder}${e.tag}.sql`;
    const text = files[path];
    if (text === undefined) throw new Error(`applyMigrations: the files hold no ${path}, which ${key} names`);
    return {
      statements: text.split('--> statement-breakpoint'),
      when: e.when,
      hash: createHash('sha256').update(text).digest('hex'),
    };
  });
  // drizzle-orm 0.45.3's sqlite-proxy migrator creates, reads and writes the table with these statements, so a
  // database it migrated reads as migrated here, and the other way round.
  await ctx.sql.execute(
    alias,
    `CREATE TABLE IF NOT EXISTS "${table}" (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at numeric)`,
  );
  const [last] = (
    await ctx.sql.queryValues(alias, `SELECT id, hash, created_at FROM "${table}" ORDER BY created_at DESC LIMIT 1`)
  ).values;
  const pending = migrations.filter((m) => last === undefined || Number(last[2]) < m.when);
  if (pending.length === 0) return 0;
  await ctx.sql.execute(
    alias,
    pending.flatMap((m): [string, SQLParam[]][] => [
      ...m.statements.map((s): [string, SQLParam[]] => [s, []]),
      [`INSERT INTO \`${table}\` ("hash", "created_at") VALUES('${m.hash}', '${m.when}')`, []],
    ]),
  );
  return pending.length;
}
