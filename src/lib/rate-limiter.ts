import { env } from '@/env'
import type { RateLimitEntry } from '@/types/api'
import { logger } from './logger'

// Configuration for different rate limiting needs
export const RATE_LIMIT_CONFIGS = {
	default: {
		windowMs: 60 * 1000, // 1 minute
		maxRequests: 100 // 100 requests per minute
	},
	api: {
		windowMs: 60 * 1000, // 1 minute
		maxRequests: 60 // 60 requests per minute
	},
	contactForm: {
		windowMs: 15 * 60 * 1000, // 15 minutes
		maxRequests: 3 // 3 submissions per 15 minutes
	},
	contactFormApi: {
		windowMs: 60 * 1000, // 1 minute
		maxRequests: 5 // 5 requests per minute
	},
	pagespeedApi: {
		windowMs: 60 * 1000, // 1 minute
		maxRequests: 10 // 10 requests per minute
	},
	newsletter: {
		windowMs: 60 * 1000, // 1 minute
		maxRequests: 3 // 3 newsletter signups per minute
	},
	readOnlyApi: {
		windowMs: 60 * 1000, // 1 minute
		maxRequests: 100 // 100 read requests per minute (for testimonials, portfolio, etc.)
	}
} as const

export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS

/**
 * Check rate limit using @vercel/kv when available, falling back to in-memory store.
 * Returns true if the request is allowed, false if rate limited.
 */
async function checkWithKv(
	key: string,
	maxRequests: number,
	windowSeconds: number
): Promise<boolean> {
	try {
		const { kv } = await import('@vercel/kv')
		const current = await kv.incr(key)
		await kv.expire(key, windowSeconds) // Always refresh TTL — idempotent
		return current <= maxRequests
	} catch {
		// KV not configured (local dev) — fall through to in-memory
		return null as unknown as boolean
	}
}

/**
 * Distributed rate limiter using @vercel/kv with in-memory fallback.
 * Replaces the previous in-process Map store which did not work across
 * multiple serverless instances.
 */
export class UnifiedRateLimiter {
	private store: Map<string, RateLimitEntry> = new Map()
	private cleanupInterval: NodeJS.Timeout | null = null
	private useKv: boolean

	constructor() {
		// Use KV when env vars are present (production/preview), fall back to in-memory
		this.useKv = !!(env.KV_REST_API_URL && env.KV_REST_API_TOKEN)
		if (!this.useKv) {
			this.initializeInMemory()
		} else {
			logger.info('Distributed rate limiter initialized (Vercel KV)')
		}
	}

	private initializeInMemory() {
		// Clean up expired entries every minute
		this.cleanupInterval = setInterval(() => {
			this.cleanup()
		}, 60000)

		// Ensure cleanup on process exit
		if (typeof process !== 'undefined') {
			process.on('beforeExit', () => {
				this.destroy()
			})
		}

		logger.info('In-memory rate limiter initialized')
	}

	/**
	 * Build a namespaced key for rate limiting
	 */
	private buildKey(identifier: string, limitType: RateLimitType): string {
		return `rl:${limitType}:${identifier}`
	}

	/**
	 * Check rate limit for a specific identifier and configuration
	 */
	async checkLimit(
		identifier: string,
		limitType: RateLimitType = 'default'
	): Promise<boolean> {
		const config = RATE_LIMIT_CONFIGS[limitType]
		const key = this.buildKey(identifier, limitType)
		const windowSeconds = Math.ceil(config.windowMs / 1000)

		if (this.useKv) {
			const kvResult = await checkWithKv(key, config.maxRequests, windowSeconds)
			if (kvResult !== null) {
				return kvResult
			}
			// KV failed at runtime — fall through to in-memory
		}

		return this._checkLimitInMemory(key, config.maxRequests, config.windowMs)
	}

	/**
	 * Check rate limit with in-memory store
	 */
	private _checkLimitInMemory(
		identifier: string,
		maxRequests: number,
		windowMs: number
	): boolean {
		const now = Date.now()
		const entry = this.store.get(identifier)

		if (!entry || now > entry.resetTime) {
			// Create new entry or reset expired one
			this.store.set(identifier, {
				count: 1,
				resetTime: now + windowMs
			})
			return true
		}

		if (entry.count >= maxRequests) {
			return false
		}

		// Increment count
		entry.count++
		this.store.set(identifier, entry)
		return true
	}

	/**
	 * Get rate limit information for a specific identifier
	 */
	async getLimitInfo(
		identifier: string,
		limitType: RateLimitType = 'default'
	): Promise<{
		remaining: number
		resetTime: number
		isLimited: boolean
	}> {
		const config = RATE_LIMIT_CONFIGS[limitType]
		const now = Date.now()
		const key = this.buildKey(identifier, limitType)

		const entry = this.store.get(key)

		if (!entry || now > entry.resetTime) {
			return {
				remaining: config.maxRequests,
				resetTime: now + config.windowMs,
				isLimited: false
			}
		}

		const remaining = Math.max(0, config.maxRequests - entry.count)
		return {
			remaining,
			resetTime: entry.resetTime,
			isLimited: entry.count >= config.maxRequests
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
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval)
			this.cleanupInterval = null
		}
		this.store.clear()
	}
}

// Lazy singleton factory — avoids side-effects during module import
let _unifiedRateLimiter: UnifiedRateLimiter | null = null

export function getUnifiedRateLimiter(): UnifiedRateLimiter {
	if (!_unifiedRateLimiter) {
		_unifiedRateLimiter = new UnifiedRateLimiter()
	}
	return _unifiedRateLimiter
}

// Legacy export for backwards compatibility (lazy initialized)
export const unifiedRateLimiter = {
	checkLimit: (identifier: string, limitType?: RateLimitType) =>
		getUnifiedRateLimiter().checkLimit(identifier, limitType),
	getLimitInfo: (identifier: string, limitType?: RateLimitType) =>
		getUnifiedRateLimiter().getLimitInfo(identifier, limitType),
	destroy: () => getUnifiedRateLimiter().destroy()
}

// Re-export getClientIp from centralized location for backwards compatibility
export { getClientIp } from './request'
