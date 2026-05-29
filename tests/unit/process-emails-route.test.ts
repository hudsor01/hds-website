/**
 * Process Emails API Route Unit Tests
 * Tests for src/app/api/process-emails/route.ts
 *
 * Covers authentication (missing header, wrong token, 503 when env not set)
 * and verifies that processEmailsEndpoint is called on an authorized request.
 */

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { NextRequest } from 'next/server'
import { cleanupMocks } from '../test-utils'

const testEnv = (
	globalThis as unknown as { __TEST_ENV: Record<string, unknown> }
).__TEST_ENV

const VALID_CRON_SECRET = 'test-cron-secret-that-is-32-chars!!'

function makeRequest(authHeader?: string): NextRequest {
	const headers: Record<string, string> = {}
	if (authHeader !== undefined) {
		headers.authorization = authHeader
	}
	return new NextRequest('http://localhost:3000/api/process-emails', {
		method: 'POST',
		headers
	})
}

describe('POST /api/process-emails', () => {
	let mockProcessEmailsEndpoint: ReturnType<typeof mock>

	beforeEach(() => {
		mockProcessEmailsEndpoint = mock().mockResolvedValue({
			processed: 3,
			errors: 0,
			message: 'Processed 3 emails, 0 errors'
		})

		// Mutate the shared TEST_ENV (from tests/setup.ts) rather than
		// re-registering @/env. Re-registering with a fresh env object
		// breaks ESM live bindings for already-loaded consumers (admin.ts)
		// which causes downstream admin-auth tests to fail in CI.
		testEnv.NODE_ENV = 'test'
		testEnv.CRON_SECRET = VALID_CRON_SECRET

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

		// Re-export every name other suites may rely on, not just the
		// one this test exercises — bun:test's mock.module cache survives
		// across files, so a partial mock here strips siblings from any
		// later import of `@/lib/scheduled-emails`.
		mock.module('@/lib/scheduled-emails', () => ({
			processEmailsEndpoint: mockProcessEmailsEndpoint,
			scheduleEmail: mock().mockResolvedValue(undefined),
			scheduleEmailSequence: mock().mockResolvedValue(undefined)
		}))
	})

	afterEach(() => {
		cleanupMocks()
	})

	it('returns 401 when no authorization header is provided', async () => {
		const { POST } = await import('@/app/api/process-emails/route')
		const response = await POST(makeRequest())
		const data = await response.json()

		expect(response.status).toBe(401)
		expect(data.error).toBe('Unauthorized')
	})

	it('returns 401 when an incorrect Bearer token is provided', async () => {
		const { POST } = await import('@/app/api/process-emails/route')
		const response = await POST(makeRequest('Bearer wrong-secret'))
		const data = await response.json()

		expect(response.status).toBe(401)
		expect(data.error).toBe('Unauthorized')
	})

	it('returns 401 when the authorization scheme is not Bearer', async () => {
		const { POST } = await import('@/app/api/process-emails/route')
		const response = await POST(makeRequest(`Basic ${VALID_CRON_SECRET}`))
		const data = await response.json()

		expect(response.status).toBe(401)
		expect(data.error).toBe('Unauthorized')
	})

	it('returns 503 when CRON_SECRET is not configured', async () => {
		testEnv.CRON_SECRET = undefined

		const { POST } = await import('@/app/api/process-emails/route')
		const response = await POST(makeRequest(`Bearer ${VALID_CRON_SECRET}`))
		const data = await response.json()

		expect(response.status).toBe(503)
		expect(data.error).toBe('Cron authentication not configured')
	})

	it('calls processEmailsEndpoint and returns its result on a valid request', async () => {
		const { POST } = await import('@/app/api/process-emails/route')
		const response = await POST(makeRequest(`Bearer ${VALID_CRON_SECRET}`))
		const data = await response.json()

		expect(response.status).toBe(200)
		expect(mockProcessEmailsEndpoint).toHaveBeenCalledTimes(1)
		expect(data.processed).toBe(3)
		expect(data.errors).toBe(0)
	})

	it('returns 500 when processEmailsEndpoint throws', async () => {
		mockProcessEmailsEndpoint = mock().mockRejectedValue(
			new Error('queue failure')
		)

		// Re-export every name other suites may rely on, not just the
		// one this test exercises — bun:test's mock.module cache survives
		// across files, so a partial mock here strips siblings from any
		// later import of `@/lib/scheduled-emails`.
		mock.module('@/lib/scheduled-emails', () => ({
			processEmailsEndpoint: mockProcessEmailsEndpoint,
			scheduleEmail: mock().mockResolvedValue(undefined),
			scheduleEmailSequence: mock().mockResolvedValue(undefined)
		}))

		const { POST } = await import('@/app/api/process-emails/route')
		const response = await POST(makeRequest(`Bearer ${VALID_CRON_SECRET}`))
		const data = await response.json()

		expect(response.status).toBe(500)
		expect(data.error).toBe('Processing failed')
	})
})
