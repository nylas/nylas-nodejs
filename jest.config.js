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
    '^[../]+src/([^/]+)$': '<rootDir>/lib/esm/$1.js',
    '^[../]+src/resources/([^/]+)$': '<rootDir>/lib/esm/resources/$1.js',
    '^[../]+src/models/([^/]+)$': '<rootDir>/lib/esm/models/$1.js',
  },
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
