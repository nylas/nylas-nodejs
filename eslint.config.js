const js = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const prettier = require('eslint-config-prettier');
const importPlugin = require('eslint-plugin-import');
const globals = require('globals');

module.exports = [
  { ignores: ['node_modules/**', 'lib/**', 'examples/**', 'docs/**'] },
  {
    files: ['**/*.{js,ts}'],
    linterOptions: { reportUnusedDisableDirectives: 'off' },
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: { ...globals.es2021, ...globals.node, ...globals.jest },
    },
    plugins: { '@typescript-eslint': tsPlugin, import: importPlugin },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs['eslint-recommended'].overrides[0].rules,
      ...tsPlugin.configs.recommended.rules,
      ...prettier.rules,
      'no-console': ['error', { allow: ['warn', 'error', 'time'] }],
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      camelcase: ['error', { properties: 'never', ignoreDestructuring: true }],
      // TypeScript handles undefined variable checks; core no-undef flags TS globals.
      'no-undef': 'off',
      'import/extensions': ['error', 'ignorePackages'],
    },
    settings: { 'import/extensions': ['.js'] },
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts', 'tests/**/*.ts'],
    rules: { 'import/extensions': 'off' },
  },
];
