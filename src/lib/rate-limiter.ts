import { env } from '@/env'
import type { RateLimitEntry } from '@/types/api'
import type { NextRequest } from 'next/server'
import { logger } from './logger'

// Configuration for different rate limiting needs
export const RATE_LIMIT_CONFIGS = {
  default: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },
  contactForm: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 3, // 3 submissions per 15 minutes
  },
  contactFormApi: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 requests per minute
  },
  newsletter: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 3, // 3 newsletter signups per minute
  },
  readOnlyApi: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 read requests per minute (for testimonials, portfolio, etc.)
  },
} as const;

export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS;

/**
 * Distributed rate limiter using Vercel KV
 * Falls back to in-memory store for local development
 */
export class UnifiedRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private useKV: boolean = false;
  private kv: any = null;

  constructor() {
    // Initialize Vercel KV if available
    if (env.KV_REST_API_URL && env.KV_REST_API_TOKEN) {
      this.initializeKV();
    } else {
      logger.info('KV not configured, using in-memory rate limiter (local dev only)');
      this.initializeInMemory();
    }
  }

  private async initializeKV() {
    try {
      const kvModule = await import('@vercel/kv');
      this.kv = kvModule.kv;
      this.useKV = true;
      logger.info('Distributed rate limiter initialized with Vercel KV');
    } catch (error) {
      logger.error('Failed to initialize Vercel KV, falling back to in-memory', error as Error);
      this.initializeInMemory();
    }
  }

  private initializeInMemory() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);

    // Ensure cleanup on process exit
    if (typeof process !== 'undefined') {
      process.on('beforeExit', () => {
        this.destroy();
      });
    }
  }

  /**
   * Check rate limit for a specific identifier and configuration
   */
  async checkLimit(
    identifier: string,
    limitType: RateLimitType = 'default'
  ): Promise<boolean> {
    const config = RATE_LIMIT_CONFIGS[limitType];

    if (this.useKV && this.kv) {
      return this.checkLimitKV(identifier, config.maxRequests, config.windowMs);
    }

    return this._checkLimit(identifier, config.maxRequests, config.windowMs);
  }

  /**
   * Check rate limit using Vercel KV (distributed)
   */
  private async checkLimitKV(
    identifier: string,
    maxRequests: number,
    windowMs: number
  ): Promise<boolean> {
    if (!this.kv) return false;

    const now = Date.now();
    const key = `ratelimit:${identifier}`;

    try {
      // Get current count and reset time
      const data = await this.kv.get(key);
      const typedData = data as RateLimitEntry | null;

      if (!typedData || now > typedData.resetTime) {
        // Create new entry or reset expired one
        const newEntry: RateLimitEntry = {
          count: 1,
          resetTime: now + windowMs,
        };
        // Set with TTL to auto-expire
        await this.kv.set(key, newEntry, {
          px: windowMs,
        });
        return true;
      }

      if (typedData.count >= maxRequests) {
        return false;
      }

      // Increment count atomically
      typedData.count++;
      const ttl = typedData.resetTime - now;
      await this.kv.set(key, typedData, {
        px: Math.max(ttl, 1000), // At least 1 second TTL
      });

      return true;
    } catch (error) {
      logger.error('KV rate limit check failed', error as Error);
      // Fail open in case of KV issues
      return true;
    }
  }

  /**
   * Check rate limit with in-memory store (fallback)
   */
  private async _checkLimit(
    identifier: string,
    maxRequests: number,
    windowMs: number
  ): Promise<boolean> {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired one
      this.store.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return true;
    }

    if (entry.count >= maxRequests) {
      return false;
    }

    // Increment count
    entry.count++;
    this.store.set(identifier, entry);
    return true;
  }

  /**
   * Get rate limit information for a specific identifier
   */
  async getLimitInfo(identifier: string, limitType: RateLimitType = 'default'): Promise<{
    remaining: number;
    resetTime: number;
    isLimited: boolean
  }> {
    const config = RATE_LIMIT_CONFIGS[limitType];
    const now = Date.now();

    if (this.useKV && this.kv) {
      return this.getLimitInfoKV(identifier, config.maxRequests, config.windowMs);
    }

    const entry = this.store.get(identifier);

    if (!entry || now > entry.resetTime) {
      return {
        remaining: config.maxRequests,
        resetTime: now + config.windowMs,
        isLimited: false
      };
    }

    const remaining = Math.max(0, config.maxRequests - entry.count);
    return {
      remaining,
      resetTime: entry.resetTime,
      isLimited: entry.count >= config.maxRequests
    };
  }

  /**
   * Get rate limit info from Vercel KV
   */
  private async getLimitInfoKV(
    identifier: string,
    maxRequests: number,
    windowMs: number
  ): Promise<{ remaining: number; resetTime: number; isLimited: boolean }> {
    if (!this.kv) {
      return {
        remaining: maxRequests,
        resetTime: Date.now() + windowMs,
        isLimited: false
      };
    }

    const now = Date.now();
    const key = `ratelimit:${identifier}`;

    try {
      const data = await this.kv.get(key);
      const typedData = data as RateLimitEntry | null;

      if (!typedData || now > typedData.resetTime) {
        return {
          remaining: maxRequests,
          resetTime: now + windowMs,
          isLimited: false
        };
      }

      const remaining = Math.max(0, maxRequests - typedData.count);
      return {
        remaining,
        resetTime: typedData.resetTime,
        isLimited: typedData.count >= maxRequests
      };
    } catch (error) {
      logger.error('Failed to get KV limit info', error as Error);
      return {
        remaining: maxRequests,
        resetTime: now + windowMs,
        isLimited: false
      };
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

// Singleton instance
export const unifiedRateLimiter = new UnifiedRateLimiter();

// Helper function to get client IP from NextRequest
export function getClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const ip = xff.split(',')[0]?.trim();
    if (ip) {
      return ip;
    }
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp?.trim()) {
    return realIp.trim();
  }

  return '127.0.0.1';
}
