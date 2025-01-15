/**
 * Jest configuration for TypeScript ESM project
 * @type {import('@jest/types').Config.InitialOptions}
 */
const config = {
  // Use ts-jest
  preset: "ts-jest",
  testEnvironment: "node",

  // TypeScript configuration
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.test.json",
      },
    ],
  },

  // Module resolution
  moduleDirectories: ["node_modules", "src"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  // Test setup and patterns
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["**/__tests__/**/*.test.ts", "**/*.test.ts"],

  // Coverage configuration
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/build/",
    "/__tests__/",
    "/__mocks__/",
  ],

  // Mock behavior
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

export default config;
