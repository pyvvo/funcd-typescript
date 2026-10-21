# sql-notes — a SQL database, code first with Drizzle (funcd FEAT-0011)

Two TypeScript functions over one SQL database, `notes-db`, served by its own rqlite engine:

| Function | What |
|---|---|
| `notes-migrate` | applies the migrations drizzle-kit generated from the schema, the pending ones only |
| `notes` | adds, lists, completes, moves and removes notes with Drizzle queries; the owner of `notes-db` |

The functions hold no credential and never reach the engine: `context.sql` calls funcd over the sandbox's socket,
and funcd checks the binding and the roles before it forwards the statements (funcd ADR-0233).

## The schema is code

[`src/db/schema.ts`](src/db/schema.ts) declares the tables with Drizzle. After a change to it, generate the next
migration and commit it with the change:

```bash
yarn generate --name <what-changed>   # drizzle-kit writes drizzle/NNNN_<what-changed>.sql
```

[`drizzle/`](drizzle) holds two: `0000_init` creates `notebooks` and `notes`, and `0001_note_priority` adds a column.
A migration only adds to the schema, so the code one version back still runs on it (expand now, contract later).

## Migrations

`notes-migrate` applies them with `applyMigrations` from [`@funcd-dev/drizzle`](../../drizzle) (funcd ADR-0258), which
reads the folder the bundle carries from memory. It applies every migration that table `_migrations` lacks, with their
`_migrations` rows, in one call: rqlite runs the call as one transaction, so a failed migration records nothing. Call it after each deploy, or make it an App's
`preApply` hook, which runs before the new revision serves (funcd ADR-0236).

## Queries

`funcdDrizzle` from [`@funcd-dev/drizzle`](../../drizzle) gives Drizzle a database whose driver is `context.sql`:
reads go to `queryValues`, writes to `execute`, and a `batch` is one `execute`, all or nothing. `move` uses that: it creates the
target notebook and moves the notes in one batch.

```ts
const rows = await funcdDrizzle(ctx, { schema })
  .select({ id: notes.id, notebook: notebooks.name, title: notes.title })
  .from(notes)
  .innerJoin(notebooks, eq(notes.notebookId, notebooks.id));
```

## Run it locally

`funcdctl dev` runs both functions from source with `notes-db` on a local rqlite engine (funcd ADR-0237); a funcdctl
built with the engine (`just build-sql-engine` in funcd) is needed.

```bash
yarn build
funcdctl dev .
curl -XPOST localhost:<gateway>/function/notes-migrate -d '{"data":{}}'
curl -XPOST localhost:<gateway>/function/notes -d '{"data":{"op":"add","notebook":"shopping","title":"milk"}}'
curl -XPOST localhost:<gateway>/function/notes -d '{"data":{"op":"list"}}'
```

With `--persist` the rows outlive the session.

## Deploy it

```bash
funcdctl push notes.mjs <registry>:notes
funcdctl push notes-migrate.mjs <registry>:notes-migrate
funcdctl apply -f notes-db.yaml -f notes.yaml -f notes-migrate.yaml -f grant.yaml
```

| File | What |
|---|---|
| `notes-db.yaml` | SQLDatabase `notes-db`, owned by `notes`: only its owner writes it, unless a role allows another |
| `notes.yaml`, `notes-migrate.yaml` | the Functions, each binding `notes-db` as alias `app` |
| `grant.yaml` | `SQL Data Writer` on `notes-db` for `notes-migrate` |
| `funcdconfig.yaml` | a daemon config with file storage, so the engine keeps its data across restarts |

## Tests

`yarn test` runs the migrator and the `notes` function against an in-memory SQLite (`node:sqlite`) behind a fake
`context.sql` that runs a batch in one transaction, as rqlite does.
