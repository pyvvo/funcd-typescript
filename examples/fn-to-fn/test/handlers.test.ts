import { test } from 'node:test';
import assert from 'node:assert/strict';

import type { CloudEvent, FunctionContext } from '@funcd-dev/shim';
import { handle as greeter, type FuncInput as GreeterInput } from '../src/greeter.ts';
import { handle as front, type FuncInput as FrontInput } from '../src/front.ts';
import { handle as hold, type FuncInput as HoldInput } from '../src/hold.ts';
import { handle as fanout, type FuncInput as FanoutInput } from '../src/fanout.ts';

// The author's unit tests exercise each handler directly. front's call to context.invoke is mocked
// here — the real brokered round-trip is proven by the e2e (pkg/funcd/invoke_e2e_test.go). The cast
// to FunctionContext is because invoke is a generic method a concrete mock can't structurally model.

test('greeter greets by name', () => {
  const ctx = { log: () => {}, invoke: async () => ({}) } as unknown as FunctionContext;
  const event: CloudEvent<GreeterInput> = { id: '1', source: '/t', type: 'x', data: { name: 'funcd' } };
  assert.deepEqual(greeter(ctx, event), { greeting: 'Hello, funcd!' });
});

test('front invokes the greeter link and wraps the reply', async () => {
  const calls: Array<{ alias: string; input: unknown }> = [];
  const ctx = {
    log: () => {},
    invoke: async (alias: string, input: unknown) => {
      calls.push({ alias, input });
      return { greeting: 'Hello, funcd!' };
    },
  } as unknown as FunctionContext;
  const event: CloudEvent<FrontInput> = { id: '2', source: '/t', type: 'x', data: { name: 'funcd' } };

  const out = await front(ctx, event);

  assert.deepEqual(out, { via: 'front', greeting: 'Hello, funcd!' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0]!.alias, 'greeter');
  assert.deepEqual(calls[0]!.input, { data: { name: 'funcd' } });
});

test('hold keeps the call for data.ms and reports it', async () => {
  const ctx = { log: () => {} } as unknown as FunctionContext;
  const event: CloudEvent<HoldInput> = { id: '3', source: '/t', type: 'x', data: { ms: 5 } };
  assert.deepEqual(await hold(ctx, event), { held: 5 });
});

test('fanout calls the peer link n times at once and counts the nested-cap refusals', async () => {
  const calls: Array<{ alias: string; input: unknown }> = [];
  let inFlight = 0;
  const ctx = {
    log: () => {},
    invoke: async (alias: string, input: unknown) => {
      calls.push({ alias, input });
      if (inFlight === 2) {
        throw new Error(
          'context.invoke("peer") failed: 429 {"type":"urn:funcd:problem:resource-exhausted","status":429,"detail":"workernode.local.nested-cap: default/hold has 2 nested calls in flight, the cap set by invoke.maxNestedInFlight"}',
        );
      }
      inFlight++;
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight--;
      return { held: 2000 };
    },
  } as unknown as FunctionContext;
  const event: CloudEvent<FanoutInput> = { id: '4', source: '/t', type: 'x', data: { n: 3 } };

  const out = await fanout(ctx, event);

  assert.equal(out.ok, 2);
  assert.equal(out.refused, 1);
  assert.match(out.detail, /workernode\.local\.nested-cap: default\/hold has 2 nested calls in flight/);
  assert.equal(calls.length, 3);
  assert.ok(calls.every((c) => c.alias === 'peer'));
  assert.deepEqual(calls[0]!.input, { data: { ms: 2000 } });
});

test('fanout fails on an error that is not a nested-cap refusal', async () => {
  const ctx = {
    log: () => {},
    invoke: async () => {
      throw new Error('context.invoke("peer") failed: 503 target down');
    },
  } as unknown as FunctionContext;
  const event: CloudEvent<FanoutInput> = { id: '5', source: '/t', type: 'x', data: { n: 2, ms: 1 } };
  await assert.rejects(async () => fanout(ctx, event), /503 target down/);
});
