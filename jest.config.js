const config = {
  preset: 'ts-jest/presets/js-with-ts',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  moduleNameMapper: {
    '^[../]+src/([^/]+)$': '<rootDir>/src/$1.ts',
    '^[../]+src/resources/([^/]+)$': '<rootDir>/src/resources/$1.ts',
    '^[../]+src/models/([^/]+)$': '<rootDir>/src/models/$1.ts',
    // Handle .js imports in TypeScript files for Jest
    '^(.+)\\.js$': '$1',
  },
  // Handle ESM modules like node-fetch v3
  extensionsToTreatAsEsm: ['.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill)/)',
  ],
  // Set up jest-fetch-mock
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  coverageThreshold: {
    global: {
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  clearMocks: true,
  collectCoverage: true,
  coverageReporters: ['text', 'cobertura'],
};

module.exports = config;
