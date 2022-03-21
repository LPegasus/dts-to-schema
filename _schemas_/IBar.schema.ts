/// <reference path="../fixtures/legacy-dts/Bar.d.ts" />

import { JTDSchemaType, SomeJTDSchemaType } from 'ajv/dist/core';

export const schema = {
  properties: {
    payload: {
      ref: 'Base.Payload',
    },
    status: {
      ref: 'BarStatusEnum',
    },
  },
} as SomeJTDSchemaType as JTDSchemaType<IBar>;

export const name = 'IBar';
export type _T = IBar;
