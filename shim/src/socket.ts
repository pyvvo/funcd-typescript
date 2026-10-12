// The worker-node local API client shared by context.kv, context.blob and context.sql: one HTTP request over the
// per-sandbox socket (FUNCD_INVOKE_SOCKET), as the calling pool member when one is given.
import http from 'node:http';

import { MEMBER_HEADER } from './invoke.ts';

export interface Resp {
  status: number;
  body: Buffer;
}

/** send makes one request; `client` names the context client in its errors ("context.kv"). */
export function send(
  client: string,
  method: string,
  path: string,
  body: Buffer | undefined,
  member: string | undefined,
  contentType?: string,
): Promise<Resp> {
  return new Promise<Resp>((resolve, reject) => {
    const socketPath = process.env.FUNCD_INVOKE_SOCKET;
    if (!socketPath) {
      reject(new Error(`${client}: worker-node local API socket unavailable (FUNCD_INVOKE_SOCKET unset)`));
      return;
    }
    const headers: Record<string, number | string> = {};
    if (body) headers['content-length'] = body.byteLength;
    if (contentType) headers['content-type'] = contentType;
    if (member) headers[MEMBER_HEADER] = member;
    const req = http.request({ socketPath, path, method, headers }, (res) => {
      const chunks: Buffer[] = [];
      // A connection that drops mid-body errors the response, not the request, and never ends it.
      res.on('error', (err) =>
        reject(
          new Error(`${client} ${method} ${path} failed: connection closed before the reply ended`, { cause: err }),
        ),
      );
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode ?? 0, body: Buffer.concat(chunks) }));
    });
    req.on('error', (err) => reject(new Error(`${client} ${method} ${path} failed: ${err.message}`, { cause: err })));
    if (body) req.end(body);
    else req.end();
  });
}
