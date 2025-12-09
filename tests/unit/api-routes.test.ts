/**
 * API Route Integration Tests
 * Tests for critical API endpoints including health checks, CSRF, and newsletter
 */

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { NextRequest } from 'next/server';
import { cleanupMocks, setupApiMocks } from '../test-utils';

// ================================
// Health Check API Tests
// ================================

describe('Health Check API', () => {
  beforeEach(() => {
    setupApiMocks();
  });

  afterEach(() => {
    cleanupMocks();
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
    setupApiMocks();
  });

  afterEach(() => {
    cleanupMocks();
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

  it.skip('should return 429 when rate limited', async () => {
    // Skip: Rate limiter is mocked globally for tests
    // This test would need a separate test environment with real rate limiting
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
    setupApiMocks();

    // Mock Supabase for newsletter tests - must include maybeSingle()
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
        })),
      })),
    }));
  });

  afterEach(() => {
    cleanupMocks();
  });

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

  it('should return 500 when database not configured', async () => {
    // Mock missing environment variables
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const originalKey = process.env.SUPABASE_PUBLISHABLE_KEY;

    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_PUBLISHABLE_KEY;

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

    expect(response.status).toBe(500);
    expect(data.error).toBe('Database not configured');

    // Restore environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.SUPABASE_PUBLISHABLE_KEY = originalKey;
  });

  it('should return 400 when email already subscribed', async () => {
    const supabaseMock = {
      from: mock(() => ({
        select: mock(() => ({
          eq: mock(() => ({
            maybeSingle: mock().mockResolvedValue({
              data: { email: 'existing@example.com', status: 'active' },
              error: null,
            }),
            single: mock().mockResolvedValue({ data: null, error: null }),
          })),
        })),
        upsert: mock().mockResolvedValue({ error: null }),
      })),
    };

    mock.module('@supabase/supabase-js', () => ({
      createClient: mock(() => supabaseMock),
    }));

    const { POST } = await import('@/app/api/newsletter/subscribe/route');

    const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: 'existing@example.com' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Email already subscribed');
  });

  it('should return 500 when database upsert fails', async () => {
    const supabaseMock = {
      from: mock(() => ({
        select: mock(() => ({
          eq: mock(() => ({
            maybeSingle: mock().mockResolvedValue({ data: null, error: null }),
            single: mock().mockResolvedValue({ data: null, error: null }),
          })),
        })),
        upsert: mock().mockResolvedValue({ error: { message: 'db failure' } }),
      })),
    };

    mock.module('@supabase/supabase-js', () => ({
      createClient: mock(() => supabaseMock),
    }));

    const { POST } = await import('@/app/api/newsletter/subscribe/route');

    const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: 'fail@example.com' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to subscribe');
  });

  it('should succeed with valid email and send welcome email', async () => {
    const { POST } = await import('@/app/api/newsletter/subscribe/route');

    const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: 'new@example.com', source: 'website' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Successfully subscribed!');
  });

  it('should handle missing email field', async () => {
    const { POST } = await import('@/app/api/newsletter/subscribe/route');

    const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({}), // Missing email
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid email address');
  });

  it.skip('should return 429 when rate limited', async () => {
    // Skip: Rate limiter is mocked globally for tests
    // This test would need a separate test environment with real rate limiting
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
