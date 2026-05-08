/**
 * /api/pagespeed SSRF guard tests.
 *
 * The handler proxies to Google's PageSpeed API; we never want to forward
 * URLs that point at internal infrastructure or non-http(s) schemes. The
 * guard logic is exercised here without needing a real network round
 * trip.
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { NextRequest } from 'next/server'
import { cleanupMocks, setupApiMocks } from '../test-utils'

function makeRequest(url: string | null) {
	const u = url
		? `http://localhost/api/pagespeed?url=${encodeURIComponent(url)}`
		: 'http://localhost/api/pagespeed'
	return new NextRequest(u)
}

describe('GET /api/pagespeed (SSRF guard)', () => {
	beforeEach(() => {
		setupApiMocks()
	})

	afterEach(() => {
		cleanupMocks()
	})

	it('returns 400 when url is missing', async () => {
		const { GET } = await import('@/app/api/pagespeed/route')
		const res = await GET(makeRequest(null))
		expect(res.status).toBe(400)
	})

	it('rejects non-http(s) schemes', async () => {
		const { GET } = await import('@/app/api/pagespeed/route')
		for (const url of [
			'file:///etc/passwd',
			'gopher://example.com',
			'ftp://example.com'
		]) {
			const res = await GET(makeRequest(url))
			expect(res.status).toBe(400)
		}
	})

	it('rejects localhost / *.local / RFC1918 ranges', async () => {
		const { GET } = await import('@/app/api/pagespeed/route')
		for (const url of [
			'http://localhost/',
			'http://something.local/',
			'http://10.0.0.1/',
			'http://172.16.0.1/',
			'http://172.31.1.1/',
			'http://192.168.1.1/',
			'http://127.0.0.1/',
			'http://169.254.169.254/latest/meta-data/'
		]) {
			const res = await GET(makeRequest(url))
			expect(res.status).toBe(400)
		}
	})

	it('rejects IPv6 loopback and unique-local', async () => {
		const { GET } = await import('@/app/api/pagespeed/route')
		for (const url of [
			'http://[::1]/',
			'http://[fc00::1]/',
			'http://[fd12:3456:789a::1]/'
		]) {
			const res = await GET(makeRequest(url))
			expect(res.status).toBe(400)
		}
	})
})
