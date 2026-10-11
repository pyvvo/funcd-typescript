import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// startEntrypoint runs src/<entry>.ts as the process driver does, with any extra node flags, and resolves once it
// listens. `exited` resolves with how the process ended.
export async function startEntrypoint(entry: 'shim' | 'pool', env: Record<string, string>, nodeArgs: string[] = []) {
  const child = spawn(
    process.execPath,
    [
      '--experimental-strip-types',
      '--no-warnings',
      ...nodeArgs,
      fileURLToPath(new URL(`../src/${entry}.ts`, import.meta.url)),
    ],
    { env, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  let stderr = '';
  const exited = new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((resolve) =>
    child.on('exit', (code, signal) => resolve({ code, signal })),
  );
  const port = await new Promise<number>((resolve, reject) => {
    let stdout = '';
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    // ADR-0168: the listening line is on stdout, so a normal start is not ERROR.
    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
      const m = /listening on [^:]+:(\d+)/.exec(stdout);
      if (m) resolve(Number(m[1]));
    });
    void exited.then(({ code, signal }) =>
      reject(new Error(`${entry} exited ${code ?? signal} before listening: ${stderr}`)),
    );
  });
  return { child, port, exited, stderr: () => stderr };
}
