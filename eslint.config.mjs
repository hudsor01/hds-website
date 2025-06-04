// eslint.config.mjs
import js from '@eslint/js'
import nextPlugin from '@next/eslint-plugin-next'
import tseslint from 'typescript-eslint'
import { FlatCompat } from '@eslint/eslintrc'
import path from 'path'
import { fileURLToPath } from 'url'

// Create a compat instance
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

export default tseslint.config(
  js.configs.recommended,
  ...compat.extends('next/core-web-vitals'),
  {
    ignores: [
      '.next/**/*',
      'out/**/*',
      'dist/**/*',
      'build/**/*',
      'node_modules/**/*',
      'supabase/functions/**/*',
      '*.config.js',
      '*.config.mjs',
      'postcss.config.js',
    ],
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    plugins: {
      '@next/next': nextPlugin,
    },
    languageOptions: {
      globals: {
        React: 'readonly',
        JSX: 'readonly',
      },
    },
    rules: {
      // Code style matching your codebase
      'no-unused-vars': ['warn', { 
        args: 'after-used',
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      semi: ['error', 'never'],
      'comma-dangle': ['error', 'always-multiline'],
      'arrow-body-style': ['error', 'as-needed'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      quotes: ['error', 'single', { avoidEscape: true }],

      // React specific
      'react/prop-types': 'off', // Using TypeScript
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+

      // Next.js specific
      '@next/next/no-html-link-for-pages': 'off',
      '@next/next/no-img-element': 'warn',

      // Turn off some strict rules that would break existing code
      'no-prototype-builtins': 'warn',
      'no-useless-escape': 'warn',
    },
  },
  // TypeScript specific configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // Use TypeScript-specific rule for better accuracy
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', {
        args: 'after-used',
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      
      // Allow any type where needed (for logger and legacy code)
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // Allow empty object types for flexibility
      '@typescript-eslint/no-empty-object-type': 'off',
      
      // Disable some strict rules that conflict with current codebase
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  // JavaScript files - disable type checking
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  // Test files configuration
  {
    files: ['**/*.test.js', '**/*.test.ts', '**/*.test.tsx', '**/__tests__/**/*.js', '**/__tests__/**/*.ts', '**/__tests__/**/*.tsx'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        test: 'readonly',
        React: 'readonly',
        JSX: 'readonly',
      },
    },
  },
)