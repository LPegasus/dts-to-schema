/// <reference path="../../legacy-dts/Foo.d.ts" />

import { JTDSchemaType, SomeJTDSchemaType } from "ajv/dist/core";

export const schema = {
  type: "float64",
} as SomeJTDSchemaType as JTDSchemaType<Foo.StatusEnum>;

export const name = "Foo.StatusEnum";
export type _T = Foo.StatusEnum;
