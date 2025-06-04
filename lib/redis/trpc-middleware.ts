import { TRPCError } from '@trpc/server'
import { initTRPC } from '@trpc/server'
import { checkRateLimit, extractIPAddress } from '@/lib/redis/rate-limiter'
import type { RateLimitConfig, RateLimitContext } from '@/types/rate-limit-types'
import { RATE_LIMIT_PRESETS } from '@/types/rate-limit-types'
import { logger } from '@/lib/logger'

/**
 * Enhanced tRPC Rate Limiting Middleware
 * 
 * Production-ready rate limiting middleware that integrates with your existing tRPC setup.
 * Supports Redis-based distributed rate limiting with in-memory fallback.
 * 
 * Features:
 * - Integrates with Clerk user authentication
 * - IP-based rate limiting for anonymous users
 * - User-based rate limiting for authenticated users
 * - Configurable per-endpoint limits
 * - Comprehensive error handling and logging
 * - Development vs production configurations
 */

// Type for tRPC context with user information
type TRPCContextWithAuth = {
  req: Request
  user?: {
    id: string
    email?: string
    role?: string
  } | null
}

// Initialize tRPC for middleware creation
const t = initTRPC.context<TRPCContextWithAuth>().create()

/**
 * Create a rate limiting middleware with custom configuration
 */
export const createRateLimitMiddleware = (config: RateLimitConfig) => t.middleware(async ({ ctx, path, next }) => {
    // Skip rate limiting in development mode if configured
    if (process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMITING === 'true') {
      logger.info('Rate limiting skipped in development mode', { path })
      return next()
    }

    // Extract request information
    const ip = extractIPAddress(ctx.req)
    const userId = ctx.user?.id
    
    // Create rate limit context
    const rateLimitContext: RateLimitContext = {
      req: ctx.req,
      ip,
      userId,
      path,
    }

    try {
      // Check rate limit
      const result = await checkRateLimit(rateLimitContext, config)

      if (!result.allowed) {
        // Rate limit exceeded - throw tRPC error
        const retryAfter = Math.ceil(result.retryAfter)
        
        logger.warn('tRPC rate limit exceeded', {
          path,
          ip,
          userId,
          count: result.count,
          limit: result.limit,
          retryAfter,
        })

        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: config.message || `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
          cause: {
            count: result.count,
            limit: result.limit,
            resetTime: result.resetTime,
            retryAfter: result.retryAfter,
          },
        })
      }

      // Log successful rate limit check in development
      if (process.env.NODE_ENV === 'development') {
        logger.info('tRPC rate limit check passed', {
          path,
          count: result.count,
          limit: result.limit,
          remaining: result.limit - result.count,
        })
      }

      // Continue to next middleware/procedure
      return next()
    } catch (error) {
      // Re-throw tRPC errors
      if (error instanceof TRPCError) {
        throw error
      }

      // Log unexpected errors but allow request to continue
      logger.error('Unexpected error in rate limiting middleware', {
        path,
        ip,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      // Continue with request on unexpected errors
      return next()
    }
  })

/**
 * Predefined rate limiting middlewares for common use cases
 */

/**
 * Strict rate limiting - for sensitive operations like password reset
 */
export const strictRateLimit = createRateLimitMiddleware({
  ...RATE_LIMIT_PRESETS.STRICT,
  message: 'Too many requests for this sensitive operation. Please wait before trying again.',
})

/**
 * Moderate rate limiting - for general API usage
 */
export const moderateRateLimit = createRateLimitMiddleware({
  ...RATE_LIMIT_PRESETS.MODERATE,
  message: 'Rate limit exceeded. Please slow down your requests.',
})

/**
 * Lenient rate limiting - for high-frequency operations
 */
export const lenientRateLimit = createRateLimitMiddleware({
  ...RATE_LIMIT_PRESETS.LENIENT,
  message: 'Rate limit exceeded. Please reduce your request frequency.',
})

/**
 * Contact form rate limiting - prevents spam
 */
export const contactFormRateLimit = createRateLimitMiddleware({
  ...RATE_LIMIT_PRESETS.CONTACT_FORM,
  message: 'Too many contact form submissions. Please wait 10 minutes before submitting again.',
  keyGenerator: (context) => {
    // Use IP for anonymous users, email for authenticated users
    const identifier = context.userId || context.ip || 'anonymous'
    return `contact-form:${identifier}:${Math.floor(Date.now() / (10 * 60 * 1000))}`
  },
})

/**
 * Newsletter signup rate limiting
 */
export const newsletterRateLimit = createRateLimitMiddleware({
  ...RATE_LIMIT_PRESETS.NEWSLETTER,
  message: 'Too many newsletter signup attempts. Please wait before trying again.',
  keyGenerator: (context) => {
    const identifier = context.userId || context.ip || 'anonymous'
    return `newsletter:${identifier}:${Math.floor(Date.now() / 60000)}`
  },
})

/**
 * Analytics tracking rate limiting - high frequency allowed
 */
export const analyticsRateLimit = createRateLimitMiddleware({
  ...RATE_LIMIT_PRESETS.ANALYTICS,
  message: 'Analytics tracking rate limit exceeded.',
  skip: () => 
    // Skip rate limiting for analytics in development
     process.env.NODE_ENV === 'development'
  ,
})

/**
 * Admin operations rate limiting
 */
export const adminRateLimit = createRateLimitMiddleware({
  ...RATE_LIMIT_PRESETS.ADMIN,
  message: 'Admin rate limit exceeded. Please wait before performing more operations.',
  keyGenerator: (context) => {
    // Admin rate limits are per-user, not per-IP
    const identifier = context.userId || 'anonymous-admin'
    return `admin:${identifier}:${Math.floor(Date.now() / 60000)}`
  },
})

/**
 * Dynamic rate limiting based on user type
 */
export const dynamicRateLimit = createRateLimitMiddleware({
  maxRequests: 100, // Default
  windowMs: 60 * 1000, // 1 minute
  keyGenerator: (context) => {
    // Different limits based on user authentication status
    const identifier = context.userId || context.ip || 'anonymous'
    return `dynamic:${identifier}:${Math.floor(Date.now() / 60000)}`
  },
  skip: (context) => 
    // Skip rate limiting for admin users
    context.user?.role === 'admin'
  ,
})

/**
 * Custom rate limiting for specific endpoints
 */
export const createEndpointRateLimit = (
  maxRequests: number,
  windowMs: number,
  endpointName: string,
) => createRateLimitMiddleware({
    maxRequests,
    windowMs,
    message: `Rate limit exceeded for ${endpointName}. Please wait before trying again.`,
    keyGenerator: (context) => {
      const identifier = context.userId || context.ip || 'anonymous'
      return `endpoint:${endpointName}:${identifier}:${Math.floor(Date.now() / windowMs)}`
    },
  })

/**
 * Export the base rate limiting middleware for custom use
 */
export { createRateLimitMiddleware as rateLimitMiddleware }

/**
 * Utility function to add rate limit headers to response
 * This can be used in API routes to inform clients about rate limits
 */
export const addRateLimitHeaders = (
  headers: Headers,
  result: { count: number; limit: number; resetTime: number },
): void => {
  headers.set('X-RateLimit-Limit', result.limit.toString())
  headers.set('X-RateLimit-Remaining', Math.max(0, result.limit - result.count).toString())
  headers.set('X-RateLimit-Reset', Math.floor(result.resetTime / 1000).toString())
}
