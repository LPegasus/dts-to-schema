/// <reference path="../../legacy-dts/Foo.d.ts" />

import { JTDSchemaType, SomeJTDSchemaType } from "ajv/dist/core";

export const schema = {
  properties: {
    payload: { ref: "Base.Payload" },
    status: { ref: "Foo.StatusEnum" },
  },
} as SomeJTDSchemaType as JTDSchemaType<Foo.IFoo>;

export const name = "Foo.IFoo";
export type _T = Foo.IFoo;
