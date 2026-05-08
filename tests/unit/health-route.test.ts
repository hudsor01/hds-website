/**
 * Health Check API Route Unit Tests
 * Tests for src/app/api/health/route.ts
 *
 * Verifies the response shape on success, 503 on DB failure, and the
 * admin-auth gate. Auth is mocked at module level.
 */

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { NextRequest } from 'next/server'
import { cleanupMocks } from '../test-utils'

function authedRequest() {
	return new NextRequest('http://localhost/api/health', {
		headers: { authorization: 'Bearer test-admin' }
	})
}

describe('GET /api/health', () => {
	beforeEach(() => {
		mock.module('@/env', () => ({
			env: {
				NODE_ENV: 'test',
				npm_package_version: '2.5.0',
				ADMIN_SECRET: 'test-admin'
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
			castError: (error: unknown) =>
				error instanceof Error ? error : new Error(String(error))
		}))

		// Auth helper passes through when the test sends a valid bearer.
		mock.module('@/lib/auth/admin', () => ({
			validateAdminAuth: () => null
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
		mock.module('@/lib/auth/admin', () => ({
			validateAdminAuth: () =>
				Response.json({ error: 'Unauthorized' }, { status: 401 })
		}))
		mock.module('@/lib/db', () => ({
			db: { execute: mock().mockResolvedValue([{ '?column?': 1 }]) }
		}))

		const { GET } = await import('@/app/api/health/route')
		const response = await GET(authedRequest())
		expect(response.status).toBe(401)
	})
})
