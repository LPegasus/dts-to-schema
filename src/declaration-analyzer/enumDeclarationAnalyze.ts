import * as ts from "typescript";
import {
  DtsModuleType,
  PrintSourceData,
  PrintSourceEnumData,
} from "../printer/type";
import { baseAnalyze } from "./baseAnalyze";
import * as path from "path";

export function enumDeclarationAnalyze(
  typeChecker: ts.TypeChecker,
  node: ts.EnumDeclaration,
  outputDir: string,
  accumulator: Map<string, PrintSourceData>
): PrintSourceEnumData {
  const { fullyQualifiedName, lastDeclaration } = baseAnalyze(
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

  let incrementalToken = 0;

  const printSourceData: PrintSourceData = {
    kind: node.kind,
    fullyQualifiedName,
    outputDir: emitDir,
    relativeDefinitionFileName: path.relative(
      outputDir,
      lastDeclaration.getSourceFile().fileName
    ),
    moduleType: DtsModuleType.Legacy,
    members: node.members.map((member) => {
      const { initializer, name } = member;
      let value: any;
      if (initializer === undefined) {
        value = incrementalToken++;
      } else if (ts.isStringLiteral(initializer)) {
        value = initializer.getText();
      } else if (ts.isNumericLiteral(initializer)) {
        value = Number(initializer.getText());
        incrementalToken = value + 1;
      }
      return {
        name: (name as ts.Identifier).getText() as string,
        value,
      };
    }),
  };

  return printSourceData;
}
