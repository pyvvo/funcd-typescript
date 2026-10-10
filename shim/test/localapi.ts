// A fake funcd invoke socket answering GET /health/dependencies (funcd ADR-0215), shared by the shim and
// pool readiness tests.
import { once } from 'node:events';
import http from 'node:http';
import { join } from 'node:path';
import type { TestContext } from 'node:test';

import { type Reply, send } from './reply.ts';
import { tempDir } from './tempdir.ts';

/** `hold` never answers; `drop` closes the connection before any reply. */
export type Answer = Reply | 'hold' | 'drop';

export interface FakeAPI {
  socket: string;
  /** One `<method> <path> <member or ->` line per request. */
  calls: string[];
}

/** fakeDependencies serves `answer(member)` on a unix socket and points FUNCD_INVOKE_SOCKET at it for the
 *  rest of the test. */
export async function fakeDependencies(
  t: TestContext,
  answer: (member: string | undefined) => Answer,
): Promise<FakeAPI> {
  const socket = join(tempDir(t, 'funcd-deps-'), 'api.sock');
  const calls: string[] = [];
  const server = http.createServer((req, res) => {
    const member = req.headers['x-funcd-member'] as string | undefined;
    calls.push(`${req.method} ${req.url} ${member ?? '-'}`);
    const a = answer(member);
    if (a === 'hold') return;
    if (a === 'drop') {
      req.socket.destroy();
      return;
    }
    send(res, a);
  });
  server.listen(socket);
  await once(server, 'listening');
  server.unref();
  const prev = process.env.FUNCD_INVOKE_SOCKET;
  process.env.FUNCD_INVOKE_SOCKET = socket;
  t.after(() => {
    if (prev === undefined) delete process.env.FUNCD_INVOKE_SOCKET;
    else process.env.FUNCD_INVOKE_SOCKET = prev;
    server.closeAllConnections();
    server.close();
  });
  return { socket, calls };
}
