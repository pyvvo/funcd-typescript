// Where a worker reaches funcd's worker-node local API (funcd ADR-0064, ADR-0346 Decision 6): its own listener when it
// runs in a container under funcdctl dev, else its per-sandbox socket. Every client of the local API dials through it.
import type http from 'node:http';

/** The header that carries a container worker's token to its own local API listener (funcd ADR-0346 Decision 6). */
export const TOKEN_HEADER = 'x-funcd-invoke-token';

/** Where a request reaches the local API: the options that dial it and the headers every request carries. */
export interface LocalApi {
  options: http.RequestOptions;
  headers: Record<string, string>;
}

/** localApi is where this worker reaches funcd's local API: FUNCD_INVOKE_URL, the listener of a worker in a container,
 *  with FUNCD_INVOKE_TOKEN in TOKEN_HEADER on every request (funcd ADR-0346 Decision 6), else the socket
 *  FUNCD_INVOKE_SOCKET (funcd ADR-0064); undefined when neither is set. */
export function localApi(env: NodeJS.ProcessEnv = process.env): LocalApi | undefined {
  const url = env.FUNCD_INVOKE_URL;
  if (url) {
    const u = new URL(url);
    const headers: Record<string, string> = {};
    if (env.FUNCD_INVOKE_TOKEN) headers[TOKEN_HEADER] = env.FUNCD_INVOKE_TOKEN;
    return { options: { host: u.hostname, port: u.port === '' ? 80 : Number(u.port) }, headers };
  }
  const socketPath = env.FUNCD_INVOKE_SOCKET;
  return socketPath ? { options: { socketPath }, headers: {} } : undefined;
}
