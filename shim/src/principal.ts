// The principal of a signed-in call (funcd ADR-0335). funcd's edge sets four headers for a call it signed in and drops
// any copy a caller sent, so the shim builds ctx.principal from those headers alone. A value the edge does not write
// gives no principal and never fails the call.
import type { FunctionContext } from './types.ts';

/** The principal of a signed-in call, as ctx.principal holds it. */
export type Principal = NonNullable<FunctionContext['principal']>;

/** The headers funcd's edge sets for a signed-in call. An http app receives them as sent. */
export const PRINCIPAL_HEADERS: ReadonlySet<string> = new Set([
  'x-funcd-principal',
  'x-funcd-principal-id',
  'x-funcd-principal-name',
  'x-funcd-id-token',
]);

// Standard Base64 with its padding, the form the edge writes.
const BASE64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// Node reads each byte of a header value as one Latin-1 character; the edge writes the values as UTF-8.
const utf8 = (value: string): string => Buffer.from(value, 'latin1').toString('utf8');

/** principalFrom builds a call's principal from its headers: provider and claims from X-Funcd-Principal, the standard
 *  Base64 of the JSON {provider, claims}, id from X-Funcd-Principal-Id and name from X-Funcd-Principal-Name. It is
 *  undefined when X-Funcd-Principal or X-Funcd-Principal-Id is absent or empty, or when X-Funcd-Principal is not that
 *  encoding of an object with a provider name and an object of claims. */
export function principalFrom(headers: Headers): Principal | undefined {
  const encoded = headers.get('x-funcd-principal');
  const id = headers.get('x-funcd-principal-id');
  if (!encoded || !id || !BASE64.test(encoded)) return undefined;
  let value: unknown;
  try {
    value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.from(encoded, 'base64')));
  } catch {
    return undefined;
  }
  if (!isObject(value) || typeof value.provider !== 'string' || value.provider === '' || !isObject(value.claims)) {
    return undefined;
  }
  const principal: Principal = { provider: value.provider, id: utf8(id), claims: value.claims };
  const name = headers.get('x-funcd-principal-name');
  if (name) principal.name = utf8(name);
  return principal;
}
