/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

const path = require("path");

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/_schemas_/tsconfig.json",
    },
  },
  rootDir: path.resolve(__dirname, ".."),
  preset: "ts-jest",
  testMatch: ["<rootDir>/_schemas_/**/*.test.ts"],
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
};
