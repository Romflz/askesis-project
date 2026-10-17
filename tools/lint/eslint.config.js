// ESLint for the whole workspace: correctness and React hooks rules. Formatting
// is Prettier's job, so eslint-config-prettier turns off every stylistic rule.
import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/.output/**',
      '**/.nitro/**',
      '**/.tanstack/**',
      '**/dist/**',
      'apps/web/src/routeTree.gen.ts',
      'packages/db/drizzle/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      eqeqeq: ['error', 'smart'],
      'prefer-const': 'error',
    },
  },
  {
    // The service worker runs in its own global scope.
    files: ['apps/web/public/sw.js'],
    languageOptions: { globals: { ...globals.serviceworker } },
  },
  {
    // Command-line scripts report to the terminal.
    files: ['**/scripts/**', 'packages/db/src/seed.ts', 'packages/db/src/migrate.ts'],
    rules: { 'no-console': 'off' },
  },
  prettier,
)
