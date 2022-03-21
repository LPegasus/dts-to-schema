import type { JTDSchemaType, SomeJTDSchemaType } from "ajv/dist/jtd";
import * as Base from "./Base.schema";
import * as Foo from "./Foo.schema";
import * as FooStatusEnum from "./Foo_StatusEnum.schema";

const definitions = {
  [Base.name]: Base.schema,
  [Foo.name]: Foo.schema,
  [FooStatusEnum.name]: FooStatusEnum.schema,
};

export const SchemaCollections = {
  [Base.name]: {
    ref: Base.name,
    definitions,
  } as SomeJTDSchemaType as JTDSchemaType<Base._T>,
  [Foo.name]: {
    ref: Foo.name,
    definitions,
  } as SomeJTDSchemaType as JTDSchemaType<Foo._T>,
};
