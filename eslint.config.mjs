import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [...nextCoreWebVitals, ...nextTypescript, {
  ignores: [
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.turbo/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'e2e/**',
    'tests/vitest-setup.d.ts',
    '.vercel/**',
  ],
}, {
  files: ['**/*.{ts,tsx}'],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-ignore': false,
        'ts-nocheck': false,
        'ts-check': false,
      },
    ],
  },
}, {
  files: ['**/*.{js,mjs,cjs}'],
  rules: {
    '@typescript-eslint/no-var-requires': 'off',
  },
}, {
  rules: {
    'no-console': [
      'warn',
      {
        allow: ['warn', 'error'],
      },
    ],
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'no-duplicate-imports': 'error',
    'no-unreachable': 'error',
    'no-constant-condition': 'error',
    'no-empty': ['error', { allowEmptyCatch: true }],
    'react/no-unescaped-entities': 'off',
    'react-hooks/set-state-in-effect': 'error',
  },
}];

export default eslintConfig;
