module.exports = {
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'eslint-plugin-import'],
  extends: [
    'eslint:recommended',
    'prettier',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'no-console': ['error', { allow: ['warn', 'error', 'time'] }],
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/no-explicit-any': 0,
    camelcase: ['error', { properties: 'never', ignoreDestructuring: true }],
    // TypeScript handles undefined variable checks; core no-undef flags TS globals.
    'no-undef': 'off',
    'import/extensions': ['error', 'ignorePackages'],
  },
  settings: {
    'import/extensions': ['.js'],
  },
  overrides: [
    {
      files: ['*.spec.ts', '*.test.ts', 'tests/**/*.ts'],
      rules: {
        'import/extensions': 'off',
      },
    },
  ],
};
