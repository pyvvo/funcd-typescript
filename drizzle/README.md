# @funcd-dev/drizzle

[Drizzle](https://orm.drizzle.team) over funcd's `context.sql` (funcd ADR-0258): one package instead of a copied adapter
in each App.

```ts
import { applyMigrations, funcdDrizzle } from '@funcd-dev/drizzle';
import type { FunctionContext } from '@funcd-dev/shim';

import * as schema from './db/schema.ts';

export const db = (ctx: FunctionContext) => funcdDrizzle(ctx, { schema });

// the migrate function, or an App's preApply hook: the drizzle-kit folder the bundle carries
const migrations: Record<string, string> = import.meta.glob(['../../drizzle/*.sql', '../../drizzle/meta/_journal.json'], {
  query: '?raw',
  import: 'default',
  eager: true,
});
export const handle = async (ctx: FunctionContext) => ({ applied: await applyMigrations(ctx, migrations) });
```

- `funcdDrizzle(ctx, { alias = 'app', schema })` is Drizzle's `sqlite-proxy` database. A `SELECT` or `WITH` goes to
  `context.sql.queryValues`, any other statement to `execute`, since Drizzle sends `insert … returning()` as a read.
  A `batch` is one `execute`, all or nothing, and is for writes: a select inside it gets no rows.
- `applyMigrations(ctx, files, { alias = 'app', table = '_migrations' })` applies the drizzle-kit migrations the table
  lacks, with their rows, in one `execute`, and returns how many it applied. It reads them from `files`, a path to
  content map, and keeps the table as Drizzle's own `sqlite-proxy` migrator keeps it, so either one can take over from
  the other.
- `drizzle-orm` is a peer dependency: the App picks its version (`>=0.45.0 <1.0.0`).
