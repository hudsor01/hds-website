/**
 * Admin Authentication Unit Tests
 * Tests for validateAdminAuth() in src/lib/auth/admin.ts
 *
 * NOTE on env mocking: tests/setup.ts registers a single stable `env` object
 * for `@/env` and exposes it via `globalThis.__TEST_ENV`. Re-registering the
 * module mock with a new object breaks ESM live bindings for any consumer
 * that has already resolved `import { env } from '@/env'` (which happens in
 * CI when admin.ts loads before this file's beforeEach). We mutate the
 * shared `env` object directly so the live binding inside admin.ts reflects
 * each test's setup.
 *
 * Per oven-sh/bun#7823, `mock.module()` registrations leak across test
 * files (mock.restore() does NOT unregister them). For the real admin.ts
 * to be visible here, NO other test file may `mock.module('@/lib/auth/admin', ...)`.
 */

import { beforeEach, describe, expect, it } from 'bun:test'
import { NextRequest } from 'next/server'

const VALID_ADMIN_SECRET = 'test-admin-secret-that-is-32-chars!!'

const testEnv = (
	globalThis as unknown as { __TEST_ENV: Record<string, unknown> }
).__TEST_ENV

describe('validateAdminAuth', () => {
	beforeEach(() => {
		// Reset to a defined ADMIN_SECRET for the default case. Individual
		// tests can override before invoking validateAdminAuth.
		testEnv.ADMIN_SECRET = VALID_ADMIN_SECRET
		testEnv.CRON_SECRET = 'test-cron-secret-that-is-32-chars!!'
	})

	it('returns null when the correct Bearer token is provided', async () => {
		const { validateAdminAuth } = await import('@/lib/auth/admin')

		const request = new NextRequest('http://localhost:3000/api/admin/test', {
			method: 'GET',
			headers: {
				authorization: `Bearer ${VALID_ADMIN_SECRET}`
			}
		})

		const result = validateAdminAuth(request)
		expect(result).toBeNull()
	})

	it('returns 401 when no authorization header is present', async () => {
		const { validateAdminAuth } = await import('@/lib/auth/admin')

		const request = new NextRequest('http://localhost:3000/api/admin/test', {
			method: 'GET'
		})

		const result = validateAdminAuth(request)
		expect(result).not.toBeNull()
		expect(result?.status).toBe(401)

		const body = await result?.json()
		expect(body.error).toBe('Unauthorized')
	})

	it('returns 401 when the Bearer token is wrong', async () => {
		const { validateAdminAuth } = await import('@/lib/auth/admin')

		const request = new NextRequest('http://localhost:3000/api/admin/test', {
			method: 'GET',
			headers: {
				authorization: 'Bearer completely-wrong-secret'
			}
		})

		const result = validateAdminAuth(request)
		expect(result).not.toBeNull()
		expect(result?.status).toBe(401)

		const body = await result?.json()
		expect(body.error).toBe('Unauthorized')
	})

	it('returns 401 when the authorization scheme is not Bearer', async () => {
		const { validateAdminAuth } = await import('@/lib/auth/admin')

		const request = new NextRequest('http://localhost:3000/api/admin/test', {
			method: 'GET',
			headers: {
				authorization: `Basic ${VALID_ADMIN_SECRET}`
			}
		})

		const result = validateAdminAuth(request)
		expect(result).not.toBeNull()
		expect(result?.status).toBe(401)
	})

	it('returns 503 when ADMIN_SECRET is not configured', async () => {
		testEnv.ADMIN_SECRET = undefined

		const { validateAdminAuth } = await import('@/lib/auth/admin')

		const request = new NextRequest('http://localhost:3000/api/admin/test', {
			method: 'GET',
			headers: {
				authorization: `Bearer ${VALID_ADMIN_SECRET}`
			}
		})

		const result = validateAdminAuth(request)
		expect(result).not.toBeNull()
		expect(result?.status).toBe(503)

		const body = await result?.json()
		expect(body.error).toBe('Admin authentication not configured')
	})
})
