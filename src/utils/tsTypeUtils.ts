import * as ts from "typescript";

export function getEnumValueType(node: ts.EnumDeclaration): ts.SyntaxKind[] {
  return node.members.map((member) => {
    return member.initializer?.kind ?? ts.SyntaxKind.NumericLiteral;
  });
}

export function isEnumMembersAllNumber(node: ts.EnumDeclaration): boolean {
  return getEnumValueType(node).every(
    (type) => type === ts.SyntaxKind.NumericLiteral
  );
}
