// context.job (funcd ADR-0349): a Function starts a run of a Job that it binds, and reads it back, through funcd's
// worker-node local API, which checks the binding and Policies and admits the run as a person's. A Job's worker also
// reads its own run there, with the approval its handler's context carries (funcd ADR-0348).
import { type Resp, send } from './socket.ts';
import type { Json } from './types.ts';

/** funcd's problem, the body of a refusal (RFC 9457). */
export interface JobProblem {
  type: string;
  title: string;
  status: number;
  detail: string;
}

/** A start or a read of a run that funcd refused. */
export class JobError extends Error {
  /** The HTTP status of the refusal. */
  readonly status: number;
  /** funcd's problem. */
  readonly problem: JobProblem;

  constructor(call: string, problem: JobProblem) {
    super(`${call} failed: ${problem.status} ${problem.detail}`);
    this.name = 'JobError';
    this.status = problem.status;
    this.problem = problem;
  }
}

/** A run of a Job, as context.job.get reads it. */
export interface JobRunState {
  /** The run's name. */
  name: string;
  /** Pending, Previewing, AwaitingApproval, Running, Succeeded, Failed, Cancelled or Rejected. */
  phase: string;
  /** Why the run is in its phase, empty while it runs. */
  reason: string;
  /** When the run started running, an RFC 3339 time; null before. */
  startedAt: string | null;
  /** When the run ended, an RFC 3339 time; null before. */
  endedAt: string | null;
  /** The handler's answer once the run Succeeded; null before. */
  result: Json;
}

export interface JobClient {
  /** Starts a run of the Job that the function binds under alias, with input as the run's input, and returns the
   *  run's name at once, without waiting for the run. Without name, funcd names the run <job>-<id>, and a start sent
   *  again starts a second run; with name, a start sent again with the same input returns that run, so a function
   *  called more than once for one event, as at-least-once delivery does, names the run from the event's id. A run of
   *  a Job without approval.bypass waits for a person's approval. Rejects with a JobError: 403 when the function binds
   *  no Job under alias or a Policy forbids it, 404 when the Job does not exist, 409 when another run holds the name,
   *  413 when the input passes job.payloadLimit, and 422 when it does not match the Job's input schema. */
  start(alias: string, input?: unknown, name?: string): Promise<string>;
  /** Reads run, a run of the Job that the function binds under alias: its phase, its reason, its times and, once it
   *  Succeeded, its result. Rejects with a JobError: 403 when the function binds no Job under alias or a Policy
   *  forbids it, and 404 when the run is not one of that Job's, or funcd removed it after job.retention. */
  get(alias: string, run: string): Promise<JobRunState>;
}

/** An approval of a run's preview (funcd ADR-0348): who approved it, the digest the approval names, and the document
 *  of that preview. */
export interface Approval {
  approvedBy: string;
  digest: string;
  preview: Json;
}

/** refusal is funcd's problem as a JobError. A body that is no problem, as the 422 of an input off the Job's contract,
 *  which answers as a Function's call does, keeps its text as the detail, as context.invoke's error does. */
function refusal(call: string, r: Resp): JobError {
  const text = r.body.toString('utf8');
  let problem: JobProblem = { type: 'about:blank', title: '', status: r.status, detail: text };
  try {
    const parsed = JSON.parse(text) as Partial<JobProblem>;
    problem = {
      type: parsed.type ?? 'about:blank',
      title: parsed.title ?? '',
      status: parsed.status ?? r.status,
      detail: parsed.detail ?? text,
    };
  } catch {
    // not JSON: keep its text
  }
  return new JobError(call, problem);
}

const parsed = <T>(call: string, r: Resp): T => {
  try {
    return JSON.parse(r.body.toString('utf8')) as T;
  } catch (err) {
    throw new Error(`${call} failed: ${r.status} reply is not JSON: ${(err as Error).message}`, { cause: err });
  }
};

const ok = (r: Resp) => r.status >= 200 && r.status < 300;

/** Build context.job. In a pool, `member` names the calling function on every request; the solo shim passes none. */
export function makeJob(member?: string): JobClient {
  return {
    async start(alias, input, name) {
      const call = `context.job.start("${alias}")`;
      const body = Buffer.from(JSON.stringify(name === undefined ? { input } : { input, name }), 'utf8');
      const r = await send(
        'context.job',
        'POST',
        `/job/${encodeURIComponent(alias)}`,
        body,
        member,
        'application/json',
      );
      if (!ok(r)) throw refusal(call, r);
      return parsed<{ run: string }>(call, r).run;
    },
    async get(alias, run) {
      const call = `context.job.get("${alias}", "${run}")`;
      const r = await send(
        'context.job',
        'GET',
        `/job/${encodeURIComponent(alias)}/${encodeURIComponent(run)}`,
        undefined,
        member,
      );
      if (!ok(r)) throw refusal(call, r);
      return parsed<JobRunState>(call, r);
    },
  };
}

/** readApproval reads the approval of the caller's own run from funcd (funcd ADR-0348): null for a run with none, as a
 *  run of a Job with approval.bypass. It fails when funcd does not answer the run, so a handler never runs with an
 *  approval it could not read. */
export async function readApproval(): Promise<Approval | null> {
  const call = 'context.approval';
  const r = await send(call, 'GET', '/job/run', undefined, undefined);
  if (r.status !== 200) throw refusal(call, r);
  return parsed<{ approval: Approval | null }>(call, r).approval ?? null;
}
