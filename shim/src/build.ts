// funcd Node contract build (BUILD-TIME, ADR-0058/0060). The TS analog of funcd_shim.build: for an
// author module declaring `FuncInput`/`FuncOutput` types it generates the JSON Schema of each side
// (ts-json-schema-generator — closed records, no $ref). It bakes no validator: funcd checks each call
// against the contract itself (funcd ADR-0303).
//
// Runs on the push box; NOT bundled into shim.mjs.
//
// (ADR-0060 names typia; typia needs a TS *transformer* (ts-patch) that does not compose with the
//  esbuild bundle. ts-json-schema-generator is the no-transformer equivalent — same "TS type ->
//  JSON Schema", same MIT licence.)
import { createGenerator, type Schema } from 'ts-json-schema-generator';

export interface ContractBuild {
  inputSchema: Schema | null;
  outputSchema: Schema | null;
}

/** Build the FuncInput/FuncOutput contract of the TS module at `tsPath`; a side it does not declare is null. */
export function buildContract(tsPath: string): ContractBuild {
  return { inputSchema: schemaFor(tsPath, 'FuncInput'), outputSchema: schemaFor(tsPath, 'FuncOutput') };
}

/** Generate the JSON Schema for `type` from `tsPath`, inlined (no $ref) + closed records — the
 *  funcd profile shape; returns null when the type is not declared. */
function schemaFor(tsPath: string, type: string): Schema | null {
  try {
    const schema = createGenerator({
      path: tsPath,
      type,
      additionalProperties: false, // closed records (the profile forbids open ones)
      topRef: false, // inline the root type (no $ref to a definition)
      expose: 'none', // inline nested types too (no $ref/$defs — the profile forbids $ref)
      skipTypeCheck: true,
    }).createSchema(type);
    const stripped = stripMeta(schema);
    discriminateUnions(stripped); // tagged `anyOf` → the profile's discriminated `oneOf`
    return stripped;
  } catch {
    return null; // the type is not declared in this module
  }
}

/** Rewrite every tagged `anyOf` into the profile's discriminated `oneOf` + `discriminator`
 *  (ADR-0058). ts-json-schema-generator emits a TS union as `anyOf`, but the gate accepts a union
 *  only as a tagged `oneOf`; when the branches share a required, distinct-`const` property (the
 *  discriminant) the two are equivalent, so convert in place (recursing all nested schemas). */
function discriminateUnions(node: unknown): void {
  if (Array.isArray(node)) {
    for (const child of node) discriminateUnions(child);
    return;
  }
  if (!node || typeof node !== 'object') return;
  const obj = node as Record<string, unknown>;
  for (const value of Object.values(obj)) discriminateUnions(value);
  if (Array.isArray(obj.anyOf)) {
    const tag = discriminatorTag(obj.anyOf);
    if (tag) {
      obj.oneOf = obj.anyOf;
      delete obj.anyOf;
      obj.discriminator = { propertyName: tag };
    }
  }
}

/** The property that discriminates an `anyOf`'s branches: present + required + a single `const` in
 *  every branch, with distinct const values. Returns null when the union isn't a clean tagged one. */
function discriminatorTag(branches: unknown[]): string | null {
  const objs = branches.map((b) => (b && typeof b === 'object' ? (b as Record<string, unknown>) : null));
  if (objs.some((b) => b === null)) return null;
  const firstProps = objs[0]?.properties as Record<string, unknown> | undefined;
  if (!firstProps) return null;
  for (const name of Object.keys(firstProps)) {
    const consts: string[] = [];
    const taggedByAll = objs.every((b) => {
      const props = b?.properties as Record<string, { const?: unknown }> | undefined;
      const required = b?.required as string[] | undefined;
      const field = props?.[name];
      if (!props || !Array.isArray(required) || !required.includes(name) || !field || !('const' in field)) {
        return false;
      }
      consts.push(JSON.stringify(field.const));
      return true;
    });
    if (taggedByAll && new Set(consts).size === consts.length) return name;
  }
  return null;
}

/** Drop JSON-Schema meta keys the gate doesn't need (the contract is the type shape). */
function stripMeta(schema: Schema): Schema {
  const { $schema, $ref, definitions, ...rest } = schema as Record<string, unknown>;
  void $schema;
  void $ref;
  void definitions;
  return rest as Schema;
}
