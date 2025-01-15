/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts", ".mts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.test.json",
        useESM: true,
        diagnostics: {
          ignoreCodes: [2571, 6133, 6196, 2322, 2345],
        },
      },
    ],
  },
  testMatch: ["**/__tests__/**/*.test.ts"],
  globals: {
    "ts-jest": {
      isolatedModules: true,
      useESM: true,
    },
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/**/__mocks__/**",
  ],
  coverageReporters: ["lcov", "text", "text-summary"],
  coverageDirectory: "coverage",
};
