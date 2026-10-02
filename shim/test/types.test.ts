import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

// docOf returns the documentation an editor shows for iface.member in the published types module.
function docOf(iface: string, member: string): string {
  const file = fileURLToPath(new URL('../src/types.ts', import.meta.url));
  const program = ts.createProgram([file], { allowImportingTsExtensions: true, noEmit: true });
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(file);
  assert.ok(source);
  const moduleSymbol = checker.getSymbolAtLocation(source);
  assert.ok(moduleSymbol);
  const symbol = checker.getExportsOfModule(moduleSymbol).find((s) => s.name === iface);
  assert.ok(symbol, `${iface} is exported`);
  const property = checker.getDeclaredTypeOfSymbol(symbol).getProperty(member);
  assert.ok(property, `${iface}.${member} exists`);
  return ts.displayPartsToString(property.getDocumentationComment(checker)).replace(/\s+/g, ' ');
}

// The fn-to-fn broker applies the ADR-0134 passthrough rule to the invoke input, so an author must
// learn from the invoke docs that an object with its own top-level data key is unwrapped.
test('issue r18: the context.invoke docs state the ADR-0134 envelope rule and its workaround', () => {
  const doc = docOf('FunctionContext', 'invoke');
  assert.match(doc, /ADR-0134/);
  assert.match(doc, /top-level `data` or `specversion` key/);
  assert.match(doc, /only its `data`/);
  assert.match(doc, /\{ specversion: '1\.0', data: \{ data: /);
});
