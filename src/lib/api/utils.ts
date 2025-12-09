/**
 * API Utilities
 * Common utilities for API routes
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { logger } from '@/lib/logger';

export interface APIError {
  message: string;
  code?: string;
  details?: unknown;
}

export class APIResponse {
  static success<T>(data: T, status = 200) {
    return NextResponse.json({ success: true, data }, { status });
  }

  static error(error: APIError | string, status = 500) {
    const errorObj = typeof error === 'string'
      ? { message: error }
      : error;

    logger.error('API Error:', errorObj);

    return NextResponse.json(
      { success: false, error: errorObj },
      { status }
    );
  }

  static validationError(errors: ZodError) {
    return this.error({
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.issues
    }, 400);
  }
}

export function handleAPIError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return APIResponse.validationError(error);
  }

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('Unauthorized')) {
      return APIResponse.error({ message: 'Unauthorized', code: 'UNAUTHORIZED' }, 401);
    }
    if (error.message.includes('Forbidden')) {
      return APIResponse.error({ message: 'Forbidden', code: 'FORBIDDEN' }, 403);
    }
    if (error.message.includes('Not found')) {
      return APIResponse.error({ message: 'Not found', code: 'NOT_FOUND' }, 404);
    }

    return APIResponse.error({ message: error.message, code: 'INTERNAL_ERROR' }, 500);
  }

  return APIResponse.error({ message: 'An unexpected error occurred', code: 'UNKNOWN_ERROR' }, 500);
}
