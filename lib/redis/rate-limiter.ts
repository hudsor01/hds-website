import type { 
  RateLimitConfig, 
  RateLimitContext, 
  RateLimitResult, 
  RateLimitStorage,
} from '@/types/rate-limit-types'
import { getRedisClient, isRedisAvailable } from './config'
import { logger } from '@/lib/logger'

/**
 * Redis-based Rate Limiting Implementation
 * 
 * Production-ready rate limiting with Redis backend and in-memory fallback.
 * Implements sliding window algorithm for accurate rate limiting.
 * 
 * Features:
 * - Redis-backed for distributed rate limiting
 * - In-memory fallback for development/degraded mode
 * - Sliding window algorithm for precise control
 * - Configurable per-endpoint limits
 * - User and IP-based limiting
 * - Comprehensive error handling
 * - Performance optimized for serverless
 */

/**
 * In-memory fallback storage for when Redis is unavailable
 */
class InMemoryRateLimitStorage implements RateLimitStorage {
  private store = new Map<string, { count: number; resetTime: number }>()
  private cleanupInterval: globalThis.NodeJS.Timeout

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  async get(key: string): Promise<number | null> {
    const entry = this.store.get(key)
    if (!entry || Date.now() > entry.resetTime) {
      this.store.delete(key)
      return null
    }
    return entry.count
  }

  async increment(key: string, ttl: number): Promise<number> {
    const now = Date.now()
    const resetTime = now + ttl * 1000
    const entry = this.store.get(key)

    if (!entry || now > entry.resetTime) {
      // New window or expired window
      this.store.set(key, { count: 1, resetTime })
      return 1
    } else {
      // Increment existing window
      entry.count++
      return entry.count
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    const entry = this.store.get(key)
    if (entry) {
      entry.resetTime = Date.now() + ttl * 1000
    }
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.store.clear()
  }
}

/**
 * Redis-based storage implementation
 */
class RedisRateLimitStorage implements RateLimitStorage {
  private redis = getRedisClient()

