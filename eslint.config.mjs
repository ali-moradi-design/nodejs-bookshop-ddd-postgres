import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/infrastructure/**', '@infrastructure/*', '@infrastructure/**'],
              message: 'Domain must not import infrastructure',
            },
            {
              group: ['**/interfaces/**', '@interfaces/*', '@interfaces/**'],
              message: 'Domain must not import interfaces',
            },
            {
              group: ['express', 'express/*', 'mongoose', 'mongoose/*', '@prisma/client', '@prisma/*'],
              message: 'Domain must not import express, mongoose, or Prisma',
            },
          ],
        },
      ],
    },
  },
);
