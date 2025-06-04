import { z } from 'zod'

/**
 * Rate Limit Configuration Types
 * 
 * Centralized type definitions for Redis-based rate limiting system.
 * These types ensure type safety across the rate limiting implementation.
 */

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the time window */
  maxRequests: number
  /** Time window in milliseconds */
  windowMs: number
  /** Optional custom key generator function */
  keyGenerator?: (context: RateLimitContext) => string
  /** Optional custom error message */
  message?: string
  /** Skip rate limiting based on context */
  skip?: (context: RateLimitContext) => boolean
}

export interface RateLimitContext {
  /** HTTP Request object */
  req: Request
  /** User ID from authentication (if available) */
  userId?: string
  /** IP address of the client */
  ip?: string
  /** tRPC procedure path */
  path?: string
  /** User information from authentication */
  user?: {
    id: string
    email: string
    role: string
  }
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean
  /** Current request count in the window */
  count: number
  /** Maximum requests allowed */
  limit: number
  /** Time when the window resets (Unix timestamp) */
  resetTime: number
  /** Seconds until the window resets */
  retryAfter: number
}

export interface RateLimitStorage {
  /** Get current count for a key */
  get(key: string): Promise<number | null>
  /** Increment count for a key with expiration */
  increment(key: string, ttl: number): Promise<number>
  /** Set expiration for a key */
  expire(key: string, ttl: number): Promise<void>
}

/**
 * Rate Limit Strategy Types
 */
export type RateLimitStrategy = 
  | 'fixed-window'
  | 'sliding-window'
  | 'token-bucket'

/**
 * Predefined Rate Limit Configurations
 */
export const RATE_LIMIT_PRESETS = {
  /** Very restrictive - for sensitive operations */
  STRICT: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
  },
  /** Moderate - for general API usage */
  MODERATE: {
    maxRequests: 60,
    windowMs: 60 * 1000, // 1 minute
  },
  /** Lenient - for high-frequency operations */
  LENIENT: {
    maxRequests: 300,
    windowMs: 60 * 1000, // 1 minute
  },
  /** Contact forms - prevent spam */
  CONTACT_FORM: {
    maxRequests: 3,
    windowMs: 10 * 60 * 1000, // 10 minutes
  },
  /** Newsletter signup - prevent abuse */
  NEWSLETTER: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
  },
  /** Analytics tracking - high frequency allowed */
  ANALYTICS: {
    maxRequests: 1000,
    windowMs: 60 * 1000, // 1 minute
  },
  /** Admin operations - moderate restrictions */
  ADMIN: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
} as const

/**
 * Rate Limit Error Schema
 */
export const rateLimitErrorSchema = z.object({
  message: z.string(),
  code: z.literal('TOO_MANY_REQUESTS'),
  count: z.number(),
  limit: z.number(),
  resetTime: z.number(),
  retryAfter: z.number(),
})

export type RateLimitError = z.infer<typeof rateLimitErrorSchema>

/**
 * Rate Limit Metrics for Monitoring
 */
export interface RateLimitMetrics {
  /** Total requests processed */
  totalRequests: number
  /** Total requests blocked */
  blockedRequests: number
  /** Average requests per minute */
  avgRequestsPerMinute: number
  /** Top rate-limited IPs */
  topBlockedIPs: Array<{ ip: string; count: number }>
}
