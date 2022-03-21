import type * as ts from "typescript";

export interface PrintAdaptor {
  emitSchema(printSourceData: PrintSourceData): Promise<void>;
  emitEntry(
    outputFileName: string,
    printSourceDataCollection: PrintSourceData[]
  ): Promise<void>;
}

export enum DtsModuleType {
  Legacy = "legacy",
  Module = "module",
}

export type PrintSourceData = PrintSourceEnumData | PrintSourceInterfaceData;

export interface PrintSourceDataBase {
  /** 输出目录，输出目录通过 namespace + outDir 决定 */
  outputDir: string;
  moduleType: DtsModuleType;
  fullyQualifiedName: string;
  /** TS 定义所在文件名，生成的 schema 文件需要类型定义 */
  relativeDefinitionFileName?: string;
  /** interface 所有成员，string 表示是原始类型，PrintTypeReference 表示用 ref */
  kind: ts.SyntaxKind;
}

export interface PrintSourceEnumData extends PrintSourceDataBase {
  kind: ts.SyntaxKind.EnumDeclaration;
  members: Array<{ name: string; value: string | number }>;
}

export interface PrintSourceInterfaceData extends PrintSourceDataBase {
  kind: ts.SyntaxKind.InterfaceDeclaration;
  props: Record<string, PrintMemberType>;
}

export interface BasePrintMemberType {
  v: string | PrintTypeReference | "any";
  optional: boolean;
  nullable: boolean;
}

export interface PrintMemberTypeOfArray extends BasePrintMemberType {
  isArray: true;
  latitude: number;
}

export interface PrintMemberTypeOfObject extends BasePrintMemberType {
  isArray: false;
}

export type PrintMemberType = PrintMemberTypeOfArray | PrintMemberTypeOfObject;

export interface PrintTypeReference {
  ref: string;
}

export enum PrinterEmitSchemaType {
  JTD = "jtd",
  JSON = "json",
}

export interface PrinterConfiguration {
  /** output directory */
  outDir?: string;
  emitSchemaType?: PrinterEmitSchemaType;
  prettierConfig?: import("prettier").Options;
}

export interface PrintHost {
  writeFileAsync(fileName: string, content: string): Promise<void>;
  getOutputAbsoluteFileName(printSourceData: PrintSourceData): string;
  normalizeVariableNameFromQualifiedName(fullyQualifiedName: string): string;
}
