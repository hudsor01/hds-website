import { Redis } from '@upstash/redis'
import { logger } from '@/lib/logger'

/**
 * Redis Configuration for Rate Limiting
 * 
 * Initializes and manages the Redis connection for rate limiting.
 * Uses Upstash Redis for optimal Vercel integration.
 * 
 * Architecture decisions:
 * - Upstash Redis: Edge-optimized, serverless-friendly
 * - Connection pooling: Handled automatically by Upstash client
 * - Error handling: Graceful degradation if Redis unavailable
 * - Fallback: In-memory rate limiting as backup
 */

class RedisManager {
  private redis: Redis | null = null
  private isInitialized = false
  private connectionError: Error | null = null

  constructor() {
    this.initializeRedis()
  }

  private initializeRedis(): void {
    try {
      const redisUrl = process.env.UPSTASH_REDIS_REST_URL
      const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

      if (!redisUrl || !redisToken) {
        logger.warn('Redis configuration missing - rate limiting will use in-memory fallback', {
          hasUrl: !!redisUrl,
          hasToken: !!redisToken,
        })
        return
      }

      this.redis = new Redis({
        url: redisUrl,
        token: redisToken,
      })

      this.isInitialized = true
      logger.info('Redis connection initialized for rate limiting')
    } catch (error) {
      this.connectionError = error instanceof Error ? error : new Error('Unknown Redis initialization error')
      logger.error('Failed to initialize Redis connection', {
        error: this.connectionError.message,
      })
    }
  }

  /**
   * Get Redis client instance
   * Returns null if Redis is not available
   */
  getClient(): Redis | null {
    return this.redis
  }

  /**
   * Check if Redis is available and connected
   */
  isAvailable(): boolean {
    return this.isInitialized && this.redis !== null
  }

  /**
   * Get connection status information
   */
  getStatus(): {
    connected: boolean
    error: string | null
    fallbackMode: boolean
  } {
    return {
      connected: this.isAvailable(),
      error: this.connectionError?.message || null,
      fallbackMode: !this.isAvailable(),
    }
  }

  /**
   * Test Redis connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.redis) return false

    try {
      const testKey = `rate-limit:test:${Date.now()}`
      await this.redis.set(testKey, 'test', { ex: 1 })
      const result = await this.redis.get(testKey)
      await this.redis.del(testKey)
      
      return result === 'test'
    } catch (error) {
      logger.error('Redis connection test failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return false
    }
  }

  /**
   * Health check for monitoring
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    latency?: number
    error?: string
  }> {
    if (!this.redis) {
      return {
        status: 'degraded',
        error: 'Redis not configured - using fallback',
      }
    }

    try {
      const start = Date.now()
      const connected = await this.testConnection()
      const latency = Date.now() - start

      if (connected) {
        return {
          status: latency < 100 ? 'healthy' : 'degraded',
          latency,
        }
      } else {
        return {
          status: 'unhealthy',
          error: 'Connection test failed',
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

// Singleton instance
const redisManager = new RedisManager()

/**
 * Get Redis client for rate limiting
 * Returns null if Redis is not available (fallback to in-memory)
 */
export const getRedisClient = (): Redis | null => redisManager.getClient()

/**
 * Check if Redis is available
 */
export const isRedisAvailable = (): boolean => redisManager.isAvailable()

/**
 * Get Redis connection status
 */
export const getRedisStatus = () => redisManager.getStatus()

/**
 * Test Redis connection
 */
export const testRedisConnection = async (): Promise<boolean> => redisManager.testConnection()

/**
 * Health check for monitoring
 */
export const redisHealthCheck = async () => redisManager.healthCheck()

/**
 * Redis key generators for different rate limiting scenarios
 */
export const generateRateLimitKey = (prefix: string, identifier: string, window?: string): string => {
  const timestamp = window || Math.floor(Date.now() / 60000) // 1-minute windows by default
  return `rate-limit:${prefix}:${identifier}:${timestamp}`
}

export const generateUserRateLimitKey = (userId: string, operation: string): string => generateRateLimitKey('user', `${userId}:${operation}`)

export const generateIPRateLimitKey = (ip: string, operation: string): string => generateRateLimitKey('ip', `${ip}:${operation}`)

export const generateGlobalRateLimitKey = (operation: string): string => generateRateLimitKey('global', operation)
