import { afterEach, beforeEach, describe, expect, it, mock, vi } from 'bun:test'
import type { NextRequest } from 'next/server'
import {
	RATE_LIMIT_CONFIGS,
	type RateLimitType,
	UnifiedRateLimiter
} from '@/lib/rate-limiter'
import { getClientIp } from '@/lib/request'

// Live handle to the shared TEST_ENV from tests/setup.ts. Mutating it flips
// UPSTASH_* on/off for the rate-limiter's constructor without re-registering
// @/env (which would unbind already-captured `import { env }` references).
const testEnv = (
	globalThis as unknown as { __TEST_ENV: Record<string, unknown> }
).__TEST_ENV

// The BUG-02 tests below exercise the REAL UnifiedRateLimiter internals
// (private store pruning, the @upstash/redis call sequence). Sibling suites
// that call setupApiMocks() register a process-global mock.module(
// '@/lib/rate-limiter', ...) that replaces the class with a mock lacking those
// internals, and that registration is never unregistered (oven-sh/bun#7823).
// A unique query-string specifier is a distinct module key in bun, so it
// bypasses the alias mock and forces a FRESH eval of the real, lightweight
// source (env + logger only; @upstash/redis is a dynamic import we still
// stub via the alias). Order-independent.
const REAL_RATE_LIMITER_SPECIFIER = new URL(
	'../../src/lib/rate-limiter.ts',
	import.meta.url
).pathname

async function loadRealRateLimiterClass(): Promise<
	typeof UnifiedRateLimiter
> {
	const mod = (await import(
		`${REAL_RATE_LIMITER_SPECIFIER}?fresh=${Date.now()}-${Math.random()}`
	)) as { UnifiedRateLimiter: typeof UnifiedRateLimiter }
	return mod.UnifiedRateLimiter
}

