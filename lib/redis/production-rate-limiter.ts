import { TRPCError } from '@trpc/server'
import { checkRateLimit, extractIPAddress } from './rate-limiter'
import type { RateLimitConfig, RateLimitContext } from '@/types/rate-limit-types'
import { RATE_LIMIT_PRESETS } from '@/types/rate-limit-types'
import { logger } from '@/lib/logger'
import { getRedisStatus } from './config'

/**
 * Production-Ready Redis Rate Limiting Integration
 * 
 * This implements Redis-based rate limiting for production deployment.
 * Addresses item #4 from your security checklist.
 * 
 * Architecture:
 * - Redis-first with in-memory fallback
 * - Integrates with Clerk authentication
 * - tRPC middleware for seamless integration
 * - Comprehensive monitoring and alerting
 * - Environment-aware configuration
 * 
 * Trade-offs:
 * - Redis dependency: Adds external service dependency but enables distributed rate limiting
 * - Memory usage: In-memory fallback uses application memory but ensures uptime
 * - Latency: ~1-2ms Redis round-trip vs instant in-memory checks
 * - Scalability: Scales across multiple Vercel functions vs single-instance limits
 */

interface ProductionRateLimitConfig extends RateLimitConfig {
  /** Environment-specific multipliers */
  productionMultiplier?: number
  /** Bypass rate limiting for development */
  skipInDevelopment?: boolean
  /** Alert threshold for monitoring */
  alertThreshold?: number
}

/**
 * Production rate limit configurations
 * These are tuned for real-world usage patterns
 */
export const PRODUCTION_RATE_LIMITS = {
  // API Endpoints
  API_GENERAL: {
    ...RATE_LIMIT_PRESETS.MODERATE,
    productionMultiplier: 0.8, // Slightly more restrictive in production
    alertThreshold: 0.9, // Alert when 90% of limit reached
  } as ProductionRateLimitConfig,

  // Contact forms - very strict to prevent spam
  CONTACT_FORM: {
    maxRequests: 2,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many contact requests. Please wait 15 minutes before submitting again.',
    alertThreshold: 1.0, // Alert immediately on any block
  } as ProductionRateLimitConfig,

  // Newsletter signup - prevent email list abuse
  NEWSLETTER: {
    maxRequests: 3,
    windowMs: 5 * 60 * 1000, // 5 minutes
    message: 'Too many newsletter signup attempts. Please wait 5 minutes.',
    alertThreshold: 1.0,
  } as ProductionRateLimitConfig,

  // Cal.com booking - prevent calendar spam
  BOOKING: {
    maxRequests: 5,
    windowMs: 10 * 60 * 1000, // 10 minutes
    message: 'Too many booking attempts. Please wait 10 minutes before booking again.',
    alertThreshold: 0.8,
  } as ProductionRateLimitConfig,

  // Authentication endpoints
  AUTH_LOGIN: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many login attempts. Please wait 15 minutes for security.',
    alertThreshold: 0.8,
  } as ProductionRateLimitConfig,

  AUTH_REGISTER: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many registration attempts. Please wait 1 hour.',
    alertThreshold: 1.0,
  } as ProductionRateLimitConfig,

  // Password reset - very strict
  PASSWORD_RESET: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many password reset attempts. Please wait 1 hour.',
    alertThreshold: 1.0,
  } as ProductionRateLimitConfig,

  // Admin operations
  ADMIN_OPERATIONS: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    message: 'Admin rate limit exceeded. Please slow down.',
    alertThreshold: 0.9,
  } as ProductionRateLimitConfig,

  // File uploads
  FILE_UPLOAD: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many file uploads. Please wait 1 minute.',
    alertThreshold: 0.8,
  } as ProductionRateLimitConfig,

  // Analytics/tracking - high volume allowed
  ANALYTICS: {
    maxRequests: 1000,
    windowMs: 60 * 1000, // 1 minute
    skipInDevelopment: true,
    alertThreshold: 0.95,
  } as ProductionRateLimitConfig,
} as const

/**
 * Enhanced rate limiter with production features
 */
export class ProductionRateLimiter {
  constructor() {
    this.logSystemStatus()
  }

  private async logSystemStatus(): Promise<void> {
    const status = getRedisStatus()
    
    if (status.fallbackMode) {
      logger.warn('Production rate limiter using fallback mode', {
        redisStatus: status,
        impact: 'Rate limiting will not work across multiple serverless functions',
        recommendation: 'Configure Redis for production deployment',
      })
    } else {
      logger.info('Production rate limiter initialized with Redis', {
        redisStatus: status,
      })
    }
  }

