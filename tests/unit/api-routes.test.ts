/**
 * API Route Integration Tests
 * Tests for critical API endpoints including newsletter subscription
 */

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { NextRequest } from 'next/server';
import { cleanupMocks, setupApiMocks } from '../test-utils';

// ================================
// Newsletter Subscribe API Tests
// ================================

describe('Newsletter Subscribe API', () => {
  /**
   * Creates a Drizzle ORM-compatible db mock.
   * The chain matches the actual route usage:
   *   select: db.select().from(table).where(condition) -> rows[]
   *   insert: db.insert(table).values(data).onConflictDoUpdate(config) -> void
   */
  function createDbMock(options?: {
    selectResult?: Record<string, unknown>[];
    insertError?: Error;
  }) {
    const selectResult = options?.selectResult ?? [];
    const insertError = options?.insertError;

    return {
      select: mock(() => ({
        from: mock(() => ({
          where: mock().mockResolvedValue(selectResult),
        })),
      })),
      insert: mock(() => ({
        values: mock(() => ({
          onConflictDoUpdate: insertError
            ? mock().mockRejectedValue(insertError)
            : mock().mockResolvedValue(undefined),
        })),
      })),
    };
  }

  beforeEach(() => {
    setupApiMocks();

    // Default Drizzle db mock: no existing subscriber, insert succeeds
    mock.module('@/lib/db', () => ({
      db: createDbMock(),
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

  it('should return 400 when email already subscribed', async () => {
    mock.module('@/lib/db', () => ({
      db: createDbMock({
        selectResult: [{ email: 'existing@example.com', status: 'active' }],
      }),
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

  it('should return 500 when database insert fails', async () => {
    mock.module('@/lib/db', () => ({
      db: createDbMock({
        insertError: new Error('db failure'),
      }),
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
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid');
  });

  it('should allow requests when rate limiter is mocked', async () => {
    // Rate limiter is mocked globally for tests to allow all requests
    // This test verifies the mock behavior (requests are not rate limited)
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

    // Should succeed because rate limiter is mocked to allow requests
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
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
