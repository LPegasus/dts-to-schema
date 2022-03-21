import Ajv from "ajv/dist/jtd";
import { SchemaCollections } from "./legacy";

const ajv = new Ajv();

ajv.addKeyword({
  keyword: "enums",
  schemaType: ["number", "string"],
  compile(schema) {
    const arr = schema.split("|").map(Number);
    return (data) => {
      return arr.includes(data);
    };
  },
  error: {
    message: (params) => {
      return `should be one of "${params.schema}"`;
    },
    params: (p) => {
      return p.parentSchema;
    },
  },
  metaSchema: {
    type: "string",
  },
});

const validateBase = ajv.compile(SchemaCollections["Base.Payload"]);
const validateFoo = ajv.compile(SchemaCollections["Foo.IFoo"]);

const baseData: unknown = {
  data: 123,
  ip: "321",
};

if (validateBase(baseData)) {
  console.log(baseData);
  baseData.ip = "321";
} else {
  console.log(validateBase.errors);
}

const fooData: unknown = {
  payload: baseData,
  status: null,
};

if (validateFoo(fooData)) {
  console.log(fooData);
  // @ts-expect-error
  fooData.payload = "321";
} else {
  console.log(validateFoo.errors);
}
