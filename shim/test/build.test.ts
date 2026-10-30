import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildContract } from '../src/build.ts';
import { tempDir } from './tempdir.ts';

const FIXTURE =
  'export interface FuncInput { orderId: string; qty: number }\n' +
  'export interface FuncOutput { accepted: boolean }\n' +
  'export function handle() {}\n';

interface ObjSchema {
  additionalProperties?: unknown;
  properties: Record<string, { type: string }>;
}

// buildContract turns each declared TS type into a closed JSON Schema and bakes no validator (funcd ADR-0303).
test('buildContract emits closed schemas and no validator', (t) => {
  const tsPath = join(tempDir(t, 'funcd-build-'), 'fn.ts');
  writeFileSync(tsPath, FIXTURE);

  const r = buildContract(tsPath);
  const input = r.inputSchema as unknown as ObjSchema;
  const output = r.outputSchema as unknown as ObjSchema;

  // records are CLOSED, types derived from the TS interfaces (ts-json-schema-generator).
  assert.equal(input.additionalProperties, false);
  assert.equal(input.properties.qty.type, 'number');
  assert.equal(output.properties.accepted.type, 'boolean');
  assert.deepEqual(Object.keys(r), ['inputSchema', 'outputSchema']);
});

// no contract declared -> no schema.
test('buildContract with no FuncInput/FuncOutput returns no schema', (t) => {
  const tsPath = join(tempDir(t, 'funcd-build-'), 'fn.ts');
  writeFileSync(tsPath, 'export function handle() { return { ok: true }; }\n');
  const r = buildContract(tsPath);
  assert.equal(r.inputSchema, null);
  assert.equal(r.outputSchema, null);
});

// scenario: discriminated-union-contract (Node) — a TS union -> the profile's tagged `oneOf` +
// `discriminator` (ts-json-schema-generator emits `anyOf`; the build converts it, ADR-0058).
test('buildContract converts a tagged union to a discriminated oneOf', (t) => {
  const tsPath = join(tempDir(t, 'funcd-build-'), 'fn.ts');
  writeFileSync(
    tsPath,
    'export interface FuncInput { qty: number }\n' +
      'export type FuncOutput =\n' +
      "  | { kind: 'accepted'; id: string }\n" +
      "  | { kind: 'rejected'; reason: string };\n" +
      'export function handle() {}\n',
  );

  const r = buildContract(tsPath);
  const out = r.outputSchema as unknown as {
    anyOf?: unknown;
    oneOf?: unknown[];
    discriminator?: { propertyName: string };
  };

  assert.equal(out.anyOf, undefined, 'no bare anyOf (the gate rejects it)');
  assert.equal(Array.isArray(out.oneOf), true, 'a oneOf union');
  assert.equal(out.discriminator?.propertyName, 'kind', 'discriminated on the tag field');
});
