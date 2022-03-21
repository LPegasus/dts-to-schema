import * as path from "path";
import * as fs from "fs-extra";
import { JtdPrintAdaptor } from "./JtdPrintAdaptor";
import {
  type PrinterConfiguration,
  PrinterEmitSchemaType,
  type PrintSourceData,
} from "./type";
import * as prettier from "prettier";

const _defaultConfiguration: Readonly<Required<PrinterConfiguration>> = {
  outDir: path.resolve(process.cwd(), "./_schemas_"),
  emitSchemaType: PrinterEmitSchemaType.JTD,
  prettierConfig: {
    endOfLine: "lf",
    singleQuote: true,
    trailingComma: "es5",
    printWidth: 120,
    parser: "typescript",
    tabWidth: 2,
    useTabs: false,
  },
};

export class Printer {
  public async emit(): Promise<void> {
    const { emitSchemaType } = this._config;
    if (emitSchemaType === PrinterEmitSchemaType.JTD) {
      await this._emitJtdSchema();
    } else if (emitSchemaType === PrinterEmitSchemaType.JSON) {
      await this._emitJsonSchema();
    }
  }

  constructor(
    config: PrinterConfiguration,
    protected printSourceDataList: PrintSourceData[]
  ) {
    this._config = { ..._defaultConfiguration, ...config };
    this._jtdPrintAdaptor = new JtdPrintAdaptor({
      writeFileAsync: async (fileName: string, content: string) => {
        const formattedContent = prettier.format(
          content,
          this._config.prettierConfig
        );

        if (fs.existsSync(fileName)) {
          await fs.remove(fileName);
        }
        await fs.ensureFile(fileName);
        await fs.promises.writeFile(fileName, formattedContent);
      },
      getOutputAbsoluteFileName: (printSourceData: PrintSourceData) => {
        return path.resolve(
          this._config.outDir,
          `${printSourceData.fullyQualifiedName}.schema.ts`
        );
      },
      normalizeVariableNameFromQualifiedName: (fullyQualifiedName: string) => {
        return fullyQualifiedName.replace(/\./g, "_");
      },
    });
  }

  protected async _emitJsonSchema(): Promise<void> {
    throw new Error("JsonSchema is not implemented yet.");
  }

  protected async _emitJtdSchema(): Promise<void> {
    const tasks = this.printSourceDataList.map((d) => {
      return this._jtdPrintAdaptor.emitSchema(d);
    });

    await Promise.all(tasks);

    await this._jtdPrintAdaptor.emitEntry(
      path.resolve(this._config.outDir, "index.ts")
    );
  }

  protected _config: Required<PrinterConfiguration>;

  protected _jtdPrintAdaptor: JtdPrintAdaptor;
}
