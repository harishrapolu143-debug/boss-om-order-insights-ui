import type { Config } from 'jest'
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Playwright specs under tests/e2e are run by `npm run test:e2e`, not by Jest.
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/tests/e2e/'],
}

export default createJestConfig(config)