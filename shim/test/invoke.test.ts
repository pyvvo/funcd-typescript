// Scenario tests for context.invoke (ADR-0064): the Node client over a minimal fake worker-node local API
// (HTTP-over-UDS), proving how it settles on the target's reply without a real platform.
import assert from 'node:assert';
import { mkdtempSync } from 'node:fs';
import http from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { makeInvoke } from '../src/invoke.ts';
import { type Reply, send } from './reply.ts';

type Invoke = ReturnType<typeof makeInvoke>;

// withServer spins a UDS HTTP server that answers every request with `reply`, points FUNCD_INVOKE_SOCKET
// at it, runs fn(invoke), then tears it all down.
function withServer(reply: Reply, fn: (invoke: Invoke) => Promise<void>) {
  return async () => {
    const sock = join(mkdtempSync(join(tmpdir(), 'funcd-invoke-')), 'api.sock');
    const server = http.createServer((_req, res) => send(res, reply));
    await new Promise<void>((resolve) => server.listen(sock, resolve));
    // unref: an invoke that never settles then fails the test instead of hanging the file.
    server.unref();
    const prev = process.env.FUNCD_INVOKE_SOCKET;
    process.env.FUNCD_INVOKE_SOCKET = sock;
    try {
      await fn(makeInvoke());
    } finally {
      if (prev === undefined) delete process.env.FUNCD_INVOKE_SOCKET;
      else process.env.FUNCD_INVOKE_SOCKET = prev;
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  };
}

test(
  'issue 130: a 2xx reply that is not JSON rejects the invoke promise',
  withServer({ status: 200, body: '{"x": NaN}' }, async (invoke) => {
    await assert.rejects(invoke('callee', {}), /context\.invoke\("callee"\) failed: 200 /);
  }),
);

test(
  'issue r21: a reply that drops mid-body rejects the invoke promise',
  withServer({ status: 200, body: '{"ok":true}', cut: true }, async (invoke) => {
    await assert.rejects(
      invoke('callee', {}),
      /context\.invoke\("callee"\) failed: connection closed before the reply ended/,
    );
  }),
);
