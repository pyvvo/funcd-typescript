// The notes-migrate function: it brings notes-db to the schema of src/db/schema.ts. Run it once after each deploy, or as an
// App's preApply hook (funcd ADR-0236). It writes notes-db through a SQL Data Writer grant (grant.yaml).
import type { FunctionContext } from '@funcd-dev/shim';

import { applyMigrations } from '../db/migrator.ts';

const glob: Record<string, string> = import.meta.glob(['../drizzle/*.sql', '../drizzle/meta/_journal.json'], {
  query: '?raw',
  import: 'default',
  eager: true,
});
const files = Object.fromEntries(Object.entries(glob).map(([path, text]) => [path.replace('../drizzle/', ''), text]));

export interface FuncOutput {
  applied: number;
}

export async function handle(ctx: FunctionContext): Promise<FuncOutput> {
  const applied = await applyMigrations(ctx, files);
  ctx.log('applied', applied, 'migrations');
  return { applied };
}
