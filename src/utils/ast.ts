import * as ts from "typescript";

export function printImportStartStatement(
  aliasName: string,
  moduleSpecifier: string
): string {
  const ast = ts.factory.createImportDeclaration(
    undefined,
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamespaceImport(ts.factory.createIdentifier(aliasName))
    ),
    ts.factory.createStringLiteral(moduleSpecifier),
    undefined
  );

  const code = ts
    .createPrinter({ newLine: ts.NewLineKind.LineFeed })
    .printNode(
      ts.EmitHint.Expression,
      ast,
      ts.createSourceFile("", "", ts.ScriptTarget.ESNext, false)
    );

  return code;
}

export function filterNodeForSourceFile(
  sourceFile: ts.SourceFile,
  predicate: (node: ts.Node) => boolean
) {
  const results: ts.Node[] = [];
  const scan = (node: ts.Node) => {
    if (predicate(node)) {
      results.push(node);
    }
    node.forEachChild(scan);
  };

  scan(sourceFile);

  return results;
}
