// The readiness half of funcd ADR-0215 Decision 4: ask funcd's GET /health/dependencies over the
// per-sandbox socket (FUNCD_INVOKE_SOCKET), the same socket as context.invoke/kv/blob.
import http from 'node:http';

import { MEMBER_HEADER } from './invoke.ts';

/** funcd's DependencyReport: the first of the caller's bindings that failed its check. */
export interface DependencyReport {
  kind: string;
  binding: string;
  reason: string;
  message: string;
}

/** funcd's DependencyCheckBudget: half its 100 ms readiness probe, so the shim answers inside it. */
export const dependencyCheckBudgetMs = 50;

const path = '/health/dependencies';

const socketReport = (reason: 'Unreachable' | 'Timeout', message: string): DependencyReport => ({
  kind: 'socket',
  binding: '',
  reason,
  message,
});

// judge maps funcd's answer to a report; undefined is a pass. A 404 is a funcd without the endpoint.
function judge(status: number, text: string): DependencyReport | undefined {
  if (status === 200 || status === 404) return undefined;
  if (status === 503) {
    try {
      const report = JSON.parse(text) as DependencyReport | null;
      if (typeof report?.kind === 'string' && report.kind !== '') return report;
    } catch {}
    return socketReport('Unreachable', `GET ${path} answered 503 without a dependency report: ${text}`);
  }
  return socketReport('Unreachable', `GET ${path} answered ${status}: ${text}`);
}

/** checkDependencies asks funcd for the caller's dependency report, as `member` on a pool's shared socket.
 *  It never rejects: no socket configured passes, and a socket that fails or does not answer before
 *  `signal` aborts gives a `socket` report. */
export function checkDependencies(
  member: string | undefined,
  signal: AbortSignal,
): Promise<DependencyReport | undefined> {
  return new Promise((resolve) => {
    const socketPath = process.env.FUNCD_INVOKE_SOCKET;
    if (!socketPath) {
      resolve(undefined);
      return;
    }
    let settled = false;
    const settle = (report: DependencyReport | undefined) => {
      if (settled) return;
      settled = true;
      signal.removeEventListener('abort', onAbort);
      resolve(report);
    };
    const unreachable = (err: Error) => settle(socketReport('Unreachable', `GET ${path} failed: ${err.message}`));
    const req = http.request(
      { socketPath, path, method: 'GET', headers: member ? { [MEMBER_HEADER]: member } : {} },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('error', unreachable);
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => settle(judge(res.statusCode ?? 0, Buffer.concat(chunks).toString('utf8'))));
      },
    );
    const onAbort = () => {
      settle(socketReport('Timeout', `GET ${path} did not answer within ${dependencyCheckBudgetMs} ms`));
      req.destroy();
    };
    req.on('error', unreachable);
    if (signal.aborted) onAbort();
    else signal.addEventListener('abort', onAbort);
    req.end();
  });
}
