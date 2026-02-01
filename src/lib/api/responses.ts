/**
 * Standard API Response Helpers
 * Provides consistent response formats across all API routes
 */

import type { ZodError } from 'zod';

interface FormattedValidationError {
  fieldErrors: Record<string, string[]>;
  firstError: string;
}

function formatValidationError(error: ZodError): FormattedValidationError {
  const flattened = error.flatten();
  const fieldErrors = flattened.fieldErrors as Record<string, string[]>;
  const firstFieldError = Object.values(fieldErrors)[0]?.[0];
  const firstFormError = flattened.formErrors[0];
  const firstError = firstFieldError || firstFormError || 'Invalid input';

  return { fieldErrors, firstError };
}

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
