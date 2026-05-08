/**
 * /api/csp-reports smoke tests.
 *
 * Confirms the route accepts well-formed CSP violation reports (204) and
 * rejects malformed bodies (400). The route never authenticates — anyone
 * can POST a report — so the only protection is shape validation +
 * mutation-guards (origin + rate-limit), which we mock through.
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { NextRequest } from 'next/server'
import { cleanupMocks, setupApiMocks } from '../test-utils'

function makeRequest(body: unknown): NextRequest {
	return new NextRequest('http://localhost/api/csp-reports', {
		method: 'POST',
		body: JSON.stringify(body),
		headers: { 'Content-Type': 'application/json' }
	})
}

describe('POST /api/csp-reports', () => {
	beforeEach(() => {
		setupApiMocks()
	})

	afterEach(() => {
		cleanupMocks()
	})

	it('returns 204 for a well-formed CSP report', async () => {
		const { POST } = await import('@/app/api/csp-reports/route')
		const res = await POST(
			makeRequest({
				'csp-report': {
					'document-uri': 'https://example.com/page',
					'violated-directive': 'script-src',
					'blocked-uri': 'https://evil.com/x.js'
				}
			})
		)
		expect(res.status).toBe(204)
	})

	it('returns 400 when the body is not an object', async () => {
		const { POST } = await import('@/app/api/csp-reports/route')
		const res = await POST(makeRequest('plain string'))
		expect(res.status).toBe(400)
	})

	it('returns 400 when the body has no recognizable CSP fields', async () => {
		const { POST } = await import('@/app/api/csp-reports/route')
		const res = await POST(makeRequest({ unrelated: 'payload' }))
		expect(res.status).toBe(400)
	})
})
