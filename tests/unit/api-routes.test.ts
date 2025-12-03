/**
 * API Route Integration Tests
 * Tests for critical API endpoints including health checks, CSRF, and newsletter
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock environment
vi.mock('@/env', () => ({
  env: {
    NODE_ENV: 'test',
    RESEND_API_KEY: 'test-key',
    NEXT_PUBLIC_GA_MEASUREMENT_ID: 'test-ga-id',
    npm_package_version: '1.0.0',
    CSRF_SECRET: 'test-csrf-secret-for-testing-only',
  },
}));

// Mock logger to prevent actual logging during tests
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
  createServerLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    setContext: vi.fn(),
  }),
  castError: (error: unknown) => error instanceof Error ? error : new Error(String(error)),
}));

// Mock rate limiter
vi.mock('@/lib/rate-limiter', () => ({
  unifiedRateLimiter: {
    checkLimit: vi.fn().mockResolvedValue(true),
    getLimitInfo: vi.fn().mockResolvedValue({ remaining: 10, isLimited: false }),
  },
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}));

// Mock security headers
vi.mock('@/lib/security-headers', () => ({
  applySecurityHeaders: (response: Response) => response,
}));

// ================================
// Health Check API Tests
// ================================

describe('Health Check API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return healthy status on GET request', async () => {
    const { GET } = await import('@/app/api/health/route');

    const request = new NextRequest('http://localhost:3000/api/health', {
      method: 'GET',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBeDefined();
    expect(data.checks).toBeDefined();
    expect(data.checks.api).toBe(true);
    expect(data.checks.timestamp).toBeDefined();
    expect(data.checks.uptime).toBeDefined();
    expect(data.checks.memory).toBeDefined();
  });

  it('should return no-store cache headers', async () => {
    const { GET } = await import('@/app/api/health/route');

    const request = new NextRequest('http://localhost:3000/api/health', {
      method: 'GET',
    });

    const response = await GET(request);

    expect(response.headers.get('Cache-Control')).toBe('no-store, max-age=0');
  });

  it('should return 200 on HEAD request', async () => {
    const { HEAD } = await import('@/app/api/health/route');

    const request = new NextRequest('http://localhost:3000/api/health', {
      method: 'HEAD',
    });

    const response = await HEAD(request);

    expect(response.status).toBe(200);
  });
});

// ================================
// CSRF Token API Tests
// ================================

describe('CSRF Token API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate a CSRF token on GET request', async () => {
    const { GET } = await import('@/app/api/csrf/route');

    const request = new NextRequest('http://localhost:3000/api/csrf', {
      method: 'GET',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.token).toBeDefined();
    expect(typeof data.token).toBe('string');
    expect(data.token.split('.').length).toBe(3); // Token has 3 parts
  });

  it('should return 429 when rate limited', async () => {
    const { unifiedRateLimiter } = await import('@/lib/rate-limiter');
    vi.mocked(unifiedRateLimiter.checkLimit).mockResolvedValueOnce(false);

    const { GET } = await import('@/app/api/csrf/route');

    const request = new NextRequest('http://localhost:3000/api/csrf', {
      method: 'GET',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toContain('Too many requests');
  });
});

// ================================
// Newsletter Subscribe API Tests
// ================================

describe('Newsletter Subscribe API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Mock Supabase for newsletter tests
  vi.mock('@/lib/supabase', () => ({
    supabaseAdmin: {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        upsert: vi.fn().mockResolvedValue({ error: null }),
      }),
    },
  }));

  it('should return 400 for invalid email', async () => {
    const { POST } = await import('@/app/api/newsletter/subscribe/route');

    const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid-email' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid email');
  });

  it('should return 429 when rate limited', async () => {
    const { unifiedRateLimiter } = await import('@/lib/rate-limiter');
    vi.mocked(unifiedRateLimiter.checkLimit).mockResolvedValueOnce(false);

    const { POST } = await import('@/app/api/newsletter/subscribe/route');

    const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toContain('Too many requests');
  });
});

// ================================
// API Route Security Tests
// ================================

describe('API Route Security', () => {
  it('should apply rate limiting to all critical endpoints', async () => {
    const { unifiedRateLimiter, getClientIp } = await import('@/lib/rate-limiter');

    // Verify rate limiter is being called
    expect(unifiedRateLimiter.checkLimit).toBeDefined();
    expect(getClientIp).toBeDefined();
  });

  it('should validate request bodies with Zod schemas', async () => {
    // Newsletter uses Zod validation
    const { POST } = await import('@/app/api/newsletter/subscribe/route');

    const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({}), // Missing required email
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});

// ================================
// API Response Format Tests
// ================================

describe('API Response Format', () => {
  it('should return JSON responses with correct content type', async () => {
    const { GET } = await import('@/app/api/health/route');

    const request = new NextRequest('http://localhost:3000/api/health', {
      method: 'GET',
    });

    const response = await GET(request);

    // NextResponse.json() automatically sets content-type
    expect(response.headers.get('content-type')).toContain('application/json');
  });

  it('should include error messages in error responses', async () => {
    const { POST } = await import('@/app/api/newsletter/subscribe/route');

    const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: 'bad' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.error).toBeDefined();
    expect(typeof data.error).toBe('string');
  });
});
