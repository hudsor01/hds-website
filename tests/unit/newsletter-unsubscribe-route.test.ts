/**
 * Newsletter Unsubscribe API Route Unit Tests
 *
 * Token-gated unsubscribe: route requires both `email` and a valid HMAC
 * `token` issued at email-send time. We use the REAL unsubscribe-token
 * module (compute valid + invalid tokens at test-setup) instead of
 * mocking it — bun:test's `mock.module()` is process-sticky, so a
 * stub here would bleed into unsubscribe-token.test.ts when the suite
 * runs in a different file order than the local one.
 */

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { NextRequest } from 'next/server'
import { generateUnsubscribeToken } from '@/lib/unsubscribe-token'
import { cleanupMocks } from '../test-utils'

const TEST_EMAIL = 'user@example.com'

function makeRequest(body: unknown): NextRequest {
	return new NextRequest('http://localhost:3000/api/newsletter/unsubscribe', {
		method: 'POST',
		body: JSON.stringify(body),
		headers: { 'Content-Type': 'application/json' }
	})
}

describe('POST /api/newsletter/unsubscribe', () => {
	let mockDbUpdate: ReturnType<typeof mock>
	let validToken: string

	beforeEach(async () => {
		mockDbUpdate = mock().mockReturnValue({
			set: mock().mockReturnValue({
				where: mock().mockResolvedValue([])
			})
		})

		// Bypass mutation guards (origin + CSRF + rate limit) in unit tests.
		mock.module('@/lib/api/guards', () => ({
			withMutationGuards: (handler: (req: NextRequest) => Promise<Response>) =>
				handler,
			withMutationGuardsParams: <T>(
				handler: (req: NextRequest, ctx: T) => Promise<Response>
			) => handler
		}))

		mock.module('@/env', () => ({
			env: {
				NODE_ENV: 'test',
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
			castError: (error: unknown) =>
				error instanceof Error ? error : new Error(String(error))
		}))

		mock.module('@/lib/db', () => ({
			db: {
				update: mockDbUpdate
			}
		}))

		mock.module('@/lib/schemas/emails', () => ({
			newsletterSubscribers: { email: 'email' }
		}))

		mock.module('drizzle-orm', () => ({
			eq: mock((col: unknown, val: unknown) => ({ col, val }))
		}))

		// Pre-compute a valid token via the real HMAC helper. emailSchema
		// will lowercase the request email before the route runs, so the
		// token must be computed over the lowercased value too.
		validToken = await generateUnsubscribeToken(TEST_EMAIL)
	})

	afterEach(() => {
		cleanupMocks()
	})

	it('returns 200 with success:true when email + valid token are provided', async () => {
		const { POST } = await import('@/app/api/newsletter/unsubscribe/route')
		const response = await POST(
			makeRequest({ email: TEST_EMAIL, token: validToken })
		)
		const data = await response.json()

		expect(response.status).toBe(200)
		expect(data.success).toBe(true)
	})

	it('calls db.update when token verifies', async () => {
		const { POST } = await import('@/app/api/newsletter/unsubscribe/route')
		await POST(makeRequest({ email: TEST_EMAIL, token: validToken }))

		expect(mockDbUpdate).toHaveBeenCalledTimes(1)
	})

	it('returns 400 for a non-email string', async () => {
		const { POST } = await import('@/app/api/newsletter/unsubscribe/route')
		const response = await POST(
			makeRequest({ email: 'not-an-email', token: validToken })
		)
		expect(response.status).toBe(400)
	})

	it('returns 400 when the email field is missing', async () => {
		const { POST } = await import('@/app/api/newsletter/unsubscribe/route')
		const response = await POST(makeRequest({ token: validToken }))
		expect(response.status).toBe(400)
	})

	it('returns 400 when the token field is missing', async () => {
		const { POST } = await import('@/app/api/newsletter/unsubscribe/route')
		const response = await POST(makeRequest({ email: TEST_EMAIL }))
		expect(response.status).toBe(400)
	})

	it('returns 403 when token does not verify', async () => {
		const { POST } = await import('@/app/api/newsletter/unsubscribe/route')
		const response = await POST(
			makeRequest({ email: TEST_EMAIL, token: 'definitely-not-the-real-hmac' })
		)

		expect(response.status).toBe(403)
		expect(mockDbUpdate).not.toHaveBeenCalled()
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
		const response = await POST(
			makeRequest({ email: TEST_EMAIL, token: validToken })
		)
		const data = await response.json()

		expect(response.status).toBe(500)
		expect(data.error).toBe('Unsubscribe failed')
	})
})
