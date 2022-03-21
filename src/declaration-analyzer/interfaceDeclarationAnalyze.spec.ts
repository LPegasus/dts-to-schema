import { interfaceDeclarationAnalyze } from "./interfaceDeclarationAnalyze";
import * as ts from "typescript";
import { filterNodeForSourceFile } from "../utils/ast";
import type { PrintSourceData } from "../printer/type";

const compilerOptions = {
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  target: ts.ScriptTarget.ESNext,
  types: [],
};
const compilerHost = ts.createCompilerHost(compilerOptions, true);

const testSnaps: Record<string, string> = {
  "base.d.ts": `interface Base {
    foo: string;
    optionalField?: number;
  };`,
  "array.d.ts": `interface TestArray {
    arr1: string[];
    arr2: string[][];
    arr3: Array<number>;
    arr4: Array<Array<number>>;
    arr5: Array<number[]>;
  };`,
};

compilerHost.fileExists = () => true;
compilerHost.readFile = (fileName: string) => {
  return testSnaps[fileName];
};

describe("interface declaration analyze", () => {
  let prog: ts.Program;
  let typeChecker: ts.TypeChecker;

  beforeEach(() => {
    prog = ts.createProgram({
      rootNames: ["base.d.ts", "array.d.ts"],
      options: {
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        target: ts.ScriptTarget.ESNext,
        types: [],
      },
      host: compilerHost,
    });

    typeChecker = prog.getTypeChecker();
  });

  test("base interface", () => {
    const sourceFile = prog.getSourceFile("base.d.ts")!;
    const interfaceNodeList = filterNodeForSourceFile(sourceFile, (n) =>
      ts.isInterfaceDeclaration(n)
    );
    expect(interfaceNodeList.length).toEqual(1);

    const node = interfaceNodeList[0];
    const cache = new Map<string, PrintSourceData>();
    const printSourceData = interfaceDeclarationAnalyze(
      typeChecker,
      node as ts.InterfaceDeclaration,
      "",
      cache
    );

    expect(printSourceData).toMatchObject({
      fullyQualifiedName: "Base",
      kind: ts.SyntaxKind.InterfaceDeclaration,
    });

    expect(printSourceData.props).toMatchSnapshot("base");

    expect(cache.size).toEqual(1);
  });

  test("array.d.ts", () => {
    const sourceFile = prog.getSourceFile("array.d.ts")!;
    const node = filterNodeForSourceFile(sourceFile, (n) => {
      return ts.isInterfaceDeclaration(n);
    })[0] as ts.InterfaceDeclaration;
    const cache = new Map<string, PrintSourceData>();
    const printSourceData = interfaceDeclarationAnalyze(
      typeChecker,
      node,
      "",
      cache
    );

    expect(printSourceData).toMatchObject({
      fullyQualifiedName: "TestArray",
    });

    expect(printSourceData.props).toMatchSnapshot("array");

    expect(cache.size).toEqual(1);
  });
});
