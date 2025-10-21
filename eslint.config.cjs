const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const importPlugin = require('eslint-plugin-import');
const eslintJs = require('@eslint/js');
const globals = require('globals');

module.exports = [
  // Ignored paths (replaces .eslintignore)
  {
    ignores: ['node_modules', 'lib', 'examples', 'docs'],
  },

  // Base JavaScript recommended rules
  eslintJs.configs.recommended,

  // Project rules for JS/TS files
  {
    files: ['**/*.{ts,js}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.es2021,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
    },
    settings: {
      'import/extensions': ['.js'],
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error', 'time'] }],
      '@typescript-eslint/no-var-requires': 'off',
      // Use the TS version of this rule; base rule disabled for TS below
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'import/extensions': ['error', 'ignorePackages'],
    },
  },

  // TypeScript-specific overrides to avoid false positives from base rules
  {
    files: ['**/*.ts'],
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
  },

  // Test-specific tweaks
  {
    files: ['*.spec.ts', '*.test.ts', 'tests/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      'import/extensions': 'off',
    },
  },
];


