import type { JTDSchemaType, SomeJTDSchemaType } from 'ajv/dist/jtd';
import * as Base_Payload from './Base.Payload.schema';
import * as BarStatusEnum from './BarStatusEnum.schema';
import * as Base_Payload2 from './Base.Payload2.schema';
import * as Foo_StatusEnum from './Foo.StatusEnum.schema';
import * as IBar from './IBar.schema';
import * as Foo_IFoo from './Foo.IFoo.schema';

const definitions = {
  [Base_Payload.name]: Base_Payload.schema,
  [BarStatusEnum.name]: BarStatusEnum.schema,
  [Base_Payload2.name]: Base_Payload2.schema,
  [Foo_StatusEnum.name]: Foo_StatusEnum.schema,
  [IBar.name]: IBar.schema,
  [Foo_IFoo.name]: Foo_IFoo.schema,
};

export const SchemaCollections = {
  [Base_Payload.name]: { ref: Base_Payload.name, definitions } as SomeJTDSchemaType as JTDSchemaType<Base_Payload._T>,
  [BarStatusEnum.name]: {
    ref: BarStatusEnum.name,
    definitions,
  } as SomeJTDSchemaType as JTDSchemaType<BarStatusEnum._T>,
  [Base_Payload2.name]: {
    ref: Base_Payload2.name,
    definitions,
  } as SomeJTDSchemaType as JTDSchemaType<Base_Payload2._T>,
  [Foo_StatusEnum.name]: {
    ref: Foo_StatusEnum.name,
    definitions,
  } as SomeJTDSchemaType as JTDSchemaType<Foo_StatusEnum._T>,
  [IBar.name]: { ref: IBar.name, definitions } as SomeJTDSchemaType as JTDSchemaType<IBar._T>,
  [Foo_IFoo.name]: { ref: Foo_IFoo.name, definitions } as SomeJTDSchemaType as JTDSchemaType<Foo_IFoo._T>,
};
