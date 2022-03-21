/// <reference path="../../legacy-dts/Base.d.ts" />

import { JTDSchemaType, SomeJTDSchemaType } from "ajv/dist/core";

export const schema = {
  properties: {
    data: {},
    ip: { type: "string" },
  },
} as SomeJTDSchemaType as JTDSchemaType<_T>;

export const name = "Base.Payload";
export type _T = Base.Payload;
