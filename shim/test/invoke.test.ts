// Scenario tests for context.invoke (ADR-0064): the Node client over a minimal fake worker-node local API
// (HTTP-over-UDS), proving how it settles on the target's reply without a real platform.
import assert from 'node:assert';
import http from 'node:http';
import { join } from 'node:path';
import { type TestContext, test } from 'node:test';

import { invStore } from '../src/invcontext.ts';
import { makeInvoke } from '../src/invoke.ts';
import { newInvContext } from '../src/tracespan.ts';
import { named, type Reply, send } from './reply.ts';
import { tempDir } from './tempdir.ts';

type Invoke = ReturnType<typeof makeInvoke>;

// withServer spins a UDS HTTP server that answers every request with `reply`, points FUNCD_INVOKE_SOCKET
// at it, runs fn(invoke), then tears it all down.
function withServer(reply: Reply, fn: (invoke: Invoke) => Promise<void>) {
  return async (t: TestContext) => {
    const sock = join(tempDir(t, 'funcd-invoke-'), 'api.sock');
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

test(
  'issue r29: a local API socket with no listener rejects the invoke promise with a named error',
  withServer({ status: 200, body: '{}' }, async (invoke) => {
    process.env.FUNCD_INVOKE_SOCKET += '.absent';
    await assert.rejects(invoke('callee', {}), named(/^context\.invoke\("callee"\) failed: connect ENOENT/, Error));
  }),
);

// ADR-0165: the CLIENT span of a context.invoke call. withRecorder answers every request with `reply`
// after `delayMs`, recording each request's traceparent header; fn gets a span sink that collects lines.
interface Recorded {
  traceparents: (string | undefined)[];
  lines: string[];
  sink: (line: string) => void;
}

function withRecorder(reply: Reply, delayMs: number, fn: (rec: Recorded) => Promise<void>) {
  return async (t: TestContext) => {
    const sock = join(tempDir(t, 'funcd-invoke-'), 'api.sock');
    const lines: string[] = [];
    const rec: Recorded = { traceparents: [], lines, sink: (line) => lines.push(line) };
    const server = http.createServer((req, res) => {
      rec.traceparents.push(req.headers.traceparent as string | undefined);
      setTimeout(() => send(res, reply), delayMs);
    });
    await new Promise<void>((resolve) => server.listen(sock, resolve));
    server.unref();
    const prev = process.env.FUNCD_INVOKE_SOCKET;
    process.env.FUNCD_INVOKE_SOCKET = sock;
    try {
      await fn(rec);
    } finally {
      if (prev === undefined) delete process.env.FUNCD_INVOKE_SOCKET;
      else process.env.FUNCD_INVOKE_SOCKET = prev;
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  };
}

const CALLER_TP = `00-${'a'.repeat(32)}-${'b'.repeat(16)}-01`;

function spanLines(lines: string[]): Record<string, unknown>[] {
  return lines.map((l) => JSON.parse(l) as Record<string, unknown>);
}

test(
  'client span stamps traceparent and emits CLIENT',
  withRecorder({ status: 200, body: '{"ok":true}' }, 0, async (rec) => {
    const inv = newInvContext(CALLER_TP);
    const out = await invStore.run(inv, () => makeInvoke({ sink: rec.sink })('greeter', { name: 'x' }));
    assert.deepStrictEqual(out, { ok: true });
    const [span] = spanLines(rec.lines);
    assert.strictEqual(rec.lines.length, 1);
    assert.strictEqual(rec.traceparents[0], `00-${inv.traceId}-${span.span_id}-01`);
    assert.match(String(span.span_id), /^[0-9a-f]{16}$/);
    assert.notStrictEqual(span.span_id, inv.spanId);
    assert.deepStrictEqual(
      { ...span, span_id: '', start: 0, end: 0 },
      {
        'funcd.signal': 'traces',
        trace_id: inv.traceId,
        span_id: '',
        parent_id: inv.spanId,
        name: 'call greeter',
        kind: 'CLIENT',
        start: 0,
        end: 0,
        status: 'OK',
        status_msg: '',
        attrs: { 'http.status_code': '200' },
        inv: inv.inv,
        links: [],
      },
    );
  }),
);

test(
  'failed call emits an ERROR client span',
  withRecorder({ status: 422, body: 'event data does not match the input contract' }, 50, async (rec) => {
    const inv = newInvContext(CALLER_TP);
    let msg = '';
    await assert.rejects(
      invStore.run(inv, () => makeInvoke({ sink: rec.sink })('greeter', {})),
      (err: Error) => {
        msg = err.message;
        return /failed: 422 /.test(err.message);
      },
    );
    const [span] = spanLines(rec.lines);
    assert.strictEqual(span.kind, 'CLIENT');
    assert.strictEqual(span.status, 'ERROR');
    assert.strictEqual(span.status_msg, msg);
    assert.deepStrictEqual(span.attrs, { 'http.status_code': '422' });
    assert.ok(Number(span.end) - Number(span.start) >= 45e6, `span covers the 50 ms delay: ${span.start}..${span.end}`);
  }),
);

test(
  'outside an invocation, no traceparent and no span',
  withRecorder({ status: 200, body: '{}' }, 0, async (rec) => {
    await makeInvoke({ sink: rec.sink })('greeter', {});
    assert.deepStrictEqual(rec.traceparents, [undefined]);
    assert.deepStrictEqual(rec.lines, []);
  }),
);

test(
  'no telemetry channel: traceparent sent, no span line',
  withRecorder({ status: 200, body: '{}' }, 0, async (rec) => {
    const inv = newInvContext(CALLER_TP);
    await invStore.run(inv, () => makeInvoke({ sink: null })('greeter', {}));
    assert.match(String(rec.traceparents[0]), new RegExp(`^00-${inv.traceId}-[0-9a-f]{16}-01$`));
    assert.deepStrictEqual(rec.lines, []);
  }),
);

test(
  'unset invoke socket: ERROR client span with no http.status_code',
  withRecorder({ status: 200, body: '{}' }, 0, async (rec) => {
    delete process.env.FUNCD_INVOKE_SOCKET;
    const inv = newInvContext(CALLER_TP);
    await assert.rejects(
      invStore.run(inv, () => makeInvoke({ sink: rec.sink })('greeter', {})),
      /FUNCD_INVOKE_SOCKET unset/,
    );
    const [span] = spanLines(rec.lines);
    assert.strictEqual(span.status, 'ERROR');
    assert.match(String(span.status_msg), /FUNCD_INVOKE_SOCKET unset/);
    assert.deepStrictEqual(span.attrs, {});
  }),
);

test(
  'a 2xx reply that is not JSON: ERROR client span with http.status_code 200',
  withRecorder({ status: 200, body: 'not json' }, 0, async (rec) => {
    const inv = newInvContext(CALLER_TP);
    await assert.rejects(
      invStore.run(inv, () => makeInvoke({ sink: rec.sink })('greeter', {})),
      /reply is not JSON/,
    );
    const [span] = spanLines(rec.lines);
    assert.strictEqual(span.status, 'ERROR');
    assert.deepStrictEqual(span.attrs, { 'http.status_code': '200' });
  }),
);

test(
  'a pool member: the client span carries funcd.member',
  withRecorder({ status: 200, body: '{}' }, 0, async (rec) => {
    const inv = newInvContext(CALLER_TP);
    await invStore.run(inv, () => makeInvoke({ member: 'front', sink: rec.sink })('greeter', {}));
    const [span] = spanLines(rec.lines);
    assert.strictEqual(span.kind, 'CLIENT');
    assert.strictEqual(span['funcd.member'], 'front');
  }),
);

test(
  'a long error reply: the client span keeps its status code and its status_msg is cut at the bound',
  withRecorder({ status: 422, body: 'x'.repeat(10_000) }, 0, async (rec) => {
    const inv = newInvContext(CALLER_TP);
    await assert.rejects(invStore.run(inv, () => makeInvoke({ sink: rec.sink, bound: 2048 })('greeter', {})));
    const line = rec.lines[0].slice(0, -1);
    const [span] = spanLines(rec.lines);
    assert.ok(Buffer.byteLength(line) <= 2048, `line is ${Buffer.byteLength(line)} bytes`);
    assert.strictEqual(span.kind, 'CLIENT');
    const attrs = span.attrs as Record<string, string>;
    assert.strictEqual(attrs['http.status_code'], '422');
    assert.strictEqual(attrs.truncated, 'true');
    assert.strictEqual(Number(attrs.keptBytes), Buffer.byteLength(String(span.status_msg)));
    assert.match(String(span.status_msg), /^context\.invoke\("greeter"\) failed: 422 x+$/);
  }),
);
