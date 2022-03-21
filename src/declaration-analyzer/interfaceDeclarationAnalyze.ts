import * as ts from "typescript";
import {
  DtsModuleType,
  PrintMemberType,
  PrintMemberTypeOfArray,
  PrintSourceData,
  PrintSourceInterfaceData,
} from "../printer/type";
import * as path from "path";
import { baseAnalyze } from "./baseAnalyze";

export function interfaceDeclarationAnalyze(
  typeChecker: ts.TypeChecker,
  node: ts.InterfaceDeclaration,
  outputDir: string,
  accumulator: Map<string, PrintSourceData>
): PrintSourceInterfaceData {
  const { symbol, fullyQualifiedName, lastDeclaration } = baseAnalyze(
    node,
    typeChecker
  );
  if (accumulator.has(fullyQualifiedName)) {
    return accumulator.get(fullyQualifiedName)! as any;
  }

  const splittedQualifiedNames = fullyQualifiedName.split(".");
  const emitDir = path.resolve(
    outputDir,
    ...splittedQualifiedNames.slice(0, -1)
  );

  const printSourceData: PrintSourceData = {
    kind: node.kind,
    fullyQualifiedName,
    outputDir: emitDir,
    relativeDefinitionFileName: path.relative(
      outputDir,
      lastDeclaration.getSourceFile().fileName
    ),
    moduleType: DtsModuleType.Legacy,
    props: {},
  };
  symbol.members?.forEach((member) => {
    const declarations = member.getDeclarations();
    // only choose the last declaration;
    const declaration = declarations![declarations!.length - 1];
    if (ts.isMethodSignature(declaration)) {
      // ignore method property
      return;
    }
    if (ts.isPropertySignature(declaration)) {
      if (!declaration.type) {
        // ignore property without type signature
        return;
      }
      if (!ts.isIdentifier(declaration.name)) {
        // ignore index signature key, eg: {[key: string]: Type}
        return;
      }
      const optional = Boolean(declaration.questionToken);
      const data = getPrintSourceDataFromTypeNode(
        declaration.type,
        typeChecker
      );
      if (!data) {
        return;
      }
      printSourceData.props[declaration.name.escapedText!] = {
        ...data,
        nullable: false,
        optional,
      } as PrintMemberType;
    }
    return;
  });
  accumulator.set(fullyQualifiedName, printSourceData);
  return printSourceData;
}

function getPrintSourceDataFromTypeNode(
  node: ts.TypeNode,
  typeChecker: ts.TypeChecker
): Omit<PrintMemberType, "optional" | "nullable"> | null {
  if (ts.isTypeReferenceNode(node)) {
    return getPrintSourceDataFromTypeReferenceNode(node, typeChecker);
  }
  if (ts.isArrayTypeNode(node)) {
    return getPrintSourceDataFromArrayTypeNode(node, typeChecker);
  }
  if (ts.isToken(node)) {
    return {
      v: node.getText(),
      isArray: false,
    };
  }
  return null;
}

function getPrintSourceDataFromTypeReferenceNode(
  node: ts.TypeReferenceNode,
  typeChecker: ts.TypeChecker
): Omit<PrintMemberType, "optional" | "nullable"> | null {
  if ((node.typeName as ts.Identifier).getText() === "Array") {
    const t = node.typeArguments?.[0];
    if (!t) {
      throw new Error(`Array should have type argument.`);
    }
    const inner = getPrintSourceDataFromTypeNode(t, typeChecker);

    if (!inner) {
      return inner;
    }

    if ((inner as PrintMemberTypeOfArray).latitude === undefined) {
      (inner as PrintMemberTypeOfArray).latitude = 0;
    }

    (inner as PrintMemberTypeOfArray).latitude++;
    return {
      ...inner,
      isArray: true,
    };
  } else {
    const nodeType = typeChecker.getTypeFromTypeNode(node);
    const symbol = nodeType.getSymbol();
    if (!symbol) {
      throw new Error(
        `Type reference should have symbol. Check type "${node.typeName.getText()}" whether declared.`
      );
    }
    return {
      v: {
        ref: typeChecker.getFullyQualifiedName(symbol),
      },
      isArray: false,
    };
  }
}

function getPrintSourceDataFromArrayTypeNode(
  node: ts.ArrayTypeNode,
  typeChecker: ts.TypeChecker
): Omit<PrintMemberType, "optional" | "nullable"> | null {
  const t = node.elementType;
  if (!t) {
    throw new Error(`Array should have type argument.`);
  }
  const inner = getPrintSourceDataFromTypeNode(t, typeChecker);

  if (!inner) {
    return inner;
  }

  if ((inner as any).latitude === undefined) {
    (inner as PrintMemberTypeOfArray).latitude = 0;
  }
  (inner as PrintMemberTypeOfArray).latitude++;

  return {
    ...inner,
    isArray: true,
  };
}
