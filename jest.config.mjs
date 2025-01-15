/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts", ".mts"],
  moduleNameMapper: {
    "(.+)\\.js": "$1",
    "^@modelcontextprotocol/sdk$":
      "<rootDir>/src/__mocks__/@modelcontextprotocol/sdk.ts",
    "^@modelcontextprotocol/sdk/server/stdio$":
      "<rootDir>/src/__mocks__/@modelcontextprotocol/sdk.ts",
    "^@modelcontextprotocol/sdk/server$":
      "<rootDir>/src/__mocks__/@modelcontextprotocol/sdk.ts",
    "^node:process$": "<rootDir>/src/__mocks__/node_process.ts",
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        useESM: true,
      },
    ],
    "^.+\\.js$": [
      "babel-jest",
      {
        presets: [["@babel/preset-env", { targets: { node: "current" } }]],
      },
    ],
  },
  transformIgnorePatterns: [],
  testMatch: ["**/__tests__/**/*.test.ts"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.test.ts",
    "!src/**/*.d.ts",
    "!src/types/**/*",
  ],
};