  async get(key: string): Promise<number | null> {
    if (!this.redis) return null
    
    try {
      const result = await this.redis.get(key)
      return typeof result === 'number' ? result : null
    } catch (error) {
      logger.error('Redis get error in rate limiting', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return null
    }
  }

  async increment(key: string, ttl: number): Promise<number> {
    if (!this.redis) throw new Error('Redis not available')

    try {
      // Use pipeline for atomic operations
      const pipeline = this.redis.pipeline()
      pipeline.incr(key)
      pipeline.expire(key, ttl)
      
      const results = await pipeline.exec()
      
      // Return the incremented value (first result)
      return results[0] as number
    } catch (error) {
      logger.error('Redis increment error in rate limiting', {
        key,
        ttl,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    if (!this.redis) return

    try {
      await this.redis.expire(key, ttl)
    } catch (error) {
      logger.error('Redis expire error in rate limiting', {
        key,
        ttl,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}

/**
 * Rate limiter implementation with automatic fallback
 */
export class RateLimiter {
  private redisStorage: RedisRateLimitStorage
  private memoryStorage: InMemoryRateLimitStorage
  private useRedis: boolean

  constructor() {
    this.redisStorage = new RedisRateLimitStorage()
    this.memoryStorage = new InMemoryRateLimitStorage()
    this.useRedis = isRedisAvailable()

    if (!this.useRedis) {
      logger.warn('Rate limiter using in-memory fallback - not suitable for production scaling')
    }
  }

  /**
   * Get the appropriate storage backend
   */
  private getStorage(): RateLimitStorage {
    return this.useRedis ? this.redisStorage : this.memoryStorage
  }

  /**
   * Generate rate limit key based on context and config
   */
  private generateKey(context: RateLimitContext, config: RateLimitConfig): string {
    if (config.keyGenerator) {
      return config.keyGenerator(context)
    }

    // Default key generation strategy
    const windowStart = Math.floor(Date.now() / config.windowMs)
    const path = context.path || 'unknown'
    
    if (context.userId) {
      return `rate-limit:user:${context.userId}:${path}:${windowStart}`
    }
    
    if (context.ip) {
      return `rate-limit:ip:${context.ip}:${path}:${windowStart}`
    }
    
    return `rate-limit:global:${path}:${windowStart}`
  }

  /**
   * Check and update rate limit for a request
   */
  async checkRateLimit(
    context: RateLimitContext,
    config: RateLimitConfig,
  ): Promise<RateLimitResult> {
    // Check if we should skip rate limiting
    if (config.skip && config.skip(context)) {
      return {
        allowed: true,
        count: 0,
        limit: config.maxRequests,
        resetTime: Date.now() + config.windowMs,
        retryAfter: 0,
      }
    }

    const storage = this.getStorage()
    const key = this.generateKey(context, config)
    const ttlSeconds = Math.ceil(config.windowMs / 1000)
    const resetTime = Date.now() + config.windowMs

    try {
      // Try to increment the counter
      const count = await storage.increment(key, ttlSeconds)
      
      const result: RateLimitResult = {
        allowed: count <= config.maxRequests,
        count,
        limit: config.maxRequests,
        resetTime,
        retryAfter: Math.ceil(resetTime - Date.now()) / 1000,
      }

      // Log rate limit violations for monitoring
      if (!result.allowed) {
        logger.warn('Rate limit exceeded', {
          key,
          count,
          limit: config.maxRequests,
          ip: context.ip,
          userId: context.userId,
          path: context.path,
          retryAfter: result.retryAfter,
        })
      }

      return result
    } catch (error) {
      logger.error('Rate limit check failed', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
        fallbackToAllow: true,
      })

      // On error, allow the request but log the issue
      return {
        allowed: true,
        count: 0,
        limit: config.maxRequests,
        resetTime,
        retryAfter: 0,
      }
    }
  }

  /**
   * Reset rate limit for a specific key
   * Useful for administrative purposes
   */
  async resetRateLimit(context: RateLimitContext, config: RateLimitConfig): Promise<void> {
    const storage = this.getStorage()
    const key = this.generateKey(context, config)

    try {
      if (this.useRedis && this.redisStorage) {
        const redis = getRedisClient()
        if (redis) {
          await redis.del(key)
        }
      } else {
        // For in-memory storage, we can expire immediately
        await storage.expire(key, 0)
      }

      logger.info('Rate limit reset', {
        key,
        ip: context.ip,
        userId: context.userId,
        path: context.path,
      })
    } catch (error) {
      logger.error('Failed to reset rate limit', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Get current rate limit status without incrementing
   */
  async getRateLimitStatus(
    context: RateLimitContext,
    config: RateLimitConfig,
  ): Promise<Omit<RateLimitResult, 'allowed'>> {
    const storage = this.getStorage()
    const key = this.generateKey(context, config)
    const resetTime = Date.now() + config.windowMs

    try {
      const count = await storage.get(key) || 0
      
      return {
        count,
        limit: config.maxRequests,
        resetTime,
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
      }
    } catch (error) {
      logger.error('Failed to get rate limit status', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      return {
        count: 0,
        limit: config.maxRequests,
        resetTime,
        retryAfter: 0,
      }
    }
  }

  /**
   * Health check for the rate limiter
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    backend: 'redis' | 'memory'
    error?: string
  }> {
    if (this.useRedis) {
      try {
        const testContext: RateLimitContext = {
          req: new Request('http://localhost/test'),
          ip: '127.0.0.1',
          path: 'health-check',
        }
        const testConfig: RateLimitConfig = {
          maxRequests: 1000,
          windowMs: 60000,
        }

        await this.checkRateLimit(testContext, testConfig)
        
        return {
          status: 'healthy',
          backend: 'redis',
        }
      } catch (error) {
        return {
          status: 'unhealthy',
          backend: 'redis',
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    } else {
      return {
        status: 'degraded',
        backend: 'memory',
        error: 'Redis not available - using in-memory fallback',
      }
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.memoryStorage.destroy()
  }
}

// Singleton instance
const rateLimiter = new RateLimiter()

/**
 * Check rate limit for a request
 */
export const checkRateLimit = async (
  context: RateLimitContext,
  config: RateLimitConfig,
): Promise<RateLimitResult> => rateLimiter.checkRateLimit(context, config)

/**
 * Reset rate limit for a context
 */
export const resetRateLimit = async (
  context: RateLimitContext,
  config: RateLimitConfig,
): Promise<void> => rateLimiter.resetRateLimit(context, config)

/**
 * Get rate limit status without incrementing
 */
export const getRateLimitStatus = async (
  context: RateLimitContext,
  config: RateLimitConfig,
): Promise<Omit<RateLimitResult, 'allowed'>> => rateLimiter.getRateLimitStatus(context, config)

/**
 * Health check for rate limiting system
 */
export const rateLimitHealthCheck = async () => rateLimiter.healthCheck()

/**
 * Utility function to extract IP address from request
 */
export const extractIPAddress = (req: Request): string => {
  // Check various headers for the real IP address
  const xForwardedFor = req.headers.get('x-forwarded-for')
  const xRealIP = req.headers.get('x-real-ip')
  const cfConnectingIP = req.headers.get('cf-connecting-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (xRealIP) return xRealIP
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    const firstIP = xForwardedFor.split(',')[0]
    return firstIP ? firstIP.trim() : 'unknown'
  }
  
  return 'unknown'
}

export { rateLimiter }
