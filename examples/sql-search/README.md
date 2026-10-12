# sql-search — full-text search on a SQL database, plain context.sql (funcd FEAT-0011)

One TypeScript function, `search`, over SQLDatabase `search-db`, with no ORM: it shows what a database's rqlite
engine offers beyond rows and joins, through `context.sql` alone (funcd ADR-0233).

| What | How |
|---|---|
| Full-text search | an FTS5 index over the articles, kept in step by triggers; a match is ranked with `bm25` and returned with a highlighted `snippet` |
| JSON columns | each article's tags are a JSON array, checked with `json_valid`; `json_each` turns them into rows to filter and count |
| Named parameters | `:title`, `:q`, … bound from one object |
| `RETURNING` | an insert returns the new id in the same call |

rqlite runs SQLite with FTS5 and the JSON functions built in, so the schema is plain SQL. `init` creates it with
`IF NOT EXISTS` and can run on every deploy; a schema that changes over versions belongs in migrations, as
[sql-notes](../sql-notes) does with Drizzle.

```ts
await ctx.sql.query('app', 'SELECT … FROM articles_fts … WHERE articles_fts MATCH :q ORDER BY bm25(articles_fts) LIMIT :limit', {
  q: 'sqlite',
  limit: 10,
});
```

## Run it locally

```bash
yarn build
funcdctl dev .
curl -XPOST localhost:<gateway>/function/search -d '{"data":{"op":"init"}}'
curl -XPOST localhost:<gateway>/function/search -d '{"data":{"op":"add","title":"Raft in practice","body":"rqlite replicates SQLite with Raft","tags":["raft"]}}'
curl -XPOST localhost:<gateway>/function/search -d '{"data":{"op":"search","q":"raft"}}'
```

`funcdctl dev` runs `search-db` on a local rqlite engine (funcd ADR-0237); a funcdctl built with the engine
(`just build-sql-engine` in funcd) is needed.

## Deploy it

```bash
funcdctl push search.mjs <registry>:search
funcdctl apply -f search-db.yaml
funcdctl apply -f search.yaml
```

## Tests

`yarn test` runs the function against an in-memory SQLite (`node:sqlite`, which has FTS5 too) behind a fake
`context.sql`.
