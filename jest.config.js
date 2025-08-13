module.exports = {
  projects: [
    // Backend services unit tests
    {
      displayName: 'auth-service',
      testMatch: ['<rootDir>/services/auth-service/**/*.{test,spec}.{js,ts}'],
      preset: '@shelf/jest-mongodb',
      testEnvironment: 'node',
      transform: {
        '^.+\\.(t|j)sx?$': 'ts-jest',
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      collectCoverageFrom: [
        'services/auth-service/src/**/*.{ts,js}',
        '!**/*.d.ts',
        '!**/node_modules/**',
      ],
    },
    {
      displayName: 'pricing-service',
      testMatch: ['<rootDir>/services/pricing-service/**/*.{test,spec}.{js,ts}'],
      preset: '@shelf/jest-mongodb',
      testEnvironment: 'node',
      transform: {
        '^.+\\.(t|j)sx?$': 'ts-jest',
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      collectCoverageFrom: [
        'services/pricing-service/src/**/*.{ts,js}',
        '!**/*.d.ts',
        '!**/node_modules/**',
      ],
    },
    {
      displayName: 'transaction-service',
      testMatch: ['<rootDir>/services/transaction-service/**/*.{test,spec}.{js,ts}'],
      preset: '@shelf/jest-mongodb',
      testEnvironment: 'node',
      transform: {
        '^.+\\.(t|j)sx?$': 'ts-jest',
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      collectCoverageFrom: [
        'services/transaction-service/src/**/*.{ts,js}',
        '!**/*.d.ts',
        '!**/node_modules/**',
      ],
    },
    {
      displayName: 'configuration-service',
      testMatch: ['<rootDir>/services/configuration-service/**/*.{test,spec}.{js,ts}'],
      preset: '@shelf/jest-mongodb',
      testEnvironment: 'node',
      transform: {
        '^.+\\.(t|j)sx?$': 'ts-jest',
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      collectCoverageFrom: [
        'services/configuration-service/src/**/*.{ts,js}',
        '!**/*.d.ts',
        '!**/node_modules/**',
      ],
    },
    {
      displayName: 'uppf-service',
      testMatch: ['<rootDir>/services/uppf-service/**/*.{test,spec}.{js,ts}'],
      preset: '@shelf/jest-mongodb',
      testEnvironment: 'node',
      transform: {
        '^.+\\.(t|j)sx?$': 'ts-jest',
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      collectCoverageFrom: [
        'services/uppf-service/src/**/*.{ts,js}',
        '!**/*.d.ts',
        '!**/node_modules/**',
      ],
    },
    // All other services
    {
      displayName: 'all-services',
      testMatch: ['<rootDir>/services/**/*.{test,spec}.{js,ts}'],
      preset: '@shelf/jest-mongodb',
      testEnvironment: 'node',
      transform: {
        '^.+\\.(t|j)sx?$': 'ts-jest',
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      collectCoverageFrom: [
        'services/**/src/**/*.{ts,js}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/dist/**',
      ],
    },
    // Frontend dashboard tests
    {
      displayName: 'dashboard-frontend',
      testMatch: ['<rootDir>/apps/dashboard/**/*.{test,spec}.{js,ts,tsx}'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/apps/dashboard/tests/jest.setup.js'],
      transform: {
        '^.+\\.(t|j)sx?$': 'ts-jest',
      },
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/apps/dashboard/src/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      },
      collectCoverageFrom: [
        'apps/dashboard/src/**/*.{ts,tsx,js,jsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
      ],
    },
    // Database and shared packages
    {
      displayName: 'database-package',
      testMatch: ['<rootDir>/packages/database/**/*.{test,spec}.{js,ts}'],
      testEnvironment: 'node',
      transform: {
        '^.+\\.(t|j)sx?$': 'ts-jest',
      },
      collectCoverageFrom: [
        'packages/database/src/**/*.{ts,js}',
        '!**/*.d.ts',
        '!**/node_modules/**',
      ],
    },
    // Integration tests
    {
      displayName: 'integration-tests',
      testMatch: ['<rootDir>/tests/integration/**/*.{test,spec}.{js,ts}'],
      preset: '@shelf/jest-mongodb',
      testEnvironment: 'node',
      transform: {
        '^.+\\.(t|j)sx?$': 'ts-jest',
      },
      testTimeout: 30000, // Longer timeout for integration tests
    },
  ],
  // Global configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  globalSetup: '<rootDir>/tests/setup/global-setup.js',
  globalTeardown: '<rootDir>/tests/setup/global-teardown.js',
  // Test environment variables
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js'],
  // Module path mapping
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
  // Verbose output for CI
  verbose: process.env.CI === 'true',
  // Fail fast in CI environment
  bail: process.env.CI === 'true' ? 1 : 0,
};