import { TRPCError } from '@trpc/server'
import { observable } from '@trpc/server/observable'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { initTRPC } from '@trpc/server'
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { verifyAdminToken } from '@/lib/auth/admin'
import type { AdminUser } from '@/lib/auth/admin'
import { extractTokenFromHeader, extractTokenFromCookies } from '@/lib/auth/jwt'

// Initialize tRPC for middleware creation
const t = initTRPC.context<{ req: Request; user?: AdminUser }>().create()

/**
 * Error handling middleware
 *
 * This middleware logs errors and formats them for consistent error responses
 */
export const errorMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now()

  // Log procedure start
  if (process.env.NODE_ENV === 'development') {
    logger.info(`tRPC ${type} request started`, {
      path,
      type,
    })
  }

  try {
    // Pass to the next middleware or procedure
    const result = await next()

    // Calculate the time taken
    const durationMs = Date.now() - start

    // Log performance for slow queries in production
    if (process.env.NODE_ENV === 'production' && durationMs > 500) {
      logger.warn('tRPC slow procedure detected', {
        path,
        durationMs,
      })
    } else if (process.env.NODE_ENV === 'development') {
      // Always log performance in development
      logger.info(`tRPC ${type} request completed`, {
        path,
        durationMs,
      })
    }

    return result
  } catch (error) {
    const durationMs = Date.now() - start

    // Format error for logging
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    // Log errors
    if (error instanceof TRPCError) {
      if (error.code === 'BAD_REQUEST') {
        logger.warn('tRPC validation error', {
          path,
          error: errorMessage,
          code: error.code,
          durationMs,
        })
      } else {
        logger.error('tRPC error', {
          path,
          error: errorMessage,
          code: error.code,
          stack: errorStack,
          durationMs,
        })
      }
    } else if (error instanceof z.ZodError) {
      logger.warn('tRPC validation error', {
        path,
        error: JSON.stringify(error.errors),
        durationMs,
      })
    } else {
      logger.error('tRPC unexpected error', {
        path,
        error: errorMessage,
        stack: errorStack,
        durationMs,
      })
    }

    throw error
  }
})

/**
 * Rate limiting middleware
 *
 * This middleware provides basic rate limiting for TRPC procedures
 */
export const rateLimitMiddleware = (options?: {
  windowMs?: number
  max?: number
  keyGenerator?: (ctx: Record<string, unknown>) => string
}) => {
  const {
    windowMs = 60 * 1000, // 1 minute
    max = 100, // max requests per windowMs
    keyGenerator = ctx =>
      ctx.req?.headers?.get('x-forwarded-for') || 'anonymous',
  } = options || {}

  // Track request counts
  const ipRequestCounts = new Map<
    string,
    { count: number; resetTime: number }
  >()

  return t.middleware(async ({ ctx, next }) => {
    const key = keyGenerator(ctx)
    const now = Date.now()

    // Get or initialize request tracking for this IP
    let requestData = ipRequestCounts.get(key)

    if (!requestData || now > requestData.resetTime) {
      // First request in the window or window expired, reset counter
      requestData = { count: 0, resetTime: now + windowMs }
      ipRequestCounts.set(key, requestData)
    }

    // Increment the counter
    requestData.count++

    // Check if rate limit exceeded
    if (requestData.count > max) {
      // Rate limit exceeded, throw error
      const resetTime = requestData.resetTime
      const retry = Math.ceil((resetTime - now) / 1000)

      logger.warn('Rate limit exceeded', {
        key,
        count: requestData.count,
        limit: max,
        retry,
      })

      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded. Try again in ${retry} seconds.`,
      })
    }

    // Continue to the next middleware or procedure
    return next()
  })
}

/**
 * Performance tracking middleware
 *
 * This middleware measures and logs performance metrics for TRPC procedures
 */
export const performanceMiddleware = t.middleware(
  async ({ path, type, next }) => {
    const start = Date.now()
    const result = await next()
    const durationMs = Date.now() - start

    // Log performance metrics
    if (process.env.NODE_ENV === 'development' || durationMs > 500) {
      logger.info(`tRPC ${type} performance`, {
        path,
        durationMs,
      })
    }

    return result
  },
)

/**
 * Authentication middleware
 *
 * Validates JWT tokens and adds user information to context
 */
export const authMiddleware = t.middleware(async ({ ctx, next }) => {
  const { req } = ctx

  // Extract token from Authorization header or cookies
  const authHeader = req.headers.get('authorization')
  const cookieHeader = req.headers.get('cookie')
  
  const token = extractTokenFromHeader(authHeader) || extractTokenFromCookies(cookieHeader)

  if (!token) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication token required',
    })
  }

  // Verify the token and get user information
  const user = await verifyAdminToken(token)

  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired authentication token',
    })
  }

  // Add user to context
  return next({
    ctx: {
      ...ctx,
      user,
    },
  })
})

/**
 * Admin-only middleware
 *
 * Ensures the authenticated user has admin privileges
 */
export const adminMiddleware = t.middleware(async ({ ctx, next }) => {
  const { req } = ctx

  // Extract token from Authorization header or cookies
  const authHeader = req.headers.get('authorization')
  const cookieHeader = req.headers.get('cookie')
  
  const token = extractTokenFromHeader(authHeader) || extractTokenFromCookies(cookieHeader)

  if (!token) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    })
  }

  // Verify the token and get user information
  const user = await verifyAdminToken(token)

  if (!user || user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    })
  }

  // Add user to context
  return next({
    ctx: {
      ...ctx,
      user,
    },
  })
})

/**
 * Validation error formatting middleware
 *
 * This middleware enhances Zod validation errors with friendly messages
 */
export const validationMiddleware = t.middleware(async ({ next }) => {
  try {
    return await next()
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format Zod errors for better user experience
      const formattedErrors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      }))

      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Validation error',
        cause: {
          errors: formattedErrors,
          original: error,
        },
      })
    }

    throw error
  }
})