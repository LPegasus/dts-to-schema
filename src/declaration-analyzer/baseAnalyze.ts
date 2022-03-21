import type * as ts from "typescript";

export function baseAnalyze(node: ts.Node, typeChecker: ts.TypeChecker) {
  const symbol: ts.Symbol = (node as any).symbol;
  const fullyQualifiedName = typeChecker.getFullyQualifiedName(symbol);

  const declarations = symbol.getDeclarations();

  if (!declarations) {
    throw new Error(`Symbol ${fullyQualifiedName} is not declared.`);
  }

  const lastDeclaration = declarations[declarations.length - 1];

  return {
    symbol,
    fullyQualifiedName,
    lastDeclaration,
  };
}
