/// <reference types="@testing-library/jest-dom" />

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'bun:test' {
  interface Matchers<T = unknown>
    extends TestingLibraryMatchers<typeof expect.stringContaining, T> {
    _jestDom?: never;
  }
  interface AsymmetricMatchers extends TestingLibraryMatchers<string, unknown> {
    _jestDom?: never;
  }
}
