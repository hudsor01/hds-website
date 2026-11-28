/**
 * Tests for src/lib/api/guards.ts and the underlying isSameOriginRequest
 * helper. The wrapper composes three checks (origin → CSRF → rate-limit);
 * we exercise each gate in isolation and confirm the SAFE-method
 * passthrough path.
 */

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { NextRequest } from 'next/server'
import type * as GuardsTypes from '@/lib/api/guards'
import * as actualRateLimiter from '@/lib/rate-limiter'
import { cleanupMocks } from '../test-utils'

// Snapshot of the module's exports, spread into the mock below so it only
// overrides getUnifiedRateLimiter. A partial factory registered before
// @/lib/rate-limiter's first load would drop RATE_LIMIT_CONFIGS and
// UnifiedRateLimiter for every later file in the run.
const RATE_LIMITER_EXPORTS = { ...actualRateLimiter }

const ALLOWED_HOST = 'hudsondigitalsolutions.com'
const ALLOWED_BASE = `https://${ALLOWED_HOST}`

beforeEach(() => {
	mock.module('@/env', () => ({
		env: {
			NODE_ENV: 'test',
			BASE_URL: ALLOWED_BASE,
			CSRF_SECRET: 'test-csrf-secret-for-testing-only-32chars'
		}
	}))
	mock.module('@/lib/rate-limiter', () => ({
		...RATE_LIMITER_EXPORTS,
		getUnifiedRateLimiter: () => ({
			checkLimit: mock().mockResolvedValue(true)
		})
	}))
})

afterEach(() => {
	cleanupMocks()
})

function makeRequest(
	method: string,
	headers: Record<string, string> = {}
): NextRequest {
	return new NextRequest('http://localhost/api/protected', {
		method,
		headers
	})
}

describe('isSameOriginRequest', () => {
	it('passes safe methods through regardless of Origin header', async () => {
		const { isSameOriginRequest } = await import('@/lib/request')
		expect(isSameOriginRequest(makeRequest('GET'))).toBe(true)
		expect(isSameOriginRequest(makeRequest('HEAD'))).toBe(true)
		expect(isSameOriginRequest(makeRequest('OPTIONS'))).toBe(true)
	})

	it('accepts a POST whose Origin matches BASE_URL host', async () => {
		const { isSameOriginRequest } = await import('@/lib/request')
		expect(
			isSameOriginRequest(makeRequest('POST', { origin: ALLOWED_BASE }))
		).toBe(true)
	})

	it('rejects a POST with a foreign Origin', async () => {
		const { isSameOriginRequest } = await import('@/lib/request')
		expect(
			isSameOriginRequest(makeRequest('POST', { origin: 'https://evil.com' }))
		).toBe(false)
	})

	it('falls back to Referer when Origin is omitted', async () => {
		const { isSameOriginRequest } = await import('@/lib/request')
		expect(
			isSameOriginRequest(
				makeRequest('POST', { referer: `${ALLOWED_BASE}/contact` })
			)
		).toBe(true)
		expect(
			isSameOriginRequest(
				makeRequest('POST', { referer: 'https://attacker.example/' })
			)
		).toBe(false)
	})

	it('rejects a POST with neither Origin nor Referer', async () => {
		const { isSameOriginRequest } = await import('@/lib/request')
		expect(isSameOriginRequest(makeRequest('POST'))).toBe(false)
	})

	it('rejects a POST with a malformed Origin header', async () => {
		const { isSameOriginRequest } = await import('@/lib/request')
		expect(
			isSameOriginRequest(makeRequest('POST', { origin: 'not a url' }))
		).toBe(false)
	})
})

// withMutationGuards is exercised end-to-end by the per-route tests
// (newsletter-unsubscribe-route.test.ts asserts 403 on missing CSRF;
// api-routes.test.ts covers the happy path). setupApiMocks installs a
// persistent passthrough mock for @/lib/api/guards (bun:test's
// mock.module is sticky across files), so the rate-limit logging tests
// below use the genuine wrapper captured in tests/setup.ts.
const withMutationGuards = (
	globalThis as unknown as {
		__REAL_WITH_MUTATION_GUARDS__: typeof GuardsTypes.withMutationGuards
	}
).__REAL_WITH_MUTATION_GUARDS__

describe('withMutationGuards rate-limit logging', () => {
	beforeEach(() => {
		mock.module('@/lib/rate-limiter', () => ({
			...RATE_LIMITER_EXPORTS,
			getUnifiedRateLimiter: () => ({
				checkLimit: mock().mockResolvedValue(false)
			})
		}))
	})

	const handler = mock(async () => new Response(null, { status: 204 }))

	function beacon(): NextRequest {
		return makeRequest('POST', { origin: ALLOWED_BASE })
	}

	it('warns on a 429 from a mutation endpoint by default', async () => {
		const { createServerLogger } = await import('@/lib/logger')
		const log = createServerLogger()
		const guarded = withMutationGuards(handler, { csrf: false })

		const res = await guarded(beacon())

		expect(res.status).toBe(429)
		expect(handler).not.toHaveBeenCalled()
		expect(log.warn).toHaveBeenCalledWith(
			'Rate limit exceeded for api',
			expect.objectContaining({ path: '/api/protected' })
		)
		expect(log.debug).not.toHaveBeenCalled()
	})

	it("logs a telemetry 429 at debug when rateLimitLogLevel is 'debug'", async () => {
		const { createServerLogger } = await import('@/lib/logger')
		const log = createServerLogger()
		const guarded = withMutationGuards(handler, {
			csrf: false,
			rateLimitLogLevel: 'debug'
		})

		const res = await guarded(beacon())

		expect(res.status).toBe(429)
		expect(handler).not.toHaveBeenCalled()
		expect(log.debug).toHaveBeenCalledWith(
			'Rate limit exceeded for api',
			expect.objectContaining({ path: '/api/protected' })
		)
		expect(log.warn).not.toHaveBeenCalled()
	})
})
