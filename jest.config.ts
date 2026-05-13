import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: [
    "**/__tests__/unit/**/*.test.ts",
    "**/__tests__/unit/**/*.test.tsx",
  ],
  collectCoverageFrom: [
    "lib/stores/**/*.ts",
    "hooks/**/*.ts",
    "!**/*.d.ts",
  ],
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/__tests__/e2e/",
  ],
};

export default createJestConfig(config);
