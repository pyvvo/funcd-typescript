// The search function: plain context.sql, no ORM (funcd ADR-0233). Articles keep their tags as a JSON array, an FTS5
// index follows the table through triggers, and a search ranks matches with bm25 and returns a highlighted snippet.
import type { CloudEvent, FunctionContext, SQLStatement } from '@funcd-dev/shim';

const db = 'app';

// schema is idempotent, so init can run on every deploy. rqlite's SQLite has FTS5 and the JSON functions built in.
const schema: SQLStatement[] = [
  `CREATE TABLE IF NOT EXISTS articles (
     id INTEGER PRIMARY KEY,
     title TEXT NOT NULL,
     body TEXT NOT NULL,
     tags TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(tags)))`,
  `CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(title, body, content='articles', content_rowid='id')`,
  `CREATE TRIGGER IF NOT EXISTS articles_ai AFTER INSERT ON articles BEGIN
     INSERT INTO articles_fts(rowid, title, body) VALUES (new.id, new.title, new.body); END`,
  `CREATE TRIGGER IF NOT EXISTS articles_ad AFTER DELETE ON articles BEGIN
     INSERT INTO articles_fts(articles_fts, rowid, title, body) VALUES ('delete', old.id, old.title, old.body); END`,
  `CREATE TRIGGER IF NOT EXISTS articles_au AFTER UPDATE ON articles BEGIN
     INSERT INTO articles_fts(articles_fts, rowid, title, body) VALUES ('delete', old.id, old.title, old.body);
     INSERT INTO articles_fts(rowid, title, body) VALUES (new.id, new.title, new.body); END`,
];

export interface FuncInput {
  op: 'init' | 'add' | 'search' | 'tags' | 'remove';
  title?: string;
  body?: string;
  tags?: string[];
  q?: string;
  tag?: string;
  id?: number;
  limit?: number;
}

export interface Hit {
  id: number;
  title: string;
  snippet: string;
  tags: string[];
}

export interface FuncOutput {
  id?: number;
  hits?: Hit[];
  tags?: { tag: string; articles: number }[];
  changed?: number;
}

export async function handle(ctx: FunctionContext, event: CloudEvent<FuncInput>): Promise<FuncOutput> {
  const input = event.data ?? { op: 'search' };
  switch (input.op) {
    case 'init':
      await ctx.sql.execute(db, schema);
      return {};
    // Named parameters, and RETURNING gives the new row's id in the same call.
    case 'add': {
      const res = await ctx.sql.execute(
        db,
        'INSERT INTO articles (title, body, tags) VALUES (:title, :body, :tags) RETURNING id',
        { title: input.title ?? '', body: input.body ?? '', tags: JSON.stringify(input.tags ?? []) },
      );
      return { id: Number(res.values?.[0]?.[0]) };
    }
    case 'remove': {
      const res = await ctx.sql.execute(db, 'DELETE FROM articles WHERE id = ?', [input.id ?? 0]);
      return { changed: res.rowsAffected };
    }
    // json_each turns each article's tags into rows, so tags count like any column.
    case 'tags': {
      const rows = await ctx.sql.query(
        db,
        `SELECT t.value AS tag, count(*) AS articles FROM articles, json_each(articles.tags) AS t
         GROUP BY t.value ORDER BY articles DESC, tag`,
      );
      return { tags: rows.map((r) => ({ tag: String(r.tag), articles: Number(r.articles) })) };
    }
    default: {
      const rows = await ctx.sql.query(
        db,
        `SELECT a.id, a.title, snippet(articles_fts, 1, '[', ']', '…', 8) AS snippet, a.tags
         FROM articles_fts JOIN articles a ON a.id = articles_fts.rowid
         WHERE articles_fts MATCH :q
           AND (:tag IS NULL OR EXISTS (SELECT 1 FROM json_each(a.tags) WHERE value = :tag))
         ORDER BY bm25(articles_fts) LIMIT :limit`,
        { q: input.q ?? '', tag: input.tag ?? null, limit: input.limit ?? 10 },
      );
      return {
        hits: rows.map((r) => ({
          id: Number(r.id),
          title: String(r.title),
          snippet: String(r.snippet),
          tags: JSON.parse(String(r.tags)) as string[],
        })),
      };
    }
  }
}
