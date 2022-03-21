import type { JTDSchemaType } from "ajv/dist/jtd";

export interface MyData {
  name: {
    left: string;
    right: string;
  };
  children?: Array<MyData>;
}

const schema: JTDSchemaType<MyData, { treeNode: MyData }> = {
  ref: "treeNode",
  definitions: {
    treeNode: {
      properties: {
        name: {
          properties: { left: { type: "string" }, right: { type: "string" } },
        },
      },
      optionalProperties: {
        children: {
          elements: {
            ref: "treeNode",
          },
        },
      },
    },
  },
};

export default schema;
