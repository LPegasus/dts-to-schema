import * as path from "path";
import * as ts from "typescript";
import { normalizePath } from "../utils/normalizePath";
import { StringBuilder } from "./StringBuilder";
import {
  DtsModuleType,
  type PrintAdaptor,
  type PrintHost,
  type PrintSourceData,
  PrintMemberTypeOfArray,
  PrintSourceInterfaceData,
  PrintSourceEnumData,
} from "./type";

export class JtdPrintAdaptor implements PrintAdaptor {
  public async emitSchema(printSourceData: PrintSourceData): Promise<void> {
    const { relativeDefinitionFileName, fullyQualifiedName, moduleType, kind } =
      printSourceData;

    const sb = new StringBuilder();
    const outputFileName =
      this.printHost.getOutputAbsoluteFileName(printSourceData);

    /** 引入定义的类型 */
    if (moduleType === DtsModuleType.Legacy) {
      sb.appendLine(
        `/// <reference path="${normalizePath(relativeDefinitionFileName!)}" />`
      );
    } else if (moduleType === DtsModuleType.Module) {
      sb.appendLine(
        `import { ${fullyQualifiedName} } from "${relativeDefinitionFileName}";`
      );
    }

    sb.appendLine();

    if (kind !== ts.SyntaxKind.EnumDeclaration) {
      /** 引入 ajv */
      sb.appendLine(
        `import { JTDSchemaType, SomeJTDSchemaType } from "ajv/dist/core";\n`
      );
    }

    /** export schema */
    sb.appendLine(this._printSchema(printSourceData));

    /** export reference name */
    sb.appendLine(`export const name = "${fullyQualifiedName}";`);

    /** export type */
    sb.appendLine(`export type _T = ${fullyQualifiedName};`);

    return this.printHost
      .writeFileAsync(outputFileName, sb.toString())
      .then(() => {
        this._allOutputSchemaMap.set(outputFileName, printSourceData);
      });
  }

  public async emitEntry(entryFileName: string): Promise<void> {
    const sb = new StringBuilder();
    const definitionsSb = new StringBuilder();
    const schemaCollectionsSb = new StringBuilder();

    sb.appendLine(
      'import type { JTDSchemaType, SomeJTDSchemaType } from "ajv/dist/jtd";'
    );
    definitionsSb.appendLine("const definitions = {");
    schemaCollectionsSb.appendLine("export const SchemaCollections = {");

    this._allOutputSchemaMap.forEach((printSourceData, outputFileName) => {
      const relativeImportPath = normalizePath(
        path.relative(path.dirname(entryFileName), outputFileName)
      ).replace(/(\.d)?\.ts$/, "");

      const variableName =
        this.printHost.normalizeVariableNameFromQualifiedName(
          printSourceData.fullyQualifiedName
        );
      sb.appendLine(
        `import * as ${variableName} from "${relativeImportPath}";`
      );

      definitionsSb.appendLine(
        `[${variableName}.name]: ${variableName}.schema,`
      );

      schemaCollectionsSb.appendLine(
        `[${variableName}.name]: { ref: ${variableName}.name, definitions } as SomeJTDSchemaType as JTDSchemaType<${variableName}._T>,`
      );
    });

    definitionsSb.appendLine("};");
    schemaCollectionsSb.appendLine("};");

    const code = [
      sb.toString(),
      definitionsSb.toString(),
      schemaCollectionsSb.toString(),
    ].join("\n");

    return this.printHost.writeFileAsync(entryFileName, code);
  }

  constructor(protected printHost: PrintHost) {}

  private _allOutputSchemaMap: Map<string, PrintSourceData> = new Map();

  private _printSchema(printSourceData: PrintSourceData): string {
    const sb = new StringBuilder();

    if (printSourceData.kind === ts.SyntaxKind.InterfaceDeclaration) {
      const code = this._appendInterfaceSchemaCode(printSourceData);
      sb.appendLine(code);
    } else if (printSourceData.kind === ts.SyntaxKind.EnumDeclaration) {
      const code = this._appendEnumSchemaCode(printSourceData);
      sb.appendLine(code);
    }

    return sb.toString();
  }

  private _appendInterfaceSchemaCode(
    printSourceData: PrintSourceInterfaceData
  ) {
    const sb = new StringBuilder();
    const keys = Object.keys(printSourceData.props);
    const properties: any = {};
    let optionalProperties: any = undefined;

    keys.forEach((k) => {
      const { isArray, v, optional, nullable } = printSourceData.props[k];
      const data: any = {};
      const typeDescriptor = typeof v === "string" ? getJtdType(v) : v;
      if (isArray) {
        const arrayProp: PrintMemberTypeOfArray = printSourceData.props[
          k
        ] as any;
        let cur = data;
        for (let i = 0; i < arrayProp.latitude - 1; i++) {
          cur = cur.elements = {};
        }
        cur.elements = { type: typeDescriptor };
        if (v === "any") {
          // DO NOTHING
        } else if (typeof v === "string") {
          cur.elements = { type: typeDescriptor };
        } else {
          cur.elements = { ref: v.ref };
        }
      } else {
        if (v === "any") {
          // DO NOTHING
        } else if (typeof v === "string") {
          data.type = typeDescriptor;
        } else {
          data.ref = v.ref;
        }
      }
      if (nullable) {
        data.nullable = true;
      }
      if (optional) {
        if (optionalProperties === null) {
          optionalProperties = {};
        }
        optionalProperties[k] = data;
      } else {
        properties[k] = data;
      }
    });
    sb.append(`export const schema = `);
    sb.appendLine(
      JSON.stringify({ properties, optionalProperties }, undefined, 2) +
        ` as SomeJTDSchemaType as JTDSchemaType<${printSourceData.fullyQualifiedName}>;`
    );
    return sb.toString();
  }

  /**
   * 打印 enum 取值含义
   *
   * @param printSourceData - PrintSourceEnumData
   */
  private _appendEnumSchemaCode(printSourceData: PrintSourceEnumData): string {
    const sb = new StringBuilder();
    if (printSourceData.members.length > 0) {
      sb.appendLine(`/**`);
      for (const member of printSourceData.members) {
        sb.appendLine(` * - ${member.value}: ${member.name}`);
      }
      sb.appendLine(` */`);
    }
    sb.appendLine('export const schema = { type: "int32" };');
    return sb.toString();
  }
}

function getJtdType(typeIdentifier: string) {
  switch (typeIdentifier) {
    case "string":
      return "string";
    case "number":
      return "float64";
    case "boolean":
      return "boolean";
    case "any":
      return {};
  }

  throw new Error('Unknown primitive type "' + typeIdentifier + '"');
}
