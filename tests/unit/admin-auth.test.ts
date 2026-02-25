/**
 * Admin Authentication Unit Tests
 * Tests for validateAdminAuth() in src/lib/auth/admin.ts
 *
 * Relies on the env mock from tests/setup.ts preload.
 * mock.module() for @/env is applied in beforeEach via setupApiMocks.
 */

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { NextRequest } from 'next/server';
import { cleanupMocks } from '../test-utils';

const VALID_ADMIN_SECRET = 'test-admin-secret-that-is-32-chars!!';

describe('validateAdminAuth', () => {
  beforeEach(() => {
    mock.module('@/env', () => ({
      env: {
        NODE_ENV: 'test',
        ADMIN_SECRET: VALID_ADMIN_SECRET,
        CRON_SECRET: 'test-cron-secret-that-is-32-chars!!',
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

  it('returns null when the correct Bearer token is provided', async () => {
    const { validateAdminAuth } = await import('@/lib/auth/admin');

    const request = new NextRequest('http://localhost:3000/api/admin/test', {
      method: 'GET',
      headers: {
        authorization: `Bearer ${VALID_ADMIN_SECRET}`,
      },
    });

    const result = validateAdminAuth(request);
    expect(result).toBeNull();
  });

  it('returns 401 when no authorization header is present', async () => {
    const { validateAdminAuth } = await import('@/lib/auth/admin');

    const request = new NextRequest('http://localhost:3000/api/admin/test', {
      method: 'GET',
    });

    const result = validateAdminAuth(request);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);

    const body = await result!.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 401 when the Bearer token is wrong', async () => {
    const { validateAdminAuth } = await import('@/lib/auth/admin');

    const request = new NextRequest('http://localhost:3000/api/admin/test', {
      method: 'GET',
      headers: {
        authorization: 'Bearer completely-wrong-secret',
      },
    });

    const result = validateAdminAuth(request);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);

    const body = await result!.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 401 when the authorization scheme is not Bearer', async () => {
    const { validateAdminAuth } = await import('@/lib/auth/admin');

    const request = new NextRequest('http://localhost:3000/api/admin/test', {
      method: 'GET',
      headers: {
        authorization: `Basic ${VALID_ADMIN_SECRET}`,
      },
    });

    const result = validateAdminAuth(request);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);
  });

  it('returns 503 when ADMIN_SECRET is not configured', async () => {
    mock.module('@/env', () => ({
      env: {
        NODE_ENV: 'test',
        ADMIN_SECRET: undefined,
      },
    }));

    const { validateAdminAuth } = await import('@/lib/auth/admin');

    const request = new NextRequest('http://localhost:3000/api/admin/test', {
      method: 'GET',
      headers: {
        authorization: `Bearer ${VALID_ADMIN_SECRET}`,
      },
    });

    const result = validateAdminAuth(request);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(503);

    const body = await result!.json();
    expect(body.error).toBe('Admin authentication not configured');
  });
});
