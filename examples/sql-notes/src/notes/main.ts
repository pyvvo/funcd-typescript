// The notes function, the owner of notes-db: Drizzle queries over context.sql (src/db/proxy.ts).
import type { CloudEvent, FunctionContext } from '@funcd-dev/shim';
import { asc, desc, eq, sql } from 'drizzle-orm';

import { db } from '../db/proxy.ts';
import { notebooks, notes } from '../db/schema.ts';

export interface FuncInput {
  op: 'add' | 'list' | 'done' | 'remove' | 'move';
  notebook?: string;
  title?: string;
  priority?: number;
  id?: number;
  to?: string;
}

export interface Note {
  id: number;
  notebook: string;
  title: string;
  done: boolean;
  priority: number;
}

export interface FuncOutput {
  note?: { id: number; title: string };
  notes?: Note[];
  changed?: number;
}

// notebookId returns the id of notebook name, which an add creates on first use.
async function notebookId(d: ReturnType<typeof db>, name: string): Promise<number> {
  const [row] = await d
    .insert(notebooks)
    .values({ name })
    .onConflictDoUpdate({ target: notebooks.name, set: { name } })
    .returning({ id: notebooks.id });
  return row.id;
}

export async function handle(ctx: FunctionContext, event: CloudEvent<FuncInput>): Promise<FuncOutput> {
  const d = db(ctx);
  const input = event.data ?? { op: 'list' };
  switch (input.op) {
    case 'add': {
      const id = await notebookId(d, input.notebook ?? 'inbox');
      const [note] = await d
        .insert(notes)
        .values({ notebookId: id, title: input.title ?? '', priority: input.priority ?? 0 })
        .returning({ id: notes.id, title: notes.title });
      return { note };
    }
    case 'done': {
      const res = await d
        .update(notes)
        .set({ done: true })
        .where(eq(notes.id, input.id ?? 0))
        .returning({ id: notes.id });
      return { changed: res.length };
    }
    case 'remove': {
      const res = await d
        .delete(notes)
        .where(eq(notes.id, input.id ?? 0))
        .returning({ id: notes.id });
      return { changed: res.length };
    }
    // move creates the target notebook and moves every note of the source in one batch: both or neither.
    case 'move': {
      const [from] = await d
        .select()
        .from(notebooks)
        .where(eq(notebooks.name, input.notebook ?? ''));
      if (!from) return { changed: 0 };
      const to = input.to ?? 'archive';
      await d.batch([
        d.insert(notebooks).values({ name: to }).onConflictDoNothing(),
        d
          .update(notes)
          .set({ notebookId: sql`(SELECT ${notebooks.id} FROM ${notebooks} WHERE ${notebooks.name} = ${to})` })
          .where(eq(notes.notebookId, from.id)),
      ]);
      return { changed: 1 };
    }
    default: {
      const rows = await d
        .select({
          id: notes.id,
          notebook: notebooks.name,
          title: notes.title,
          done: notes.done,
          priority: notes.priority,
        })
        .from(notes)
        .innerJoin(notebooks, eq(notes.notebookId, notebooks.id))
        .where(input.notebook ? eq(notebooks.name, input.notebook) : undefined)
        .orderBy(desc(notes.priority), asc(notes.id));
      return { notes: rows };
    }
  }
}
