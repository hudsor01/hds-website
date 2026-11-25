/**
 * Test Utilities
 * Shared mocking and setup utilities for test isolation
 */

import { mock } from 'bun:test'
import { cleanup } from '@testing-library/react'

/**
 * Create isolated mock instances for common dependencies
 * These should be set up in beforeEach hooks, not at module level
 */
function createMockRateLimiter() {
	return {
		checkLimit: mock().mockResolvedValue(true),
		getLimitInfo: mock().mockResolvedValue({ remaining: 10, isLimited: false }),
		destroy: mock()
	}
}

/**
 * Rate limit configurations matching the real module. Must mirror every
 * key in src/lib/rate-limiter.ts::RATE_LIMIT_CONFIGS — the mock class
 * uses `keyof typeof MOCK_RATE_LIMIT_CONFIGS` as its limit-type
 * constraint, so a missing key here would silently fall through to the
 * `default` profile if the real-module mock is ever bypassed.
 */
const MOCK_RATE_LIMIT_CONFIGS = {
	default: { windowMs: 60 * 1000, maxRequests: 100 },
	api: { windowMs: 60 * 1000, maxRequests: 60 },
	contactForm: { windowMs: 15 * 60 * 1000, maxRequests: 3 },
	contactFormApi: { windowMs: 60 * 1000, maxRequests: 5 },
	newsletter: { windowMs: 60 * 1000, maxRequests: 3 },
	readOnlyApi: { windowMs: 60 * 1000, maxRequests: 100 },
	pagespeedApi: { windowMs: 60 * 1000, maxRequests: 30 }
} as const

/**
 * Mock UnifiedRateLimiter class for testing
 * Implements actual rate limiting logic to support tests that verify limits
 */
