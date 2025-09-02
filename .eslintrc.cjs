module.exports = {
  root: true,
  ignorePatterns: ['node_modules', 'lib', 'examples', 'docs'],
  env: {
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  settings: {
    'import/extensions': ['.js'],
  },
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    'no-console': ['error', { allow: ['warn', 'error', 'time'] }],
    'import/extensions': ['error', 'ignorePackages'],
  },
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      rules: {
        'no-undef': 'off',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      files: ['*.spec.ts', '*.test.ts', 'tests/**/*.ts'],
      env: {
        jest: true,
      },
      rules: {
        'import/extensions': 'off',
      },
    },
  ],
};


