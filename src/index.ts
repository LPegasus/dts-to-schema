import * as ts from "typescript";
import * as path from "path";
import { interfaceDeclarationAnalyze } from "./declaration-analyzer/interfaceDeclarationAnalyze";
import type { PrintSourceData } from "./printer/type";
import { enumDeclarationAnalyze } from "./declaration-analyzer/enumDeclarationAnalyze";
import { Printer } from "./printer/Printer";

const tsconfigFileName = path.resolve(
  __dirname,
  "../fixtures/legacy-dts/tsconfig.json"
);

const outputDir = path.resolve(process.cwd(), "_output_");

const r: any = ts.parseJsonText(
  tsconfigFileName,
  ts.sys.readFile(tsconfigFileName, "utf8")!
);
r.path = tsconfigFileName;
r.resolvedPath = r.path;

const config = ts.parseJsonSourceFileConfigFileContent(
  r,
  ts.sys,
  __dirname,
  undefined,
  tsconfigFileName
);

const program = ts.createProgram({
  rootNames: [...config.fileNames],
  options: {
    ...config.options,
  },
});

const typeChecker = program.getTypeChecker();

const allPrintSourceData = program
  .getSourceFiles()
  .filter((sourceFile) => {
    if (sourceFile.fileName.includes("node_modules")) {
      return false;
    }
    return true;
  })
  .reduce((acc, sourceFile) => {
    function inspect(node: ts.Node) {
      if (ts.isInterfaceDeclaration(node)) {
        const printSourceData = interfaceDeclarationAnalyze(
          typeChecker,
          node,
          outputDir,
          acc
        );
        acc.set(printSourceData.fullyQualifiedName, printSourceData);
      } else if (ts.isEnumDeclaration(node)) {
        const printSourceData = enumDeclarationAnalyze(
          typeChecker,
          node,
          outputDir,
          acc
        );
        acc.set(printSourceData.fullyQualifiedName, printSourceData);
      } else {
        ts.forEachChild(node, inspect);
      }
    }

    inspect(sourceFile);
    return acc;
  }, new Map<string, PrintSourceData>());

new Printer({}, Array.from(allPrintSourceData.values())).emit();
