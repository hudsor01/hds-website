/**
 * Health Check API Route Unit Tests
 * Tests for src/app/api/health/route.ts
 *
 * Verifies the response shape on success, 503 on DB failure, and the
 * admin-auth gate. Uses the real `@/lib/auth/admin` module driven by
 * TEST_ENV (set in tests/setup.ts and mutated here) so we don't have
 * to mock.module('@/lib/auth/admin') — per oven-sh/bun#7823,
 * mock.module() registrations leak across files (mock.restore() does
 * not unregister them), which caused admin-auth.test.ts to fail when
 * it ran after this file.
 */

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { NextRequest } from 'next/server'
import { cleanupMocks } from '../test-utils'

const testEnv = (
	globalThis as unknown as { __TEST_ENV: Record<string, unknown> }
).__TEST_ENV

const ADMIN_SECRET = 'test-admin-secret-that-is-32-chars!!'

function authedRequest() {
	return new NextRequest('http://localhost/api/health', {
		headers: { authorization: `Bearer ${ADMIN_SECRET}` }
	})
}

describe('GET /api/health', () => {
	beforeEach(() => {
		// Mutate the shared TEST_ENV (from tests/setup.ts) rather than
		// re-registering @/env. Re-registering with a fresh env object
		// breaks ESM live bindings for any consumer that already resolved
		// `import { env } from '@/env'`, which causes downstream tests
		// (admin-auth) to see stale ADMIN_SECRET values in CI.
		testEnv.NODE_ENV = 'test'
		testEnv.npm_package_version = '2.5.0'
		testEnv.ADMIN_SECRET = ADMIN_SECRET

		mock.module('@/lib/logger', () => ({
			logger: {
				debug: mock(),
				info: mock(),
				warn: mock(),
				error: mock(),
				setContext: mock()
			},
			castError: (error: unknown) =>
				error instanceof Error ? error : new Error(String(error))
		}))
	})

	afterEach(() => {
		cleanupMocks()
	})

	it('returns 200 with correct shape when database is reachable', async () => {
		mock.module('@/lib/db', () => ({
			db: {
				execute: mock().mockResolvedValue([{ '?column?': 1 }])
			}
		}))

		const { GET } = await import('@/app/api/health/route')
		const response = await GET(authedRequest())
		const data = await response.json()

		expect(response.status).toBe(200)
		expect(data.status).toBe('ok')
		expect(data.database).toBe('ok')
		expect(typeof data.timestamp).toBe('string')
		expect(typeof data.latency_ms).toBe('number')
		expect(data.latency_ms).toBeGreaterThanOrEqual(0)
		expect(typeof data.version).toBe('string')
	})

	it('timestamp in success response is a valid ISO 8601 string', async () => {
		mock.module('@/lib/db', () => ({
			db: {
				execute: mock().mockResolvedValue([{ '?column?': 1 }])
			}
		}))

		const { GET } = await import('@/app/api/health/route')
		const response = await GET(authedRequest())
		const data = await response.json()

		const parsed = new Date(data.timestamp)
		expect(parsed.toISOString()).toBe(data.timestamp)
	})

	it('returns 503 with error shape when database throws', async () => {
		mock.module('@/lib/db', () => ({
			db: {
				execute: mock().mockRejectedValue(new Error('connection refused'))
			}
		}))

		const { GET } = await import('@/app/api/health/route')
		const response = await GET(authedRequest())
		const data = await response.json()

		expect(response.status).toBe(503)
		expect(data.status).toBe('error')
		expect(data.database).toBe('error')
		expect(typeof data.timestamp).toBe('string')
		expect(data.latency_ms).toBeUndefined()
	})

	it('error response timestamp is a valid ISO 8601 string', async () => {
		mock.module('@/lib/db', () => ({
			db: {
				execute: mock().mockRejectedValue(new Error('timeout'))
			}
		}))

		const { GET } = await import('@/app/api/health/route')
		const response = await GET(authedRequest())
		const data = await response.json()

		const parsed = new Date(data.timestamp)
		expect(parsed.toISOString()).toBe(data.timestamp)
	})

	it('rejects requests without valid admin auth', async () => {
		// Real admin.ts: env.ADMIN_SECRET is set; sending a wrong Bearer
		// triggers a 401. No mock.module('@/lib/auth/admin') needed.
		mock.module('@/lib/db', () => ({
			db: { execute: mock().mockResolvedValue([{ '?column?': 1 }]) }
		}))

		const { GET } = await import('@/app/api/health/route')
		const unauthedRequest = new NextRequest('http://localhost/api/health', {
			headers: { authorization: 'Bearer completely-wrong-token' }
		})
		const response = await GET(unauthedRequest)
		expect(response.status).toBe(401)
	})
})
