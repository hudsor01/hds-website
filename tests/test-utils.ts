/**
 * Test Utilities
 * Shared mocking and setup utilities for test isolation
 */

import { cleanup } from '@testing-library/react';
import { mock } from 'bun:test';

/**
 * Create isolated mock instances for common dependencies
 * These should be set up in beforeEach hooks, not at module level
 */
export function createMockLogger() {
  return {
    info: mock(),
    warn: mock(),
    error: mock(),
    debug: mock(),
    setContext: mock(),
  };
}

export function createMockRateLimiter() {
  return {
    checkLimit: mock().mockResolvedValue(true),
    getLimitInfo: mock().mockResolvedValue({ remaining: 10, isLimited: false }),
  };
}

export function createMockResend() {
  return mock().mockImplementation(() => ({
    emails: {
      send: mock().mockResolvedValue({ data: { id: 'test-email-id' } }),
    },
  }));
}

/**
 * Setup common mocks for API route tests
 * Call this in beforeEach hooks
 */
export function setupApiMocks() {
  const mockLogger = createMockLogger();
  const mockRateLimiter = createMockRateLimiter();

  // Set environment variables for Supabase
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_PUBLISHABLE_KEY = 'test-service-role-key';

  mock.module('@/env', () => ({
    env: {
      NODE_ENV: 'test',
      RESEND_API_KEY: 'test-key',
      NEXT_PUBLIC_GA_MEASUREMENT_ID: 'test-ga-id',
      npm_package_version: '1.0.0',
      CSRF_SECRET: 'test-csrf-secret-for-testing-only',
    },
  }));

  mock.module('@/lib/logger', () => ({
    logger: mockLogger,
    createServerLogger: () => mockLogger,
    castError: (error: unknown) => error instanceof Error ? error : new Error(String(error)),
  }));

  mock.module('@/lib/rate-limiter', () => ({
    unifiedRateLimiter: mockRateLimiter,
    getClientIp: mock().mockReturnValue('127.0.0.1'),
  }));

  mock.module('@/lib/security-headers', () => ({
    applySecurityHeaders: (response: Response) => response,
  }));

  // Mock Supabase client for all API tests
  mock.module('@supabase/supabase-js', () => ({
    createClient: mock(() => ({
      from: mock(() => ({
        select: mock(() => ({
          eq: mock(() => ({
            maybeSingle: mock().mockResolvedValue({ data: null, error: null }),
            single: mock().mockResolvedValue({ data: null, error: null }),
          })),
        })),
        insert: mock().mockResolvedValue({ error: null }),
        upsert: mock().mockResolvedValue({ error: null }),
        update: mock().mockResolvedValue({ error: null }),
        delete: mock().mockResolvedValue({ error: null }),
      })),
    })),
  }));

  // Mock Resend client
  mock.module('@/lib/resend-client', () => ({
    isResendConfigured: mock().mockReturnValue(true),
    getResendClient: mock(() => ({
      emails: {
        send: mock().mockResolvedValue({ data: { id: 'test-email-id' } }),
      },
    })),
  }));

  return { mockLogger, mockRateLimiter };
}

/**
 * Setup common mocks for contact form tests
 * Call this in beforeEach hooks
 */
export function setupContactFormMocks() {
  const mockLogger = createMockLogger();
  const mockRateLimiter = createMockRateLimiter();
  const mockResend = createMockResend();

  mock.module('@/env', () => ({
    env: {
      CSRF_SECRET: 'test-csrf-secret-for-testing-only',
      RESEND_API_KEY: 'test-resend-key',
    },
  }));

  mock.module('@/lib/logger', () => ({
    createServerLogger: () => mockLogger,
    castError: (error: unknown) => error instanceof Error ? error : new Error(String(error)),
    logger: mockLogger,
  }));

  mock.module('@/lib/rate-limiter', () => ({
    unifiedRateLimiter: mockRateLimiter,
  }));

  mock.module('@/lib/metrics', () => ({
    recordContactFormSubmission: mock(),
  }));

  mock.module('@/lib/notifications', () => ({
    notifyHighValueLead: mock().mockResolvedValue(undefined),
  }));

  mock.module('@/lib/scheduled-emails', () => ({
    scheduleEmailSequence: mock().mockResolvedValue(undefined),
  }));

  mock.module('resend', () => ({
    Resend: mockResend,
  }));

  mock.module('next/headers', () => ({
    headers: mock().mockResolvedValue({
      get: mock().mockReturnValue('127.0.0.1'),
    }),
  }));

  return { mockLogger, mockRateLimiter, mockResend };
}

/**
 * Setup common mocks for component tests with Next.js
 * Call this in beforeEach hooks
 */
/**
 * Setup common mocks for component tests with Next.js
 * Call this in beforeEach hooks
 */
export function setupNextMocks() {
  // Don't mock next/link - use the real implementation
  // React 19 changed element internals, making element mocks fragile
  // Real next/link works perfectly in tests and uses native history API
  // See: https://github.com/vercel/next.js/discussions/48110

  mock.module('next/navigation', () => ({
    useRouter: () => ({
      push: mock(),
      replace: mock(),
      prefetch: mock(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
  }));

  mock.module('next/dynamic', () => ({
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    default: <P = {}>(
      _loader: (() => Promise<React.ComponentType<P>>) | Promise<React.ComponentType<P>>
    ): React.ComponentType<P> => {
      // For testing, just return a mock component that renders null
      // This is sufficient for component tests that use dynamic imports
      return (() => null) as React.ComponentType<P>;
    },
  }));
}

/**
 * Cleanup all mocks and React Testing Library components after each test
 * Call this in afterEach hooks for tests that use React components
 */
export function cleanupMocks() {
  cleanup();
  mock.restore();
}
