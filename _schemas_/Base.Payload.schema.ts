/// <reference path="../fixtures/legacy-dts/Base.d.ts" />

import { JTDSchemaType, SomeJTDSchemaType } from 'ajv/dist/core';

export const schema = {
  properties: {
    data: {},
    ip: {
      type: 'string',
    },
    regions: {
      elements: {
        type: 'string',
      },
    },
  },
} as SomeJTDSchemaType as JTDSchemaType<Base.Payload>;

export const name = 'Base.Payload';
export type _T = Base.Payload;
