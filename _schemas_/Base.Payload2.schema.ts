/// <reference path="../fixtures/legacy-dts/Base.d.ts" />

import { JTDSchemaType, SomeJTDSchemaType } from 'ajv/dist/core';

export const schema = {
  properties: {
    payloads: {
      elements: {
        ref: 'Base.Payload',
      },
    },
    _: {
      elements: {
        ref: 'Base.Payload',
      },
    },
  },
} as SomeJTDSchemaType as JTDSchemaType<Base.Payload2>;

export const name = 'Base.Payload2';
export type _T = Base.Payload2;
