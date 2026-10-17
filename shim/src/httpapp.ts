// The request and response bridge of a Function with spec.protocol: http (funcd ADR-0243). The edge forwards the
// request it received, with a JSON body wrapped in a CloudEvent envelope and any other body raw; the app answers a
// Response the shim streams back as it comes.
import type { Span } from './tracespan.ts';

const BODILESS = new Set(['GET', 'HEAD']);

/** appRequest rebuilds the request the edge received: its method, URL and headers, without funcd's own x-funcd-*
 *  headers and the envelope's Content-Length, and as its body the envelope's data re-encoded as JSON, none when the
 *  data is null, or the raw bytes of a body that is no envelope. */
export async function appRequest(raw: Request): Promise<Request> {
  const headers = new Headers();
  raw.headers.forEach((value, key) => {
    if (!key.startsWith('x-funcd-') && key !== 'content-length') headers.append(key, value);
  });
  let body: Uint8Array | string | null = null;
  if (!BODILESS.has(raw.method)) {
    const bytes = new Uint8Array(await raw.arrayBuffer());
    body = bytes.length === 0 ? null : unwrap(bytes);
  }
  return new Request(raw.url, { method: raw.method, headers, body });
}

/** unwrap returns an envelope's data as JSON text, null when it has none, or the bytes unchanged when they are no
 *  envelope. */
function unwrap(bytes: Uint8Array): Uint8Array | string | null {
  let value: unknown;
  try {
    value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    return bytes;
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value) || !('specversion' in value)) {
    return bytes;
  }
  const data = (value as { data?: unknown }).data;
  return data === undefined || data === null ? null : JSON.stringify(data);
}

/** streamed returns res with its body passed through as it is read, and ends span when the body ends: OK, or ERROR
 *  for a 5xx status, a failed read or a client that went away. */
export function streamed(res: Response, span: Pick<Span, 'end'>): Response {
  const outcome = res.status >= 500 ? 'ERROR' : 'OK';
  if (!res.body) {
    span.end(outcome);
    return res;
  }
  const reader = res.body.getReader();
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          span.end(outcome);
          controller.close();
          return;
        }
        controller.enqueue(value);
      } catch (err) {
        span.end('ERROR', String(err instanceof Error ? err.message : err));
        controller.error(err);
      }
    },
    cancel(reason) {
      span.end('ERROR', 'the client went away');
      return reader.cancel(reason);
    },
  });
  return new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers });
}
