// Applies the migrations drizzle-kit generated (drizzle/) that table _migrations lacks, with their _migrations rows,
// in one context.sql execute: a failed migration records nothing (funcd ADR-0236 Decision 5). Drizzle's
// sqlite-proxy migrator reads its folder from disk, so the files the bundle carries are written to a temporary
// directory first.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import type { FunctionContext } from '@funcd-dev/shim';
import { migrate } from 'drizzle-orm/sqlite-proxy/migrator';

import { db } from './proxy.ts';

const table = '_migrations';

/** files maps each path under drizzle/ to its content; it returns how many migrations it applied. */
export async function applyMigrations(ctx: FunctionContext, files: Record<string, string>, alias = 'app') {
  const dir = mkdtempSync(join(tmpdir(), 'drizzle-'));
  try {
    for (const [path, text] of Object.entries(files)) {
      mkdirSync(dirname(join(dir, path)), { recursive: true });
      writeFileSync(join(dir, path), text);
    }
    let applied = 0;
    await migrate(
      db(ctx, alias),
      async (queries) => {
        if (queries.length === 0) return;
        await ctx.sql.execute(alias, queries);
        applied = queries.filter((q) => q.startsWith(`INSERT INTO \`${table}\``)).length;
      },
      { migrationsFolder: dir, migrationsTable: table },
    );
    return applied;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
