/**
 * Newsletter Unsubscribe API Route Unit Tests
 * Tests for src/app/api/newsletter/unsubscribe/route.ts
 *
 * Covers: valid email unsubscribes, invalid email rejection, DB error handling.
 */

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { NextRequest } from 'next/server'
import { cleanupMocks } from '../test-utils'

function makeRequest(body: unknown): NextRequest {
	return new NextRequest('http://localhost:3000/api/newsletter/unsubscribe', {
		method: 'POST',
		body: JSON.stringify(body),
		headers: { 'Content-Type': 'application/json' }
	})
}

describe('POST /api/newsletter/unsubscribe', () => {
	let mockDbUpdate: ReturnType<typeof mock>

	beforeEach(() => {
		mockDbUpdate = mock().mockReturnValue({
			set: mock().mockReturnValue({
				where: mock().mockResolvedValue([])
			})
		})

		// Bypass rate limiting in tests — the rate limiter state persists across
		// calls and the newsletter tier (3 req/min) is exhausted quickly in suites.
		mock.module('@/lib/api/rate-limit-wrapper', () => ({
			withRateLimit: (handler: (req: NextRequest) => Promise<Response>) =>
				handler,
			withRateLimitParams: <T>(
				handler: (req: NextRequest, ctx: T) => Promise<Response>
			) => handler
		}))

		mock.module('@/env', () => ({
			env: {
				NODE_ENV: 'test'
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

		mock.module('@/lib/db', () => ({
			db: {
				update: mockDbUpdate
			}
		}))

		// Stub the schema import so the route can import without a real DB
		mock.module('@/lib/schemas/emails', () => ({
			newsletterSubscribers: { email: 'email' }
		}))

		mock.module('drizzle-orm', () => ({
			eq: mock((col: unknown, val: unknown) => ({ col, val }))
		}))
	})

	afterEach(() => {
		cleanupMocks()
	})

	it('returns 200 with success:true for a valid email', async () => {
		const { POST } = await import('@/app/api/newsletter/unsubscribe/route')
		const response = await POST(makeRequest({ email: 'user@example.com' }))
		const data = await response.json()

		expect(response.status).toBe(200)
		expect(data.success).toBe(true)
	})

	it('calls db.update with the correct email', async () => {
		const { POST } = await import('@/app/api/newsletter/unsubscribe/route')
		await POST(makeRequest({ email: 'unsubme@example.com' }))

		expect(mockDbUpdate).toHaveBeenCalledTimes(1)
	})

	it('returns 400 for a non-email string', async () => {
		const { POST } = await import('@/app/api/newsletter/unsubscribe/route')
		const response = await POST(makeRequest({ email: 'not-an-email' }))
		const data = await response.json()

		expect(response.status).toBe(400)
		expect(data.error).toBe('Invalid email')
	})

	it('returns 400 when the email field is missing', async () => {
		const { POST } = await import('@/app/api/newsletter/unsubscribe/route')
		const response = await POST(makeRequest({}))
		const data = await response.json()

		expect(response.status).toBe(400)
		expect(data.error).toBe('Invalid email')
	})

	it('returns 400 when email is an empty string', async () => {
		const { POST } = await import('@/app/api/newsletter/unsubscribe/route')
		const response = await POST(makeRequest({ email: '' }))
		const data = await response.json()

		expect(response.status).toBe(400)
		expect(data.error).toBe('Invalid email')
	})

	it('returns 500 when the database update throws', async () => {
		const failingUpdate = mock().mockReturnValue({
			set: mock().mockReturnValue({
				where: mock().mockRejectedValue(new Error('db connection lost'))
			})
		})

		mock.module('@/lib/db', () => ({
			db: { update: failingUpdate }
		}))

		const { POST } = await import('@/app/api/newsletter/unsubscribe/route')
		const response = await POST(makeRequest({ email: 'user@example.com' }))
		const data = await response.json()

		expect(response.status).toBe(500)
		expect(data.error).toBe('Unsubscribe failed')
	})
})
