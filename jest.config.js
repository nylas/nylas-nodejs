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
    '^../src/([^/]+)$': '../lib/esm/$1.js',
    '^../src/resources/([^/]+)$': '../lib/esm/resources/$1.js',
    '^../src/models/([^/]+)$': '../lib/esm/models/$1.js',
  },
  coverageThreshold: {
    global: {
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  clearMocks: true,
};

module.exports = config;
