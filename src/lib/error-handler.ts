import { NextResponse } from 'next/server';

/**
 * Centralized error handler for API routes
 * Ensures consistent error responses without exposing sensitive information
 */

interface ApiErrorOptions {
  statusCode?: number;
  logError?: boolean;
  context?: string;
}

export function handleApiError(
  error: unknown, 
  options: ApiErrorOptions = {}
): NextResponse {
  const {
    statusCode = 500,
    logError = true,
    context = 'API Error'
  } = options;

  // Log error details for debugging (never sent to client)
  if (logError) {
    console.error(`[${context}]`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }

  // Determine appropriate client-facing message based on status code
  let clientMessage = 'An unexpected error occurred. Please try again.';
  
  switch (statusCode) {
    case 400:
      clientMessage = 'Invalid request. Please check your input.';
      break;
    case 401:
      clientMessage = 'Authentication required.';
      break;
    case 403:
      clientMessage = 'Access denied.';
      break;
    case 404:
      clientMessage = 'Resource not found.';
      break;
    case 429:
      clientMessage = 'Too many requests. Please try again later.';
      break;
    case 503:
      clientMessage = 'Service temporarily unavailable. Please try again later.';
      break;
  }

  // Return generic error response
  return NextResponse.json(
    { 
      error: clientMessage,
      timestamp: new Date().toISOString()
    },
    { status: statusCode }
  );
}

/**
 * Sanitize error messages for logging
 * Removes potentially sensitive data patterns
 */
export function sanitizeErrorForLogging(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Unknown error';
  }

  let message = error.message;

  // Remove common sensitive patterns
  const sensitivePatterns = [
    /api[_-]?key[=:]\s*['"]?[\w-]+/gi,
    /password[=:]\s*['"]?[\w-]+/gi,
    /token[=:]\s*['"]?[\w-]+/gi,
    /secret[=:]\s*['"]?[\w-]+/gi,
    /Bearer\s+[\w-]+/gi,
    /email[=:]\s*['"]?[^'"@\s]+@[^'"@\s]+/gi,
  ];

  sensitivePatterns.forEach(pattern => {
    message = message.replace(pattern, '[REDACTED]');
  });

  return message;
}

/**
 * Type guard to check if error has a specific code
 */
export function hasErrorCode(
  error: unknown,
  code: string
): error is Error & { code: string } {
  return (
    error instanceof Error &&
    'code' in error &&
    (error as Error & { code: string }).code === code
  );
}