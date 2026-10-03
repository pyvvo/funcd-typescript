// The fake worker-node local API's reply, shared by the invoke, kv and blob tests.
import assert from 'node:assert';
import type { ServerResponse } from 'node:http';

export interface Reply {
  status: number;
  body: string;
  /** Declare one byte more than the body, send the body, then drop the connection: a reply that ends
   *  mid-body, as when funcd closes the local API during a write (funcd-typescript#21). */
  cut?: boolean;
}

export function send(res: ServerResponse, r: Reply): void {
  if (!r.cut) {
    res.statusCode = r.status;
    res.end(r.body);
    return;
  }
  res.writeHead(r.status, { 'content-length': Buffer.byteLength(r.body) + 1 });
  res.write(r.body, () => res.socket?.destroy());
}

/** An assert.rejects validator: the error names the failed call and keeps the original error as its cause. */
export function named(pattern: RegExp, cause: new (...args: never[]) => Error) {
  return (err: Error) => {
    assert.match(err.message, pattern);
    assert.ok(err.cause instanceof cause, `cause: ${String(err.cause)}`);
    return true;
  };
}
