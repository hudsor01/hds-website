/**
 * Health Check API Route Unit Tests
 * Tests for src/app/api/health/route.ts
 *
 * Verifies the response shape on success and the 503 path on DB failure.
 * DB is mocked via mock.module('@/lib/db') in each test case.
 */

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { cleanupMocks } from '../test-utils';

describe('GET /api/health', () => {
  beforeEach(() => {
    mock.module('@/env', () => ({
      env: {
        NODE_ENV: 'test',
        npm_package_version: '2.5.0',
      },
    }));

    mock.module('@/lib/logger', () => ({
      logger: {
        debug: mock(),
        info: mock(),
        warn: mock(),
        error: mock(),
        setContext: mock(),
      },
      castError: (error: unknown) =>
        error instanceof Error ? error : new Error(String(error)),
    }));
  });

  afterEach(() => {
    cleanupMocks();
  });

  it('returns 200 with correct shape when database is reachable', async () => {
    // Mock db.execute to resolve successfully; the sql tag comes from real drizzle-orm
    mock.module('@/lib/db', () => ({
      db: {
        execute: mock().mockResolvedValue([{ '?column?': 1 }]),
      },
    }));

    const { GET } = await import('@/app/api/health/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.database).toBe('ok');
    expect(typeof data.timestamp).toBe('string');
    expect(typeof data.latency_ms).toBe('number');
    expect(data.latency_ms).toBeGreaterThanOrEqual(0);
    expect(typeof data.version).toBe('string');
  });

  it('timestamp in success response is a valid ISO 8601 string', async () => {
    mock.module('@/lib/db', () => ({
      db: {
        execute: mock().mockResolvedValue([{ '?column?': 1 }]),
      },
    }));

    const { GET } = await import('@/app/api/health/route');
    const response = await GET();
    const data = await response.json();

    const parsed = new Date(data.timestamp);
    expect(parsed.toISOString()).toBe(data.timestamp);
  });

  it('returns 503 with error shape when database throws', async () => {
    mock.module('@/lib/db', () => ({
      db: {
        execute: mock().mockRejectedValue(new Error('connection refused')),
      },
    }));

    const { GET } = await import('@/app/api/health/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe('error');
    expect(data.database).toBe('error');
    expect(typeof data.timestamp).toBe('string');
    // latency_ms should not be present in the error response
    expect(data.latency_ms).toBeUndefined();
  });

  it('error response timestamp is a valid ISO 8601 string', async () => {
    mock.module('@/lib/db', () => ({
      db: {
        execute: mock().mockRejectedValue(new Error('timeout')),
      },
    }));

    const { GET } = await import('@/app/api/health/route');
    const response = await GET();
    const data = await response.json();

    const parsed = new Date(data.timestamp);
    expect(parsed.toISOString()).toBe(data.timestamp);
  });
});
