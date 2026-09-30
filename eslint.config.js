import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['node_modules/', 'public/resources/js/api/', 'public/resources/css/api/'],
  },
  js.configs.recommended,
  {
    rules: {
      'no-unused-vars': ['error', { args: 'none' }],
    },
  },
  {
    // Server code (Node, ES modules). Shared state lives on `global` (see app/app.js).
    files: ['app/**/*.js', '*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
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
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ...globals.jquery,
        io: 'readonly',
        Noty: 'readonly',
        App: 'writable',
      },
    },
  },
  {
    files: ['public/resources/js/objects/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
    },
  },
  prettier,
];