function createMockUnifiedRateLimiterClass() {
	return class MockUnifiedRateLimiter {
		store = new Map<string, { count: number; resetTime: number }>()
		cleanupInterval: ReturnType<typeof setInterval> | null = null

		private buildKey(
			identifier: string,
			limitType: keyof typeof MOCK_RATE_LIMIT_CONFIGS
		): string {
			return `${limitType}:${identifier}`
		}

		async checkLimit(
			identifier: string,
			limitType: keyof typeof MOCK_RATE_LIMIT_CONFIGS = 'default'
		): Promise<boolean> {
			const config = MOCK_RATE_LIMIT_CONFIGS[limitType]
			const key = this.buildKey(identifier, limitType)
			const now = Date.now()
			const entry = this.store.get(key)

			if (!entry || now > entry.resetTime) {
				this.store.set(key, {
					count: 1,
					resetTime: now + config.windowMs
				})
				return true
			}

			if (entry.count >= config.maxRequests) {
				return false
			}

			entry.count++
			this.store.set(key, entry)
			return true
		}

		async getLimitInfo(
			identifier: string,
			limitType: keyof typeof MOCK_RATE_LIMIT_CONFIGS = 'default'
		): Promise<{
			remaining: number
			resetTime: number
			isLimited: boolean
		}> {
			const config = MOCK_RATE_LIMIT_CONFIGS[limitType]
			const key = this.buildKey(identifier, limitType)
			const now = Date.now()
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

		destroy(): void {
			if (this.cleanupInterval) {
				clearInterval(this.cleanupInterval)
				this.cleanupInterval = null
			}
			this.store.clear()
		}
	}
}

/**
 * Mock getClientIp function that mirrors the real implementation
 * (src/lib/request.ts). Trusts x-real-ip first, then the rightmost
 * x-forwarded-for entry — leftmost is attacker-controlled on Vercel.
 */
function createMockGetClientIp() {
	return (request: {
		headers: { get: (name: string) => string | null }
	}): string => {
		const realIp = request.headers.get('x-real-ip')
		if (realIp?.trim()) {
			return realIp.trim()
		}

		const xff = request.headers.get('x-forwarded-for')
		if (xff) {
			const parts = xff
				.split(',')
				.map(p => p.trim())
				.filter(Boolean)
			const lastIp = parts.at(-1)
			if (lastIp) {
				return lastIp
			}
		}

		return '127.0.0.1'
	}
}

/**
 * Setup common mocks for API route tests
 * Call this in beforeEach hooks
 */
export function setupApiMocks() {
	const mockRateLimiter = createMockRateLimiter()

	process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'

	// Reuse the Bearer secrets defined once in tests/setup.ts (exposed on
	// globalThis.__TEST_ENV) rather than re-declaring the literals here. The
	// real validateAdminAuth / validateCronAuth are re-resolved when an API
	// route is freshly imported under this @/env mock; without these the route
	// would return 503 "authentication not configured".
	const sharedEnv = (
		globalThis as unknown as {
			__TEST_ENV?: { ADMIN_SECRET?: unknown; CRON_SECRET?: unknown }
		}
	).__TEST_ENV

	mock.module('@/env', () => ({
		env: {
			NODE_ENV: 'test',
			RESEND_API_KEY: 'test-key',
			NEXT_PUBLIC_GA_MEASUREMENT_ID: 'test-ga-id',
			npm_package_version: '1.0.0',
			CSRF_SECRET: 'test-csrf-secret-for-testing-only',
			ADMIN_SECRET: sharedEnv?.ADMIN_SECRET,
			CRON_SECRET: sharedEnv?.CRON_SECRET
		}
	}))

	// No @/lib/logger mock here: tests/setup.ts registers the complete one and
	// re-applies it before every test. A partial logger mock registered before
	// the module's first load drops exports (createServerLogger) for the rest
	// of the run.

	mock.module('@/lib/rate-limiter', () => ({
		UnifiedRateLimiter: createMockUnifiedRateLimiterClass(),
		unifiedRateLimiter: mockRateLimiter,
		getUnifiedRateLimiter: () => mockRateLimiter,
		getClientIp: createMockGetClientIp(),
		RATE_LIMIT_CONFIGS: MOCK_RATE_LIMIT_CONFIGS
	}))

	mock.module('@/lib/security-headers', () => ({
		applySecurityHeaders: (response: Response) => response
	}))

	// Bypass mutation guards (origin + CSRF + rate limit) in unit tests so
	// handler-level behavior can be exercised without staging a CSRF token
	// and a same-origin request envelope.
	mock.module('@/lib/api/guards', () => ({
		withMutationGuards: (
			handler: (req: import('next/server').NextRequest) => Promise<Response>
		) => handler
	}))

	// The real `@/lib/db` is already a no-op proxy that resolves every query
	// to [] (TEST_ENV has no POSTGRES_URL). Pin it instead of registering a
	// stub: a stub registered here would outlive the file and reach every
	// later suite. Tests that need specific rows mock `@/lib/db` after this
	// call and restore it in afterAll.
	restoreRealDb()

	mock.module('@/lib/resend-client', () => ({
		isResendConfigured: mock().mockReturnValue(true),
		getResendClient: mock(() => ({
			emails: {
				send: mock().mockResolvedValue({ data: { id: 'test-email-id' } })
			}
		}))
	}))

	return { mockRateLimiter }
}

type NextNavigation = typeof import('next/navigation')

/**
 * The genuine next/navigation exports, captured by tests/setup.ts at preload
 * before any test file can register a mock. Read from there rather than an
 * import here: by the time this file loads, a sibling may already have
 * swapped the module's exports in place.
 */
function realNextNavigation(): NextNavigation {
	const real = (globalThis as { __REAL_NEXT_NAVIGATION__?: NextNavigation })
		.__REAL_NEXT_NAVIGATION__
	if (!real) {
		throw new Error(
			'tests/setup.ts must capture __REAL_NEXT_NAVIGATION__ before mockNextNavigation() runs'
		)
	}
	return real
}

/**
 * The ONLY sanctioned way to mock next/navigation in a test file.
 * mock.module is process-global and bun fixes a module's export names on
 * first load, so a partial factory (one without notFound / redirect) breaks
 * every later importer with "Export named 'notFound' not found". This spreads
 * the real module, stubs the client hooks, then applies `overrides`.
 */
export function mockNextNavigation(overrides: Partial<NextNavigation> = {}) {
	const real = realNextNavigation()
	mock.module('next/navigation', () => ({
		...real,
		useRouter: () => ({
			push: mock(),
			replace: mock(),
			prefetch: mock(),
			refresh: mock(),
			back: mock(),
			forward: mock()
		}),
		usePathname: () => '/',
		useSearchParams: () => new URLSearchParams(),
		...overrides
	}))
}

/**
 * Setup common mocks for component tests with Next.js
 * Call this in beforeEach hooks
 */
export function setupNextMocks() {
	// Don't mock next/link - use the real implementation
	// React 19 changed element internals, making element mocks fragile
	// Real next/link works perfectly in tests and uses native history API
	// See: https://github.com/vercel/next.js/discussions/48110

	mockNextNavigation()

	mock.module('next/dynamic', () => ({
		default: <P = Record<string, never>>(
			_loader:
				| (() => Promise<React.ComponentType<P>>)
				| Promise<React.ComponentType<P>>
		): React.ComponentType<P> => {
			// For testing, just return a mock component that renders null
			// This is sufficient for component tests that use dynamic imports
			return (() => null) as React.ComponentType<P>
		}
	}))
}

/**
 * Re-register `@/lib/db` with the genuine export (the createMockDb no-op
 * proxy, since TEST_ENV omits POSTGRES_URL) that tests/setup.ts captured at
 * preload. mock.module() is process-global and mock.restore() never undoes
 * it, so a file that stubs `@/lib/db` with fixture rows hands those rows to
 * every later file. Every file that calls mock.module('@/lib/db', ...) must
 * call this in afterAll (scripts/check-test-mock-leaks.ts enforces it), and a
 * suite that depends on the real no-op db calls it in beforeEach.
 */
export function restoreRealDb(): void {
	const realDb = (globalThis as { __REAL_DB__?: unknown }).__REAL_DB__
	if (realDb === undefined) {
		throw new Error(
			'tests/setup.ts must capture __REAL_DB__ before restoreRealDb() runs'
		)
	}
	mock.module('@/lib/db', () => ({ db: realDb }))
}

/**
 * Cleanup all mocks and React Testing Library components after each test
 * Call this in afterEach hooks for tests that use React components
 */
export function cleanupMocks() {
	cleanup()
	mock.restore()
}