describe('UnifiedRateLimiter', () => {
	let limiter: UnifiedRateLimiter

	beforeEach(() => {
		limiter = new UnifiedRateLimiter()
	})

	afterEach(() => {
		limiter.destroy()
	})

	describe('checkLimit with default config', () => {
		it('allows requests under the limit', async () => {
			const identifier = 'test-user-1'
			const config = RATE_LIMIT_CONFIGS.default

			// Should allow first request
			const result1 = await limiter.checkLimit(identifier, 'default')
			expect(result1).toBe(true)

			// Should allow subsequent requests under limit
			for (let i = 0; i < config.maxRequests - 2; i++) {
				const result = await limiter.checkLimit(identifier, 'default')
				expect(result).toBe(true)
			}
		})

		it('blocks requests over the limit', async () => {
			const identifier = 'test-user-2'
			const config = RATE_LIMIT_CONFIGS.default

			// Exhaust the limit
			for (let i = 0; i < config.maxRequests; i++) {
				await limiter.checkLimit(identifier, 'default')
			}

			// Next request should be blocked
			const blockedResult = await limiter.checkLimit(identifier, 'default')
			expect(blockedResult).toBe(false)
		})

		it('resets count after window expires', async () => {
			const identifier = 'test-user-3'
			const config = RATE_LIMIT_CONFIGS.default

			// Exhaust the limit
			for (let i = 0; i < config.maxRequests; i++) {
				await limiter.checkLimit(identifier, 'default')
			}

			// Should be blocked
			expect(await limiter.checkLimit(identifier, 'default')).toBe(false)

			// Mock time advancing past the window
			vi.useFakeTimers()
			vi.advanceTimersByTime(config.windowMs + 1000)

			// Should allow again after window expires
			const result = await limiter.checkLimit(identifier, 'default')
			expect(result).toBe(true)

			vi.useRealTimers()
		})
	})

	describe('checkLimit with contact form config', () => {
		it('enforces stricter limits for contact form', async () => {
			const identifier = 'test-user-4'
			const config = RATE_LIMIT_CONFIGS.contactForm

			// Should allow up to maxRequests
			for (let i = 0; i < config.maxRequests; i++) {
				const result = await limiter.checkLimit(identifier, 'contactForm')
				expect(result).toBe(true)
			}

			// Should block after maxRequests
			const blockedResult = await limiter.checkLimit(identifier, 'contactForm')
			expect(blockedResult).toBe(false)
		})
	})

	describe('checkLimit with different limit types', () => {
		it('isolates limits between different types', async () => {
			const identifier = 'test-user-5'

			// Exhaust default limit
			const defaultConfig = RATE_LIMIT_CONFIGS.default
			for (let i = 0; i < defaultConfig.maxRequests; i++) {
				await limiter.checkLimit(identifier, 'default')
			}

			// Default should be blocked
			expect(await limiter.checkLimit(identifier, 'default')).toBe(false)

			// Newsletter limit should still allow requests
			expect(await limiter.checkLimit(identifier, 'newsletter')).toBe(true)

			// Contact form limit should still allow requests
			expect(await limiter.checkLimit(identifier, 'contactForm')).toBe(true)
		})
	})

	describe('getLimitInfo', () => {
		it('returns correct remaining count', async () => {
			const identifier = 'test-user-6'
			const config = RATE_LIMIT_CONFIGS.api

			// Check initial state
			const info1 = await limiter.getLimitInfo(identifier, 'api')
			expect(info1.remaining).toBe(config.maxRequests)
			expect(info1.isLimited).toBe(false)

			// Make some requests
			await limiter.checkLimit(identifier, 'api')
			await limiter.checkLimit(identifier, 'api')

			const info2 = await limiter.getLimitInfo(identifier, 'api')
			expect(info2.remaining).toBe(config.maxRequests - 2)
			expect(info2.isLimited).toBe(false)

			// Exhaust limit
			for (let i = 0; i < config.maxRequests - 2; i++) {
				await limiter.checkLimit(identifier, 'api')
			}

			const info3 = await limiter.getLimitInfo(identifier, 'api')
			expect(info3.remaining).toBe(0)
			expect(info3.isLimited).toBe(true)
		})

		it('returns correct reset time', async () => {
			const identifier = 'test-user-7'
			const config = RATE_LIMIT_CONFIGS.api
			const beforeTime = Date.now()

			await limiter.checkLimit(identifier, 'api')

			const info = await limiter.getLimitInfo(identifier, 'api')

			// Reset time should be approximately windowMs from now
			const expectedResetTime = beforeTime + config.windowMs
			expect(info.resetTime).toBeGreaterThanOrEqual(expectedResetTime - 100)
			expect(info.resetTime).toBeLessThanOrEqual(expectedResetTime + 100)
		})

		it('returns fresh info for expired entry', async () => {
			const identifier = 'test-user-8'
			const config = RATE_LIMIT_CONFIGS.newsletter

			// Make a request
			await limiter.checkLimit(identifier, 'newsletter')

			// Mock time advancing past window
			vi.useFakeTimers()
			vi.advanceTimersByTime(config.windowMs + 1000)

			const info = await limiter.getLimitInfo(identifier, 'newsletter')
			expect(info.remaining).toBe(config.maxRequests)
			expect(info.isLimited).toBe(false)

			vi.useRealTimers()
		})
	})

	// Note: Tests for internal cleanup mechanisms removed
	// The cleanup functionality is already verified through public API tests:
	// - "resets count after window expires" verifies expired entries are handled correctly
	// - "returns fresh info for expired entry" verifies getLimitInfo handles expired entries
	// - afterEach() calls destroy() to ensure cleanup runs in all tests

	describe('all rate limit types', () => {
		const limitTypes: RateLimitType[] = [
			'default',
			'api',
			'contactForm',
			'contactFormApi',
			'newsletter',
			'readOnlyApi'
		]

		limitTypes.forEach(limitType => {
			it(`enforces ${limitType} rate limit correctly`, async () => {
				const identifier = `test-user-${limitType}`
				const config = RATE_LIMIT_CONFIGS[limitType]

				// Allow up to max
				for (let i = 0; i < config.maxRequests; i++) {
					const result = await limiter.checkLimit(identifier, limitType)
					expect(result).toBe(true)
				}

				// Block after max
				const blocked = await limiter.checkLimit(identifier, limitType)
				expect(blocked).toBe(false)
			})
		})
	})
})

describe('BUG-02 in-memory fallback is bounded (lazy prune)', () => {
	afterEach(() => {
		// Ensure UPSTASH stays unset so other suites keep in-memory mode.
		testEnv.UPSTASH_REDIS_REST_URL = undefined
		testEnv.UPSTASH_REDIS_REST_TOKEN = undefined
		vi.useRealTimers()
	})

	it('evicts expired entries from the private store on every checkLimit (does not grow unbounded)', async () => {
		// In-memory mode (no UPSTASH env). The defect: under a runtime Redis
		// outage checkLimit falls through to _checkLimitInMemory, which never
		// pruned entries it did not touch -> store grew unbounded. The fix
		// prunes expired entries on every call.
		const RealLimiter = await loadRealRateLimiterClass()
		const limiter = new RealLimiter()
		const store = (
			limiter as unknown as { store: Map<string, unknown> }
		).store

		const config = RATE_LIMIT_CONFIGS.contactForm

		// Seed several distinct keys (each creates a store entry).
		for (let i = 0; i < 5; i++) {
			await limiter.checkLimit(`stale-user-${i}`, 'contactForm')
		}
		expect(store.size).toBe(5)

		// Advance time past the window so every seeded entry is expired.
		vi.useFakeTimers()
		vi.advanceTimersByTime(config.windowMs + 1000)

		// A single fresh key triggers a prune of all expired entries.
		await limiter.checkLimit('fresh-user', 'contactForm')

		// Only the live key remains; the 5 expired entries were evicted.
		expect(store.size).toBe(1)

		limiter.destroy()
	})
})