  /**
   * Check rate limit with production monitoring
   */
  async checkRateLimit(
    context: RateLimitContext,
    config: ProductionRateLimitConfig,
  ): Promise<void> {
    // Skip in development if configured
    if (
      config.skipInDevelopment &&
      process.env.NODE_ENV === 'development' &&
      process.env.SKIP_RATE_LIMITING === 'true'
    ) {
      logger.debug('Rate limiting skipped in development', {
        path: context.path,
        config: config,
      })
      return
    }

    // Apply production multiplier
    const adjustedConfig = {
      ...config,
      maxRequests: Math.floor(
        config.maxRequests * (config.productionMultiplier || 1),
      ),
    }

    try {
      const result = await checkRateLimit(context, adjustedConfig)

      if (!result.allowed) {
        // Log rate limit violation
        logger.warn('Production rate limit exceeded', {
          path: context.path,
          ip: context.ip,
          userId: context.userId,
          count: result.count,
          limit: result.limit,
          retryAfter: result.retryAfter,
          severity: 'high',
        })

        // Throw tRPC error with detailed information
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: adjustedConfig.message || 'Rate limit exceeded. Please try again later.',
          cause: {
            type: 'RATE_LIMIT_EXCEEDED',
            count: result.count,
            limit: result.limit,
            resetTime: result.resetTime,
            retryAfter: Math.ceil(result.retryAfter),
          },
        })
      }

      // Check if we're approaching the limit for monitoring
      const usagePercent = result.count / result.limit
      if (
        config.alertThreshold &&
        usagePercent >= config.alertThreshold
      ) {
        logger.warn('Rate limit threshold approaching', {
          path: context.path,
          ip: context.ip,
          userId: context.userId,
          count: result.count,
          limit: result.limit,
          usagePercent: Math.round(usagePercent * 100),
          threshold: Math.round(config.alertThreshold * 100),
          severity: 'medium',
        })
      }

      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Rate limit check passed', {
          path: context.path,
          count: result.count,
          limit: result.limit,
          remaining: result.limit - result.count,
        })
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      // Log unexpected errors
      logger.error('Production rate limiter error', {
        path: context.path,
        ip: context.ip,
        userId: context.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        severity: 'critical',
      })

      // Fail open for unexpected errors to avoid blocking legitimate users
      logger.warn('Rate limiter failing open due to error', {
        path: context.path,
        decision: 'allow_request',
        reason: 'unexpected_error',
      })
    }
  }

  /**
   * Create a tRPC middleware with production rate limiting
   */
  createMiddleware(config: ProductionRateLimitConfig) {
    return async ({ ctx, path, next }: { ctx: Record<string, unknown>; path: string; next: () => Promise<unknown> }) => {
      // Extract context information
      const ip = extractIPAddress(ctx.req)
      const userId = ctx.user?.id

      const rateLimitContext: RateLimitContext = {
        req: ctx.req,
        ip,
        userId,
        path,
      }

      // Check rate limit
      await this.checkRateLimit(rateLimitContext, config)

      return next()
    }
  }

  /**
   * Health check for production monitoring
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    details: {
      redis: Record<string, unknown>
      fallbackMode: boolean
      lastError?: string
    }
  }> {
    const redisStatus = getRedisStatus()
    
    return {
      status: redisStatus.connected ? 'healthy' : 'degraded',
      details: {
        redis: redisStatus,
        fallbackMode: redisStatus.fallbackMode,
        lastError: redisStatus.error || undefined,
      },
    }
  }
}

// Singleton instance
const productionRateLimiter = new ProductionRateLimiter()

/**
 * Production-ready rate limiting middlewares
 */
export const createProductionRateLimit = (config: ProductionRateLimitConfig) => productionRateLimiter.createMiddleware(config)

// Pre-configured production middlewares
export const apiRateLimit = createProductionRateLimit(PRODUCTION_RATE_LIMITS.API_GENERAL)
export const contactFormRateLimit = createProductionRateLimit(PRODUCTION_RATE_LIMITS.CONTACT_FORM)
export const newsletterRateLimit = createProductionRateLimit(PRODUCTION_RATE_LIMITS.NEWSLETTER)
export const bookingRateLimit = createProductionRateLimit(PRODUCTION_RATE_LIMITS.BOOKING)
export const authLoginRateLimit = createProductionRateLimit(PRODUCTION_RATE_LIMITS.AUTH_LOGIN)
export const authRegisterRateLimit = createProductionRateLimit(PRODUCTION_RATE_LIMITS.AUTH_REGISTER)
export const passwordResetRateLimit = createProductionRateLimit(PRODUCTION_RATE_LIMITS.PASSWORD_RESET)
export const adminRateLimit = createProductionRateLimit(PRODUCTION_RATE_LIMITS.ADMIN_OPERATIONS)
export const fileUploadRateLimit = createProductionRateLimit(PRODUCTION_RATE_LIMITS.FILE_UPLOAD)
export const analyticsRateLimit = createProductionRateLimit(PRODUCTION_RATE_LIMITS.ANALYTICS)

/**
 * Health check endpoint for monitoring
 */
export const rateLimitHealthCheck = async () => productionRateLimiter.healthCheck()

export { productionRateLimiter }
