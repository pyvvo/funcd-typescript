import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { TestContext } from 'node:test';

import type { Hono } from 'hono';

import { tempDir } from './tempdir.ts';

// writeHandlers writes each handler to a temp .mjs and returns the pool manifest.
export function writeHandlers(t: TestContext, handlers: Record<string, string>): { name: string; artifact: string }[] {
  const dir = tempDir(t, 'funcd-pool-test-');
  return Object.entries(handlers).map(([name, code]) => {
    const artifact = join(dir, `${name}.mjs`);
    writeFileSync(artifact, code);
    return { name, artifact };
  });
}

// post sends the pool's member `name` a CloudEvent carrying data.
export const post = (app: Hono, name: string, data: unknown, headers: Record<string, string> = {}) =>
  app.request(`/function/${name}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify({ id: '1', source: 's', type: 't', data }),
  });
