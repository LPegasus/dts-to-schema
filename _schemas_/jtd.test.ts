import { SchemaCollections } from ".";
import Ajv from "ajv/dist/jtd";

describe("jtd test", () => {
  const ajv = new Ajv();
  test("schema test with type", () => {
    const schema = SchemaCollections["Base.Payload"];
    const baseValidator = ajv.compile(schema);

    const invalidData: unknown = {};

    expect(baseValidator(invalidData)).toEqual(false);
    expect(baseValidator.errors).toMatchSnapshot();

    const validData: unknown = {
      data: {},
      ip: "1.1.1.1",
      regions: ["123"],
    };

    expect(baseValidator(validData)).toEqual(true);

    if (baseValidator(validData)) {
      // type guard test, if it is valid, it will be `Base.Payload`
      validData.data; // <- never type should convert to `Base.Payload`
    }
  });

  test("serializer and deserializer", () => {
    const schema = SchemaCollections["Base.Payload2"];
    const basePayload2Validator = ajv.compile(schema);
    const basePayload2Serializer = ajv.compileSerializer(schema);
    const basePayload2Parser = ajv.compileParser(schema);
    const validData: Base.Payload2 = {
      _: [],
      payloads: [
        {
          data: {},
          ip: "1",
          regions: ["1"],
        },
      ],
    };

    expect(basePayload2Validator(validData)).toBeTruthy();

    const serializedValidData = basePayload2Serializer(validData);
    expect(serializedValidData).toMatchSnapshot();
    expect(basePayload2Parser(serializedValidData)).toEqual(validData);
  });
});
