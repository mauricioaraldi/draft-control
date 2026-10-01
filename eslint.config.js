import { defineConfig } from 'eslint/config';
import globals from 'globals';
import xo from 'eslint-config-xo';

export default defineConfig([
  {
    ignores: ['node_modules/'],
  },
  // Strict base rules (includes unicorn, import-x, n and jsdoc). Formatting is left to Prettier.
  ...xo({ space: true, prettier: 'compat' }),
  {
    files: ['**/*.js'],
    rules: {
      'no-unused-vars': ['error', { args: 'none' }],
      'jsdoc/require-returns': 'error',
      // Project conventions that take precedence over XO
      'jsdoc/require-asterisk-prefix': ['error', 'always'],
      'unicorn/filename-case': ['error', { cases: { camelCase: true, pascalCase: true } }],
      'unicorn/prefer-global-this': 'off',
      'unicorn/no-global-object-property-assignment': 'off',
      'import-x/no-anonymous-default-export': 'off',
      'unicorn/no-anonymous-default-export': 'off',
      'unicorn/no-for-each': 'off',
    },
  },
  {
    // Server code (Node, ES modules). Shared state lives on `global` (see app/app.js).
    files: ['app/**/*.js', '*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        app: 'writable',
        io: 'writable',
        Drafts: 'writable',
        CurrentDraft: 'writable',
        Configs: 'writable',
      },
    },
  },
  {
    // Browser scripts loaded through <script> tags in public/*.html
    files: ['public/resources/js/custom/**/*.js'],
    languageOptions: {
      sourceType: 'script',
      globals: {
        ...globals.browser,
        io: 'readonly',
        Noty: 'readonly',
        App: 'writable',
      },
    },
  },
  {
    files: ['public/resources/js/objects/**/*.js'],
    languageOptions: {
      globals: globals.browser,
    },
  },
]);
