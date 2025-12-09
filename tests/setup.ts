// Bun test setup file for React 19.2 compatibility
import { GlobalRegistrator } from '@happy-dom/global-registrator';
import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll, beforeEach, mock } from 'bun:test';

// CRITICAL: Mock @/env BEFORE any other imports that depend on it
// This prevents the real env module from validating environment variables
// which would fail in CI without proper secrets set
mock.module('@/env', () => ({
  env: {
    NODE_ENV: 'test',
    CSRF_SECRET: 'test-csrf-secret-for-testing-only-32chars',
    KV_REST_API_URL: undefined,
    KV_REST_API_TOKEN: undefined,
    RESEND_API_KEY: 'test-resend-key',
    NEXT_PUBLIC_GA_MEASUREMENT_ID: 'test-ga-id',
    npm_package_version: '1.0.0',
    BASE_URL: 'http://localhost:3000',
    NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-anon-key',
  },
}));

// CRITICAL: Prevent Playwright globals from interfering with Bun test
// Playwright's @playwright/test package exports globals that conflict with bun:test
// We must ensure these are NOT loaded when running Bun tests
try {
  // Attempt to delete any Playwright globals if they exist
  if (typeof globalThis !== 'undefined') {
    // @ts-expect-error - Removing Playwright globals
    delete globalThis.test;
    // @ts-expect-error - Removing Playwright globals
    delete globalThis.expect;
  }
} catch {
  // Silently continue if globals don't exist
}

// Register happy-dom globals
GlobalRegistrator.register();

// Set IS_REACT_ACT_ENVIRONMENT for React 19 Testing Library compatibility
// @ts-expect-error - React 19 internal flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Mock fetch globally to prevent network requests during tests
const mockResponse: Response = {
  ok: true,
  status: 200,
  statusText: 'OK',
  headers: new Headers(),
  redirected: false,
  type: 'basic' as ResponseType,
  url: '',
  clone: mock(),
  json: () => Promise.resolve({}),
  text: () => Promise.resolve(''),
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  blob: () => Promise.resolve(new Blob()),
  formData: () => Promise.resolve(new FormData()),
} as unknown as Response;

(globalThis as { fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> }).fetch = mock(() => Promise.resolve(mockResponse));

beforeAll(() => {
  // Increase max listeners to prevent EventEmitter memory leak warnings
  process.setMaxListeners(20);
});

beforeEach(() => {
  // Clear all mocks before each test for isolation
  mock.restore();
});

afterEach(() => {
  // Clear all mocks after each test for isolation
  mock.restore();
});

afterAll(() => {
  // Cleanup and unregister happy-dom
  GlobalRegistrator.unregister();
});
