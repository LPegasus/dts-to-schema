import Ajv from "ajv/dist/jtd";
import * as Benchmark from "benchmark";

interface MyGoods {
  id: string;
  name: string;
  price: number;
  createdAt: number;
  updatedAt: number;
  author: string;
  coupons: string[];
  stocks: number;
  tags: string[];
  category: string[];
  description: string;
  images: string[];
  comments: string[];
  likes: string[];
  isPublished: boolean;
  isDeleted: boolean;
}

interface MyGoodsList {
  cursor: string;
  size: number;
  data: MyGoods[];
}

export const goodsList: MyGoodsList = { cursor: "xxxxx", size: 100, data: [] };

for (let i = 0; i < goodsList.size; i++) {
  goodsList.data.push({
    id: i.toString(),
    name: i.toString() + "name",
    price: 100 + i,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    author: "",
    coupons: ["coupon1", "coupon2"],
    stocks: 100 + i,
    tags: ["tag1", "tag2", "tag3", "tag4"],
    category: ["category1", "category2"],
    description: "description",
    images: ["image1", "image2"],
    comments: ["comment1", "comment2"],
    likes: ["like1", "like2"],
    isPublished: true,
    isDeleted: false,
  });
}

const myGoodsSchema = {
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    price: { type: "uint32" },
    createdAt: { type: "float64" },
    updatedAt: { type: "float64" },
    author: { type: "string" },
    coupons: { elements: { type: "string" } },
    stocks: { type: "int32" },
    tags: { elements: { enum: ["tag1", "tag2", "tag3", "tag4"] } },
    category: { elements: { enum: ["category1", "category2"] } },
    description: { type: "string" },
    images: { elements: { type: "string" } },
    comments: { elements: { type: "string" } },
    likes: { elements: { type: "string" } },
    isPublished: { type: "boolean" },
    isDeleted: { type: "boolean" },
  },
};
const schema = {
  properties: {
    data: { elements: { ref: "MyGoods" } },
    cursor: { type: "string" },
    size: { type: "int32" },
  },
  definitions: {
    MyGoods: myGoodsSchema,
  },
};

const ajv = new Ajv();
const serializer = ajv.compileSerializer(schema);
const parser = ajv.compileParser(schema);
const validator = ajv.compile(schema);

if (!validator(goodsList)) {
  throw new Error("妈耶");
}

const raw = JSON.stringify(goodsList);

const suite1 = new Benchmark.Suite("serialize");

suite1
  .add("serialize using JTD", () => {
    serializer(goodsList);
  })
  .add("serialize using JSON.stringify", () => {
    JSON.stringify(goodsList);
  })
  .on("cycle", function (event) {
    console.log(String(event.target));
  });

const suite2 = new Benchmark.Suite("parse");

suite2
  .add("parse using JTD", () => {
    parser(raw);
  })
  .add("parse using JSON.parse", () => {
    JSON.parse(raw);
  })
  .on("cycle", function (event) {
    console.log(String(event.target));
  });

suite1.run({
  async: true,
});

suite2.run({
  async: true,
});

/**
 * Benchmark Results
 *
 * FOR 100 ITEMS:
 * ```txt
 * serialize using JTD x 5,089 ops/sec ±0.21% (97 runs sampled)
 * serialize using JSON.stringify x 4,701 ops/sec ±0.20% (95 runs sampled)
 * parse using JTD x 265,277 ops/sec ±0.19% (99 runs sampled)
 * parse using JSON.parse x 4,274 ops/sec ±0.20% (94 runs sampled)
 * ```
 *
 * FOR 10 ITEMS:
 * ```txt
 * serialize using JTD x 51,965 ops/sec ±0.33% (84 runs sampled)
 * serialize using JSON.stringify x 43,952 ops/sec ±0.33% (90 runs sampled)
 * parse using JTD x 262,176 ops/sec ±0.33% (96 runs sampled)
 * parse using JSON.parse x 41,452 ops/sec ±0.21% (93 runs sampled)
 * ```
 */
