// Synchronous fn-to-fn invoke over the worker-node local API (HTTP-over-UDS, ADR-0064). The
// platform bind-mounts the per-sandbox socket and provides its path via FUNCD_INVOKE_SOCKET; the
// handler calls context.invoke(alias, input) and the platform brokers the call to the linked target.
import http from 'node:http';

/** Build the context.invoke implementation. The returned function POSTs `input` to
 *  /invoke/<alias> over the worker-node UDS and resolves the target's JSON output, or rejects on a
 *  non-2xx (no link → 403, unknown target → 404, bad input → 422, target down/timeout → 503) or on a
 *  2xx body that is not JSON. */
export function makeInvoke(): <I = unknown, O = unknown>(alias: string, input: I) => Promise<O> {
  return <I, O>(alias: string, input: I): Promise<O> =>
    new Promise<O>((resolve, reject) => {
      const socketPath = process.env.FUNCD_INVOKE_SOCKET;
      if (!socketPath) {
        reject(new Error('context.invoke: worker-node local API socket unavailable (FUNCD_INVOKE_SOCKET unset)'));
        return;
      }
      const body = JSON.stringify(input ?? null);
      const req = http.request(
        {
          socketPath,
          path: `/invoke/${encodeURIComponent(alias)}`,
          method: 'POST',
          headers: { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body) },
        },
        (res) => {
          const chunks: Buffer[] = [];
          // A connection that drops mid-body errors the response, not the request, and never ends it.
          res.on('error', (err) =>
            reject(
              new Error(`context.invoke("${alias}") failed: connection closed before the reply ended`, { cause: err }),
            ),
          );
          res.on('data', (c: Buffer) => chunks.push(c));
          res.on('end', () => {
            const text = Buffer.concat(chunks).toString('utf8');
            const status = res.statusCode ?? 0;
            if (status >= 200 && status < 300) {
              // This listener runs outside the Promise executor: a parse error thrown here would be uncaught.
              try {
                resolve((text ? JSON.parse(text) : null) as O);
              } catch (err) {
                reject(
                  new Error(`context.invoke("${alias}") failed: ${status} reply is not JSON: ${text}`, { cause: err }),
                );
              }
            } else {
              reject(new Error(`context.invoke("${alias}") failed: ${status} ${text}`));
            }
          });
        },
      );
      req.on('error', reject);
      req.end(body);
    });
}
