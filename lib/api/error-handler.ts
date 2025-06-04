import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { TRPCError } from '@trpc/server'
import { logger } from '@/lib/logger'

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational = true,
    public code?: string,
  ) {
    super(message)
    this.name = 'AppError'
    Object.setPrototypeOf(this, AppError.prototype)
    
    // Explicit reference to constructor parameters to satisfy linting
    this.statusCode = statusCode
    this.isOperational = isOperational
    if (code) this.code = code
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public details?: unknown,
  ) {
    super(message, 400, true, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
    this.details = details
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, true, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, true, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, true, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true, 'CONFLICT')
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, true, 'RATE_LIMIT_EXCEEDED')
    this.name = 'RateLimitError'
  }
}

export function handleApiError(
  error: unknown,
  context?: { path?: string; method?: string },
) {
  // Log the error
  logger.error('API error occurred', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  })

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      },
      { status: 400 },
    )
  }

  // Handle TRPC errors
  if (error instanceof TRPCError) {
    const httpCode = getHTTPStatusCodeFromTRPCError(error)
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: httpCode },
    )
  }

  // Handle custom app errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code || 'APP_ERROR',
      },
      { status: error.statusCode },
    )
  }

  // Handle unknown errors
  const isDevelopment = process.env.NODE_ENV === 'development'

  return NextResponse.json(
    {
      error:
        isDevelopment && error instanceof Error
          ? error.message
          : 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    },
    { status: 500 },
  )
}

function getHTTPStatusCodeFromTRPCError(error: TRPCError): number {
  const codeToStatus: Record<string, number> = {
    PARSE_ERROR: 400,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_SUPPORTED: 405,
    CONFLICT: 409,
    PRECONDITION_FAILED: 412,
    PAYLOAD_TOO_LARGE: 413,
    UNPROCESSABLE_CONTENT: 422,
    TOO_MANY_REQUESTS: 429,
    CLIENT_CLOSED_REQUEST: 499,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
  }

  return codeToStatus[error.code] || 500
}

// Utility function to wrap async API handlers with error handling
export function withErrorHandler<T extends Request = NextRequest>(
  handler: (_req: T) => Promise<NextResponse>,
) {
  return async (req: T) => {
    try {
      return await handler(req)
    } catch (error) {
      return handleApiError(error, {
        path: req.url,
        method: req.method,
      })
    }
  }
}
