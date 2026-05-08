/**
 * Tests for src/lib/api/guards.ts and the underlying isSameOriginRequest
 * helper. The wrapper composes three checks (origin → CSRF → rate-limit);
 * we exercise each gate in isolation and confirm the SAFE-method
 * passthrough path.
 */

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { NextRequest } from 'next/server'
import { cleanupMocks } from '../test-utils'

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
	mock.module('@/lib/logger', () => ({
		logger: {
			debug: mock(),
			info: mock(),
			warn: mock(),
			error: mock(),
			setContext: mock()
		},
		createServerLogger: () => ({
			debug: mock(),
			info: mock(),
			warn: mock(),
			error: mock(),
			setContext: mock()
		}),
		castError: (error: unknown) =>
			error instanceof Error ? error : new Error(String(error))
	}))
	mock.module('@/lib/rate-limiter', () => ({
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
// api-routes.test.ts covers the happy path). We don't duplicate those
// here because setupApiMocks installs a persistent module-level
// passthrough mock for @/lib/api/guards (so handler-level tests can
// bypass guards), and bun:test's mock.module is sticky across files.
// The same-origin primitive is the new addition — covered above.
