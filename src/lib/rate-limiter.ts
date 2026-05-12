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
 * Check rate limit using Upstash Redis when available, falling back to in-memory store.
 * Returns true if the request is allowed, false if rate limited.
 */
async function checkWithRedis(
	key: string,
	maxRequests: number,
	windowSeconds: number
): Promise<boolean | null> {
	const url = env.UPSTASH_REDIS_REST_URL
	const token = env.UPSTASH_REDIS_REST_TOKEN
	if (!url || !token) {
		return null
	}
	try {
		const { Redis } = await import('@upstash/redis')
		const redis = new Redis({ url, token })
		const current = await redis.incr(key)
		await redis.expire(key, windowSeconds) // Always refresh TTL — idempotent
		return current <= maxRequests
	} catch {
		// Redis not configured at runtime — caller falls through to in-memory store
		return null
	}
}

/**
 * Distributed rate limiter using Upstash Redis with in-memory fallback.
 * Replaces the previous in-process Map store which did not work across
 * multiple serverless instances.
 */
export class UnifiedRateLimiter {
	private store: Map<string, RateLimitEntry> = new Map()
	// `ReturnType<typeof setInterval>` is portable across DOM/Node/Edge
	// — the previous `NodeJS.Timeout` only resolved correctly because
	// @types/node was implicitly in scope. Edge runtime would have
	// surfaced this as `any` without that implicit include.
	private cleanupInterval: ReturnType<typeof setInterval> | null = null
	private useRedis: boolean

	constructor() {
		// Use Upstash Redis when env vars are present (production/preview), fall back to in-memory
		this.useRedis = !!(
			env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
		)
		if (!this.useRedis) {
			this.initializeInMemory()
		} else {
			logger.info('Distributed rate limiter initialized (Upstash Redis)')
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

		if (this.useRedis) {
			const redisResult = await checkWithRedis(
				key,
				config.maxRequests,
				windowSeconds
			)
			if (redisResult !== null) {
				return redisResult
			}
			// Redis failed at runtime — fall through to in-memory
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
