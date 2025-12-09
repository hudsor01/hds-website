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
    destroy: mock(),
  };
}

/**
 * Create a mock UnifiedRateLimiter class for testing
 * This mock implements actual rate limiting logic to support tests that verify limits
 */
export function createMockUnifiedRateLimiterClass() {
  return class MockUnifiedRateLimiter {
    store = new Map<string, { count: number; resetTime: number }>();
    cleanupInterval: NodeJS.Timeout | null = null;

    private buildKey(identifier: string, limitType: keyof typeof MOCK_RATE_LIMIT_CONFIGS): string {
      return `${limitType}:${identifier}`;
    }

    async checkLimit(identifier: string, limitType: keyof typeof MOCK_RATE_LIMIT_CONFIGS = 'default'): Promise<boolean> {
      const config = MOCK_RATE_LIMIT_CONFIGS[limitType];
      const key = this.buildKey(identifier, limitType);
      const now = Date.now();
      const entry = this.store.get(key);

      if (!entry || now > entry.resetTime) {
        // Create new entry or reset expired one
        this.store.set(key, {
          count: 1,
          resetTime: now + config.windowMs,
        });
        return true;
      }

      if (entry.count >= config.maxRequests) {
        return false;
      }

      // Increment count
      entry.count++;
      this.store.set(key, entry);
      return true;
    }

    async getLimitInfo(identifier: string, limitType: keyof typeof MOCK_RATE_LIMIT_CONFIGS = 'default'): Promise<{
      remaining: number;
      resetTime: number;
      isLimited: boolean;
    }> {
      const config = MOCK_RATE_LIMIT_CONFIGS[limitType];
      const key = this.buildKey(identifier, limitType);
      const now = Date.now();
      const entry = this.store.get(key);

      if (!entry || now > entry.resetTime) {
        return {
          remaining: config.maxRequests,
          resetTime: now + config.windowMs,
          isLimited: false,
        };
      }

      const remaining = Math.max(0, config.maxRequests - entry.count);
      return {
        remaining,
        resetTime: entry.resetTime,
        isLimited: entry.count >= config.maxRequests,
      };
    }

    destroy(): void {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }
      this.store.clear();
    }
  };
}

/**
 * Rate limit configurations matching the real module
 */
export const MOCK_RATE_LIMIT_CONFIGS = {
  default: { windowMs: 60 * 1000, maxRequests: 100 },
  api: { windowMs: 60 * 1000, maxRequests: 60 },
  contactForm: { windowMs: 15 * 60 * 1000, maxRequests: 3 },
  contactFormApi: { windowMs: 60 * 1000, maxRequests: 5 },
  newsletter: { windowMs: 60 * 1000, maxRequests: 3 },
  readOnlyApi: { windowMs: 60 * 1000, maxRequests: 100 },
} as const;

/**
 * Create a mock getClientIp function that implements real IP parsing logic
 * This mirrors the real implementation to support tests that verify IP extraction
 */
export function createMockGetClientIp() {
  return (request: { headers: { get: (name: string) => string | null } }): string => {
    const xff = request.headers.get('x-forwarded-for');
    if (xff) {
      const ip = xff.split(',')[0]?.trim();
      if (ip) {
        return ip;
      }
    }

    const realIp = request.headers.get('x-real-ip');
    if (realIp?.trim()) {
      return realIp.trim();
    }

    return '127.0.0.1';
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

  // Complete rate-limiter mock with all exports
  // This ensures the mock is complete if other tests try to import the module
  mock.module('@/lib/rate-limiter', () => ({
    UnifiedRateLimiter: createMockUnifiedRateLimiterClass(),
    unifiedRateLimiter: mockRateLimiter,
    getUnifiedRateLimiter: () => mockRateLimiter,
    getClientIp: createMockGetClientIp(),
    RATE_LIMIT_CONFIGS: MOCK_RATE_LIMIT_CONFIGS,
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

  // Complete rate-limiter mock with all exports
  mock.module('@/lib/rate-limiter', () => ({
    UnifiedRateLimiter: createMockUnifiedRateLimiterClass(),
    unifiedRateLimiter: mockRateLimiter,
    getUnifiedRateLimiter: () => mockRateLimiter,
    getClientIp: createMockGetClientIp(),
    RATE_LIMIT_CONFIGS: MOCK_RATE_LIMIT_CONFIGS,
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
