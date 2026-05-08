/**
 * /api/web-vitals smoke tests.
 *
 * Validates the Zod schema gate at the route boundary. The DB write is
 * deferred via next/server's after() (mocked to a no-op in setup.ts).
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { NextRequest } from 'next/server'
import { cleanupMocks, setupApiMocks } from '../test-utils'

function makeRequest(body: unknown): NextRequest {
	return new NextRequest('http://localhost/api/web-vitals', {
		method: 'POST',
		body: JSON.stringify(body),
		headers: { 'Content-Type': 'application/json' }
	})
}

const validVital = {
	name: 'LCP',
	value: 1234.5,
	rating: 'good',
	delta: 100,
	id: 'v1-1'
}

describe('POST /api/web-vitals', () => {
	beforeEach(() => {
		setupApiMocks()
	})

	afterEach(() => {
		cleanupMocks()
	})

	it('returns 200 for a well-formed metric', async () => {
		const { POST } = await import('@/app/api/web-vitals/route')
		const res = await POST(makeRequest(validVital))
		expect(res.status).toBe(200)
	})

	it('returns 400 for an unknown metric name', async () => {
		const { POST } = await import('@/app/api/web-vitals/route')
		const res = await POST(makeRequest({ ...validVital, name: 'UNKNOWN' }))
		expect(res.status).toBe(400)
	})

	it('returns 400 for an unknown rating', async () => {
		const { POST } = await import('@/app/api/web-vitals/route')
		const res = await POST(makeRequest({ ...validVital, rating: 'meh' }))
		expect(res.status).toBe(400)
	})

	it('returns 400 when value is not a number', async () => {
		const { POST } = await import('@/app/api/web-vitals/route')
		const res = await POST(
			makeRequest({ ...validVital, value: 'twelve hundred' })
		)
		expect(res.status).toBe(400)
	})
})
