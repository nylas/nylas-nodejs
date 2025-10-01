module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  // Test built files, not source files
  moduleNameMapping: {
    '^nylas$': '<rootDir>/lib/esm/nylas.js',
    '^nylas/(.*)$': '<rootDir>/lib/esm/$1.js'
  },
  testMatch: ['<rootDir>/tests/**/*.spec.ts'],
  collectCoverageFrom: [
    'lib/**/*.js',
    '!lib/**/*.d.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setupCloudflareWorkers.ts'],
  testTimeout: 30000,
  // Mock Cloudflare Workers environment
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },
  // Transform ignore patterns for Cloudflare Workers compatibility
  transformIgnorePatterns: [
    'node_modules/(?!(node-fetch|mime-db|mime-types)/)'
  ]
};