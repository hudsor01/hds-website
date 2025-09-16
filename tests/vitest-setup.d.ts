import '@testing-library/jest-dom'

declare module 'vitest' {
  interface Assertion<T = any>
    extends jest.Matchers<void, T>,
      import('@testing-library/jest-dom').TestingLibraryMatchers<T, void> {}
}