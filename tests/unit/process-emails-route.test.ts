/**
 * Process Emails API Route Unit Tests
 * Tests for src/app/api/process-emails/route.ts
 *
 * Covers authentication (missing header, wrong token, 503 when env not set)
 * and verifies that processEmailsEndpoint is called on an authorized request.
 */

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { NextRequest } from 'next/server';
import { cleanupMocks } from '../test-utils';

const VALID_CRON_SECRET = 'test-cron-secret-that-is-32-chars!!';

function makeRequest(authHeader?: string): NextRequest {
  const headers: Record<string, string> = {};
  if (authHeader !== undefined) {
    headers['authorization'] = authHeader;
  }
  return new NextRequest('http://localhost:3000/api/process-emails', {
    method: 'POST',
    headers,
  });
}

describe('POST /api/process-emails', () => {
  let mockProcessEmailsEndpoint: ReturnType<typeof mock>;

  beforeEach(() => {
    mockProcessEmailsEndpoint = mock().mockResolvedValue({
      processed: 3,
      errors: 0,
      message: 'Processed 3 emails, 0 errors',
    });

    mock.module('@/env', () => ({
      env: {
        NODE_ENV: 'test',
        CRON_SECRET: VALID_CRON_SECRET,
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

    mock.module('@/lib/scheduled-emails', () => ({
      processEmailsEndpoint: mockProcessEmailsEndpoint,
    }));
  });

  afterEach(() => {
    cleanupMocks();
  });

  it('returns 401 when no authorization header is provided', async () => {
    const { POST } = await import('@/app/api/process-emails/route');
    const response = await POST(makeRequest());
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 401 when an incorrect Bearer token is provided', async () => {
    const { POST } = await import('@/app/api/process-emails/route');
    const response = await POST(makeRequest('Bearer wrong-secret'));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 401 when the authorization scheme is not Bearer', async () => {
    const { POST } = await import('@/app/api/process-emails/route');
    const response = await POST(makeRequest(`Basic ${VALID_CRON_SECRET}`));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 503 when CRON_SECRET is not configured', async () => {
    mock.module('@/env', () => ({
      env: {
        NODE_ENV: 'test',
        CRON_SECRET: undefined,
      },
    }));

    const { POST } = await import('@/app/api/process-emails/route');
    const response = await POST(makeRequest(`Bearer ${VALID_CRON_SECRET}`));
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toBe('Cron authentication not configured');
  });

  it('calls processEmailsEndpoint and returns its result on a valid request', async () => {
    const { POST } = await import('@/app/api/process-emails/route');
    const response = await POST(makeRequest(`Bearer ${VALID_CRON_SECRET}`));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockProcessEmailsEndpoint).toHaveBeenCalledTimes(1);
    expect(data.processed).toBe(3);
    expect(data.errors).toBe(0);
  });

  it('returns 500 when processEmailsEndpoint throws', async () => {
    mockProcessEmailsEndpoint = mock().mockRejectedValue(new Error('queue failure'));

    mock.module('@/lib/scheduled-emails', () => ({
      processEmailsEndpoint: mockProcessEmailsEndpoint,
    }));

    const { POST } = await import('@/app/api/process-emails/route');
    const response = await POST(makeRequest(`Bearer ${VALID_CRON_SECRET}`));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Processing failed');
  });
});
