import js from '@eslint/js';
import globals from 'globals';

/**
 * Minimal flat ESLint config for the React SPA. Extend with the React/hooks
 * plugins as your team prefers; kept lean here to avoid heavyweight deps.
 */
export default [
  { ignores: ['dist', 'coverage', 'node_modules'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];
