// api.ts writes api.json: the handler API that funcd's guide shows on each feature's Spec tab. It reads
// FunctionContext in src/types.ts: each client is one of its properties (ctx.kv), and the context's own methods are
// the client named "". Run by `yarn build:api`; test/api.test.ts fails when api.json is stale.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

export interface Method {
  name: string;
  signature: string;
  doc: string;
}

export interface Client {
  name: string;
  type: string;
  doc: string;
  methods: Method[];
}

const flat = (text: string) =>
  text.replace(/\s+/g, ' ').replace(/\( /g, '(').replace(/ \)/g, ')').replace(/,\)/g, ')').trim();

export const api = (): { clients: Client[] } => {
  const file = fileURLToPath(new URL('../src/types.ts', import.meta.url));
  const program = ts.createProgram([file], { noEmit: true, allowImportingTsExtensions: true, strict: true });
  const checker = program.getTypeChecker();
  const doc = (name: ts.Node) =>
    flat(ts.displayPartsToString(checker.getSymbolAtLocation(name)?.getDocumentationComment(checker) ?? []));
  const methods = (members: ts.NodeArray<ts.TypeElement>): Method[] =>
    members.filter(ts.isMethodSignature).map((m) => ({
      name: m.name.getText(),
      signature: flat(m.getText().replace(/;$/, '')),
      doc: doc(m.name),
    }));
  const context = program
    .getSourceFile(file)
    ?.statements.find(
      (s): s is ts.InterfaceDeclaration => ts.isInterfaceDeclaration(s) && s.name.text === 'FunctionContext',
    );
  if (!context) throw new Error('src/types.ts declares no FunctionContext');
  const clients: Client[] = [
    { name: '', type: 'FunctionContext', doc: doc(context.name), methods: methods(context.members) },
  ];
  for (const p of context.members.filter(ts.isPropertySignature)) {
    const declaration = p.type && checker.getTypeAtLocation(p.type).getSymbol()?.declarations?.[0];
    if (declaration && ts.isInterfaceDeclaration(declaration)) {
      clients.push({
        name: p.name.getText(),
        type: declaration.name.text,
        doc: doc(p.name),
        methods: methods(declaration.members),
      });
    }
  }
  return { clients };
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(new URL('../api.json', import.meta.url), `${JSON.stringify(api(), null, 2)}\n`);
}
