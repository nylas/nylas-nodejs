const config = {
  preset: 'ts-jest/presets/js-with-ts',
  transform: {
    '^.+\\\\.{ts|tsx}?$': [
      'ts-jest',
      {
        tsConfig: 'tsconfig.test.json',
      },
    ],
  },
  coverageThreshold: {
    global: {
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

module.exports = config;
