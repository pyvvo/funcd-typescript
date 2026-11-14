// context.sql — function-facing SQL over the worker-node local API (funcd ADR-0233). Dials the per-sandbox socket
// (FUNCD_INVOKE_SOCKET); the platform routes /sql/… to the PDP-authorized facade with the sandbox's identity, and
// the database's engine and credential never reach the sandbox. query runs read-only; execute runs its statements
// in one transaction, all or nothing.
import { send } from './socket.ts';

/** A SQL parameter: rqlite takes JSON scalars. Integers past 2^53 lose precision. */
export type SQLParam = string | number | boolean | null;

/** Positional parameters for `?`, or one map for `:name`. */
export type SQLParams = SQLParam[] | Record<string, SQLParam>;

/** One statement of a batch: its SQL text, with its parameters. */
export type SQLStatement = string | [sql: string, params?: SQLParams];

/** A row as an object; with a duplicate column name the last one wins (use queryValues to keep every column). */
export type SQLRow = Record<string, unknown>;

/** Rows as columns and arrays of values, as rqlite returns them: every column of a join is kept. */
export interface SQLValues {
  columns: string[];
  values: unknown[][];
}

/** The outcome of one executed statement; a RETURNING statement also carries its rows. */
export interface SQLExecResult {
  rowsAffected: number;
  lastInsertId: number;
  columns?: string[];
  values?: unknown[][];
}

/** A function's view of the SQL databases it binds (spec.bindings.sql), by alias. */
export interface SQLClient {
  /** Runs one statement that reads, and returns its rows as objects keyed by column name; with a duplicate column name,
   *  the last one wins. params fill the statement's ? placeholders in order, or its :name placeholders from one object.
   *  A statement that writes, or that the database refuses, fails with the HTTP status 400. */
  query(alias: string, sql: string, params?: SQLParams): Promise<SQLRow[]>;
  /** Runs one statement that reads, and returns its column names and its rows as arrays of values in column order, so
   *  every column of a join is kept. params and failures are as for query. */
  queryValues(alias: string, sql: string, params?: SQLParams): Promise<SQLValues>;
  /** Runs one statement, or a list of up to 500 statements, in one transaction that applies all or none of them.
   *  Returns the statement's result, or one result for each statement of a list: rowsAffected and lastInsertId, with
   *  columns and values for a RETURNING statement. A statement that the database refuses fails the call with the HTTP
   *  status 400. Only the database's owner and the writers that a RolesAssignment names can execute. */
  execute(alias: string, sql: string, params?: SQLParams): Promise<SQLExecResult>;
  execute(alias: string, statements: SQLStatement[]): Promise<SQLExecResult[]>;
}

/** wire is a statement in the local API's form: ["SQL", p1, p2, …] or ["SQL", {name: value}]. */
function wire(sql: string, params?: SQLParams): unknown[] {
  if (params === undefined) return [sql];
  return Array.isArray(params) ? [sql, ...params] : [sql, params];
}

function toWire(s: SQLStatement): unknown[] {
  return typeof s === 'string' ? [s] : wire(s[0], s[1]);
}

/** Build the context.sql client. In a pool, `member` names the calling function on every request. */
export function makeSQL(member?: string): SQLClient {
  async function call<T>(verb: 'query' | 'execute', alias: string, statements: unknown[][]): Promise<T[]> {
    const path = `/sql/${encodeURIComponent(alias)}/${verb}`;
    const body = Buffer.from(JSON.stringify({ statements }), 'utf8');
    const r = await send('context.sql', 'POST', path, body, member, 'application/json');
    const text = r.body.toString('utf8');
    if (r.status < 200 || r.status >= 300) throw new Error(`context.sql.${verb} failed: ${r.status} ${text}`);
    try {
      return (JSON.parse(text) as { results: T[] }).results;
    } catch (err) {
      throw new Error(`context.sql.${verb} failed: ${r.status} reply is not JSON: ${(err as Error).message}`, {
        cause: err,
      });
    }
  }
  async function queryValues(alias: string, sql: string, params?: SQLParams): Promise<SQLValues> {
    const [res] = await call<SQLValues>('query', alias, [wire(sql, params)]);
    return res;
  }
  async function execute(alias: string, sql: string, params?: SQLParams): Promise<SQLExecResult>;
  async function execute(alias: string, statements: SQLStatement[]): Promise<SQLExecResult[]>;
  async function execute(
    alias: string,
    sqlOrStatements: string | SQLStatement[],
    params?: SQLParams,
  ): Promise<SQLExecResult | SQLExecResult[]> {
    if (typeof sqlOrStatements === 'string') {
      const [res] = await call<SQLExecResult>('execute', alias, [wire(sqlOrStatements, params)]);
      return res;
    }
    return call<SQLExecResult>('execute', alias, sqlOrStatements.map(toWire));
  }
  return {
    async query(alias, sql, params) {
      const { columns, values } = await queryValues(alias, sql, params);
      return values.map((row) => Object.fromEntries(columns.map((c, i) => [c, row[i]])));
    },
    queryValues,
    execute,
  };
}
