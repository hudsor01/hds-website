import type { NextRequest } from 'next/server';
import type { RateLimitEntry } from '@/types/api';

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
} as const;

export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS;

export class UnifiedRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Check rate limit for a specific identifier and configuration
   */
  async checkLimit(
    identifier: string,
    limitType: RateLimitType = 'default'
  ): Promise<boolean> {
    const config = RATE_LIMIT_CONFIGS[limitType];
    return this._checkLimit(identifier, config.maxRequests, config.windowMs);
  }

  /**
   * Check rate limit with custom parameters
   */
  async _checkLimit(
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
  getLimitInfo(identifier: string, limitType: RateLimitType = 'default'): { 
    remaining: number; 
    resetTime: number; 
    isLimited: boolean 
  } {
    const config = RATE_LIMIT_CONFIGS[limitType];
    const now = Date.now();
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