describe('BUG-02 Redis count+TTL is atomic', () => {
	let callOrder: string[]

	beforeEach(() => {
		callOrder = []
		// Turn on Redis mode for the constructor.
		testEnv.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io'
		testEnv.UPSTASH_REDIS_REST_TOKEN = 'test-token'

		// Stub the dynamic `@upstash/redis` import. Record the exact command
		// sequence the limiter issues so we can prove the TTL is established
		// atomically with the first write (SET NX EX) rather than via a
		// separate, race-prone expire() after incr().
		mock.module('@upstash/redis', () => ({
			Redis: class {
				async set(
					_key: string,
					_value: number,
					opts: { nx?: boolean; ex?: number }
				) {
					callOrder.push(
						`set:nx=${opts?.nx ? 1 : 0}:ex=${opts?.ex ?? 0}`
					)
					return 'OK'
				}
				async incr(_key: string) {
					callOrder.push('incr')
					return 1
				}
				async expire() {
					callOrder.push('expire')
					return 1
				}
			}
		}))
	})

	afterEach(() => {
		testEnv.UPSTASH_REDIS_REST_URL = undefined
		testEnv.UPSTASH_REDIS_REST_TOKEN = undefined
		mock.restore()
	})

	it('establishes the TTL with the first write (SET NX EX) then INCR, never bare incr+expire', async () => {
		const RealLimiter = await loadRealRateLimiterClass()
		const limiter = new RealLimiter()
		const allowed = await limiter.checkLimit('redis-user', 'contactForm')

		// Behavior unchanged for callers: first request under the limit -> true.
		expect(allowed).toBe(true)

		// The atomic primitive: SET key 0 NX EX window, THEN INCR.
		expect(callOrder[0]).toBe(
			`set:nx=1:ex=${Math.ceil(RATE_LIMIT_CONFIGS.contactForm.windowMs / 1000)}`
		)
		expect(callOrder[1]).toBe('incr')
		// The non-atomic standalone expire() must NOT be used.
		expect(callOrder).not.toContain('expire')

		limiter.destroy()
	})
})

describe('getClientIp', () => {
	it('extracts IP from x-forwarded-for header (rightmost = trusted hop)', () => {
		// Vercel appends the real client IP to X-Forwarded-For; the leftmost
		// entry is attacker-controlled. Trust the rightmost.
		const request = {
			headers: {
				get: (name: string) => {
					if (name === 'x-forwarded-for') {
						return '203.0.113.1, 198.51.100.1'
					}
					return null
				}
			}
		} as unknown as NextRequest

		const ip = getClientIp(request)
		expect(ip).toBe('198.51.100.1')
	})

	it('extracts IP from x-real-ip header if x-forwarded-for is absent', () => {
		const request = {
			headers: {
				get: (name: string) => {
					if (name === 'x-real-ip') {
						return '192.0.2.1'
					}
					return null
				}
			}
		} as unknown as NextRequest

		const ip = getClientIp(request)
		expect(ip).toBe('192.0.2.1')
	})

	it('returns localhost when no IP headers are present', () => {
		const request = {
			headers: {
				get: () => null
			}
		} as unknown as NextRequest

		const ip = getClientIp(request)
		expect(ip).toBe('127.0.0.1')
	})

	it('handles x-forwarded-for with whitespace (returns rightmost trimmed)', () => {
		const request = {
			headers: {
				get: (name: string) => {
					if (name === 'x-forwarded-for') {
						return '  192.0.2.1  , 198.51.100.1'
					}
					return null
				}
			}
		} as unknown as NextRequest

		const ip = getClientIp(request)
		expect(ip).toBe('198.51.100.1')
	})

	it('handles x-real-ip with whitespace', () => {
		const request = {
			headers: {
				get: (name: string) => {
					if (name === 'x-real-ip') {
						return '  192.0.2.1  '
					}
					return null
				}
			}
		} as unknown as NextRequest

		const ip = getClientIp(request)
		expect(ip).toBe('192.0.2.1')
	})

	it('falls back to localhost if x-forwarded-for is empty after split', () => {
		const request = {
			headers: {
				get: (name: string) => {
					if (name === 'x-forwarded-for') {
						return ''
					}
					return null
				}
			}
		} as unknown as NextRequest

		const ip = getClientIp(request)
		expect(ip).toBe('127.0.0.1')
	})
})
