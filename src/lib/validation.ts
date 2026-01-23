/**
 * Validation Utilities
 * Centralized validation error formatting for consistent API responses
 */

import type { ZodError } from 'zod';

export interface FormattedValidationError {
  fieldErrors: Record<string, string[]>;
  firstError: string;
}

/**
 * Format Zod validation errors into a consistent structure
 * @param error - Zod validation error
 * @returns Formatted error object with fieldErrors and firstError
 */
export function formatValidationError(error: ZodError): FormattedValidationError {
  const flattened = error.flatten();
  const fieldErrors = flattened.fieldErrors as Record<string, string[]>;
  const firstFieldError = Object.values(fieldErrors)[0]?.[0];
  const firstFormError = flattened.formErrors[0];
  const firstError = firstFieldError || firstFormError || 'Invalid input';

  return { fieldErrors, firstError };
}
