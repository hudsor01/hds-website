/**
 * Standard API Response Helpers
 * Provides consistent response formats across all API routes
 */

import type { ZodError } from 'zod';
import { formatValidationError } from '@/lib/validation';

/**
 * Success response with optional data and message
 * @param data - Response data (optional)
 * @param message - Success message (optional)
 * @param status - HTTP status code (default: 200)
 * @returns Standard success response
 */
export function successResponse<T = unknown>(
  data?: T,
  message?: string,
  status = 200
) {
  return Response.json(
    { success: true, data, message },
    { status }
  );
}

/**
 * Error response with message and optional details
 * @param error - Error message
 * @param status - HTTP status code (default: 500)
 * @param details - Additional error details (optional)
 * @returns Standard error response
 */
export function errorResponse(
  error: string,
  status = 500,
  details?: unknown
) {
  return Response.json(
    { success: false, error, ...(details ? { details } : {}) },
    { status }
  );
}

/**
 * Validation error response for Zod validation failures
 * @param zodError - Zod validation error
 * @returns Standard validation error response with field-level errors
 */
export function validationErrorResponse(zodError: ZodError) {
  const formatted = formatValidationError(zodError);
  return Response.json(
    {
      success: false,
      error: formatted.firstError,
      fieldErrors: formatted.fieldErrors
    },
    { status: 400 }
  );
}
