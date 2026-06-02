/**
 * /api/error-report smoke tests.
 *
 * Confirms the route accepts a well-formed error-boundary report (204),
 * captures it via logger.error, forwards it to Sentry via reportError, and
 * rejects malformed bodies (400). The route is unauthenticated public
 * telemetry — anyone can POST a report — so the only protection is Zod
 * shape validation + mutation-guards (origin + rate-limit), which we mock
 * through.
 */

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { NextRequest } from 'next/server'
import { cleanupMocks, setupApiMocks } from '../test-utils'

const reportErrorSpy = mock()

function makeRequest(body: unknown): NextRequest {
	return new NextRequest('http://localhost/api/error-report', {
		method: 'POST',
		body: JSON.stringify(body),
		headers: { 'Content-Type': 'application/json' }
	})
}

describe('POST /api/error-report', () => {
	let mocks: ReturnType<typeof setupApiMocks>

	beforeEach(() => {
		mocks = setupApiMocks()
		reportErrorSpy.mockClear()
		mock.module('@/lib/error-tracking', () => ({
			reportError: reportErrorSpy
		}))
	})

	afterEach(() => {
		cleanupMocks()
	})

	it('returns 204 for a well-formed report and captures it', async () => {
		const { POST } = await import('@/app/api/error-report/route')
		const res = await POST(
			makeRequest({
				message: 'Something broke',
				stack: 'Error: Something broke\n    at foo (bar.ts:1:1)',
				url: 'https://example.com/page',
				userAgent: 'Mozilla/5.0',
				timestamp: new Date().toISOString(),
				platform: 'MacIntel',
				language: 'en-US'
			})
		)
		expect(res.status).toBe(204)
		expect(mocks.mockLogger.error).toHaveBeenCalled()
		expect(reportErrorSpy).toHaveBeenCalledTimes(1)
	})

	it('returns 400 when the body is missing message', async () => {
		const { POST } = await import('@/app/api/error-report/route')
		const res = await POST(
			makeRequest({
				url: 'https://example.com/page',
				userAgent: 'Mozilla/5.0',
				timestamp: new Date().toISOString()
			})
		)
		expect(res.status).toBe(400)
	})

	it('returns 400 when the url is not a valid URL', async () => {
		const { POST } = await import('@/app/api/error-report/route')
		const res = await POST(
			makeRequest({
				message: 'Something broke',
				url: 'not-a-url',
				userAgent: 'Mozilla/5.0',
				timestamp: new Date().toISOString()
			})
		)
		expect(res.status).toBe(400)
	})

	it('returns 400 when the body is a raw string', async () => {
		const { POST } = await import('@/app/api/error-report/route')
		const res = await POST(makeRequest('plain string'))
		expect(res.status).toBe(400)
	})
})
