import { JtdPrintAdaptor } from "./JtdPrintAdaptor";
import { pascalCase } from "change-case";
import { DtsModuleType } from "./type";
import * as ts from "typescript";

function getPrinter(writeFileAsync: any) {
  const printer = new JtdPrintAdaptor({
    writeFileAsync,
    getOutputAbsoluteFileName: (printSourceData) => {
      return printSourceData.fullyQualifiedName + ".schema.ts";
    },
    normalizeVariableNameFromQualifiedName: (qualifiedName) => {
      return pascalCase(qualifiedName);
    },
  });
  return printer;
}

const _arrayBase = {
  fullyQualifiedName: "ArrayBase",
  kind: ts.SyntaxKind.InterfaceDeclaration,
  moduleType: DtsModuleType.Legacy,
  outputDir: "",
  relativeDefinitionFileName: "../dts/ArrayBase.d.ts",
  props: {
    arr1: {
      isArray: true,
      nullable: false,
      optional: false,
      latitude: 1,
      v: "string",
    },
    arr2: {
      isArray: true,
      nullable: false,
      optional: true,
      v: "number",
      latitude: 3,
    },
    arr3: {
      isArray: true,
      nullable: true,
      optional: false,
      v: { ref: "Some.Other.Type" },
      latitude: 2,
    },
  },
} as const;

const _base = {
  fullyQualifiedName: "Base",
  kind: ts.SyntaxKind.InterfaceDeclaration,
  moduleType: DtsModuleType.Legacy,
  outputDir: "",
  relativeDefinitionFileName: "../dts/Base.d.ts",
  props: {
    foo: {
      isArray: false,
      nullable: false,
      optional: false,
      v: "string",
    },
    optionalField: {
      isArray: false,
      nullable: false,
      optional: true,
      v: "number",
    },
  },
} as const;

describe("JtdPrintAdaptor", () => {
  test("emitSchema base", async () => {
    const writeFileAsync = jest.fn((arg0: string, arg1: string) =>
      Promise.resolve()
    );
    const printer = getPrinter(writeFileAsync);

    await printer.emitSchema(_base);

    // @ts-ignore
    expect(writeFileAsync.mock.calls[0][1]).toMatchSnapshot();
  });

  test("emitSchema with array", async () => {
    const writeFileAsync = jest.fn((arg0: string, arg1: string) =>
      Promise.resolve()
    );
    const printer = getPrinter(writeFileAsync);

    await printer.emitSchema({
      fullyQualifiedName: "ArrayBase",
      kind: ts.SyntaxKind.InterfaceDeclaration,
      moduleType: DtsModuleType.Legacy,
      outputDir: "",
      relativeDefinitionFileName: "../dts/ArrayBase.d.ts",
      props: {
        arr1: {
          isArray: true,
          nullable: false,
          optional: false,
          latitude: 1,
          v: "string",
        },
        arr2: {
          isArray: true,
          nullable: false,
          optional: true,
          v: "number",
          latitude: 3,
        },
        arr3: {
          isArray: true,
          nullable: true,
          optional: false,
          v: { ref: "Some.Other.Type" },
          latitude: 2,
        },
      },
    });

    expect(writeFileAsync.mock.calls[0][1]).toMatchSnapshot();
  });

  test("emitEntry", async () => {
    const writeFileAsync = jest.fn((arg0: string, arg1: string) =>
      Promise.resolve()
    );
    const printer = getPrinter(writeFileAsync);
    const p2 = printer.emitSchema(_arrayBase);
    const p1 = printer.emitSchema(_base);
    await Promise.all([p1, p2]);

    await printer.emitEntry("/entry.ts");

    expect(writeFileAsync).toHaveBeenCalledTimes(3);

    expect(writeFileAsync.mock.calls[2][1]).toMatchSnapshot();
  });
});
