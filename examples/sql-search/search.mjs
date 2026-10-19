import { createRequire as __funcdCreateRequire } from "node:module";
__funcdCreateRequire(import.meta.url);
//#region src/main.ts
var db = "app";
var schema = [
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
     INSERT INTO articles_fts(rowid, title, body) VALUES (new.id, new.title, new.body); END`
];
async function handle(ctx, event) {
	const input = event.data ?? { op: "search" };
	switch (input.op) {
		case "init":
			await ctx.sql.execute(db, schema);
			return {};
		case "add": {
			const res = await ctx.sql.execute(db, "INSERT INTO articles (title, body, tags) VALUES (:title, :body, :tags) RETURNING id", {
				title: input.title ?? "",
				body: input.body ?? "",
				tags: JSON.stringify(input.tags ?? [])
			});
			return { id: Number(res.values?.[0]?.[0]) };
		}
		case "remove": return { changed: (await ctx.sql.execute(db, "DELETE FROM articles WHERE id = ?", [input.id ?? 0])).rowsAffected };
		case "tags": return { tags: (await ctx.sql.query(db, `SELECT t.value AS tag, count(*) AS articles FROM articles, json_each(articles.tags) AS t
         GROUP BY t.value ORDER BY articles DESC, tag`)).map((r) => ({
			tag: String(r.tag),
			articles: Number(r.articles)
		})) };
		default: return { hits: (await ctx.sql.query(db, `SELECT a.id, a.title, snippet(articles_fts, 1, '[', ']', '…', 8) AS snippet, a.tags
         FROM articles_fts JOIN articles a ON a.id = articles_fts.rowid
         WHERE articles_fts MATCH :q
           AND (:tag IS NULL OR EXISTS (SELECT 1 FROM json_each(a.tags) WHERE value = :tag))
         ORDER BY bm25(articles_fts) LIMIT :limit`, {
			q: input.q ?? "",
			tag: input.tag ?? null,
			limit: input.limit ?? 10
		})).map((r) => ({
			id: Number(r.id),
			title: String(r.title),
			snippet: String(r.snippet),
			tags: JSON.parse(String(r.tags))
		})) };
	}
}
//#endregion
export { handle };
