// Bun test setup file for React 19.2 compatibility
import { GlobalRegistrator } from '@happy-dom/global-registrator';
import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll, beforeEach, mock } from 'bun:test';

// CRITICAL: Mock @/env BEFORE any other imports that depend on it
// This prevents the real env module from validating environment variables
// which would fail in CI without proper secrets set
// Store the mock function so we can re-apply it after mock.restore()
function setupEnvMock() {
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
}

// Apply env mock immediately on setup
setupEnvMock();

// Setup logger mock to ensure all methods are available
function setupLoggerMock() {
  const mockLoggerInstance = {
    debug: mock(),
    info: mock(),
    warn: mock(),
    error: mock(),
    setContext: mock(),
  };

  // Real implementation of generateFingerprint for tests that need it
  function generateFingerprint(errorType: string, message: string, stack?: string): string {
    const firstFrame = stack?.split('\n')[1]?.trim() || 'unknown';
    const input = `${errorType}:${message}:${firstFrame}`;
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).padStart(8, '0');
  }

  mock.module('@/lib/logger', () => ({
    logger: mockLoggerInstance,
    createServerLogger: () => mockLoggerInstance,
    generateFingerprint,
    castError: (error: unknown) => ({
      name: error instanceof Error ? error.name : 'Error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      cause: undefined,
    }),
    handleError: mock(() => ({ name: 'Error', message: 'Test error' })),
    safeExecute: mock(async (fn: () => unknown) => {
      try {
        const data = await fn();
        return { success: true, data, error: null };
      } catch {
        return { success: false, data: null, error: { name: 'Error', message: 'Test error' } };
      }
    }),
    safeExecuteSync: mock((fn: () => unknown) => {
      try {
        const data = fn();
        return { success: true, data, error: null };
      } catch {
        return { success: false, data: null, error: { name: 'Error', message: 'Test error' } };
      }
    }),
  }));
}

setupLoggerMock();

// CRITICAL: Prevent Playwright globals from interfering with Bun test
// Playwright's @playwright/test package exports globals that conflict with bun:test
// We must ensure these are NOT loaded when running Bun tests
try {
  // Attempt to delete any Playwright globals if they exist
  if (typeof globalThis !== 'undefined') {
    delete (globalThis as { test?: unknown }).test;
    delete (globalThis as { expect?: unknown }).expect;
  }
} catch {
  // Silently continue if globals don't exist
}

// Register happy-dom globals
GlobalRegistrator.register();

// Set IS_REACT_ACT_ENVIRONMENT for React 19 Testing Library compatibility
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

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
  // Re-apply critical mocks that must persist across tests
  setupEnvMock();
  setupLoggerMock();
});

afterEach(() => {
  // Clear all mocks after each test for isolation
  // Note: env mock will be re-applied in beforeEach
  mock.restore();
});

afterAll(() => {
  // Cleanup and unregister happy-dom
  GlobalRegistrator.unregister();
});
