import { enumDeclarationAnalyze } from "./enumDeclarationAnalyze";
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

compilerHost.fileExists = () => true;
compilerHost.readFile = (fileName: string) => {
  const testSnaps: Record<string, string> = {
    "Foo.d.ts": `declare namespace Foo {
    enum FooEnum {
      A = "A",
      B = 0,
      C
    };
  }`,
    "Bar.d.ts": `enum BarEnum {
    A = 0x01,
    B = 0x03,
    C = 0x05
  };`,
  };
  return testSnaps[fileName];
};

describe("enum declaration analyze", () => {
  let prog: ts.Program;
  let typeChecker: ts.TypeChecker;

  beforeEach(() => {
    prog = ts.createProgram({
      rootNames: ["Foo.d.ts", "Bar.d.ts"],
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

  test("Foo.d.ts", () => {
    const sourceFile = prog.getSourceFile("Foo.d.ts")!;
    const enumNodeList = filterNodeForSourceFile(sourceFile, (n) =>
      ts.isEnumDeclaration(n)
    );
    expect(enumNodeList.length).toEqual(1);

    const cache = new Map<string, PrintSourceData>();
    const printSourceData = enumDeclarationAnalyze(
      typeChecker,
      enumNodeList[0] as ts.EnumDeclaration,
      "",
      cache
    );

    expect(printSourceData.fullyQualifiedName).toEqual("Foo.FooEnum");
    expect(printSourceData.members).toMatchSnapshot();
  });

  test("Bar.d.ts", () => {
    const sourceFile = prog.getSourceFile("Bar.d.ts")!;
    const enumNodeList = filterNodeForSourceFile(sourceFile, (n) =>
      ts.isEnumDeclaration(n)
    );
    expect(enumNodeList.length).toEqual(1);

    const cache = new Map<string, PrintSourceData>();
    const printSourceData = enumDeclarationAnalyze(
      typeChecker,
      enumNodeList[0] as ts.EnumDeclaration,
      "",
      cache
    );

    expect(printSourceData.members).toMatchSnapshot();
  });
});
