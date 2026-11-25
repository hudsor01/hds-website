/**
 * /api/pagespeed tests.
 *
 * The handler proxies to Google's PageSpeed API; we never want to forward
 * URLs that point at internal infrastructure or non-http(s) schemes. The
 * guard logic is exercised here without needing a real network round
 * trip. The upstream call is stubbed with a fetch spy to pin the endpoint,
 * the response contract the browser parses and the Lighthouse failure
 * modes (runtimeError, null score).
 */

import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { NextRequest } from 'next/server'
import { apiErrorSchema, pagespeedSuccessSchema } from '@/lib/schemas/pagespeed'
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

	it('rejects localhost / *.local / RFC1918 ranges plus 0.0.0.0/8', async () => {
		const { GET } = await import('@/app/api/pagespeed/route')
		for (const url of [
			'http://localhost/',
			'http://something.local/',
			'http://10.0.0.1/',
			'http://172.16.0.1/',
			'http://172.31.1.1/',
			'http://192.168.1.1/',
			'http://127.0.0.1/',
			'http://169.254.169.254/latest/meta-data/',
			// 0.0.0.0/8 routes to localhost on Linux — must not be reachable
			'http://0.0.0.0/',
			'http://0.255.255.255/'
		]) {
			const res = await GET(makeRequest(url))
			expect(res.status).toBe(400)
		}
	})

	it('rejects IPv6 loopback, unique-local, and IPv4-mapped IPv6', async () => {
		const { GET } = await import('@/app/api/pagespeed/route')
		for (const url of [
			'http://[::1]/',
			'http://[fc00::1]/',
			'http://[fd12:3456:789a::1]/',
			// IPv4-mapped IPv6 — URL parser normalises ::ffff:127.0.0.1
			// to ::ffff:7f00:1, which would have bypassed the IPv4 regex
			// and the prior "::1 / fc / fd" check. Now blocked outright
			// by the ::ffff: prefix rule.
			'http://[::ffff:127.0.0.1]/',
			'http://[::ffff:0:0]/'
		]) {
			const res = await GET(makeRequest(url))
			expect(res.status).toBe(400)
		}
	})
})

const PSI_ENDPOINT =
	'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'

function lighthouseBody(overrides: Record<string, unknown> = {}) {
	return {
		lighthouseResult: {
			categories: { performance: { score: 0.35 } },
			audits: {
				'largest-contentful-paint': {
					displayValue: '6.1 s',
					numericValue: 6100,
					score: 0.1
				},
				'cumulative-layout-shift': {
					displayValue: '0.02',
					numericValue: 0.02,
					score: 1
				},
				'total-blocking-time': {
					displayValue: '880 ms',
					numericValue: 880,
					score: 0.2
				},
				'first-contentful-paint': {
					displayValue: '2.9 s',
					numericValue: 2900,
					score: 0.5
				}
			},
			...overrides
		}
	}
}

function stubFetch(body: unknown, status = 200) {
	return spyOn(globalThis, 'fetch').mockImplementation((async (
		_input: string | URL | Request,
		_init?: RequestInit
	) => Response.json(body, { status })) as typeof fetch)
}

describe('GET /api/pagespeed (upstream call and response contract)', () => {
	beforeEach(() => {
		setupApiMocks()
	})

	afterEach(() => {
		cleanupMocks()
	})

	it('calls the documented pagespeedonline v5 endpoint for a mobile run', async () => {
		const fetchSpy = stubFetch(lighthouseBody())
		const { GET } = await import('@/app/api/pagespeed/route')
		await GET(makeRequest('https://example.com/'))

		// Count only calls to Google: other modules loaded by the route (rate
		// limiter, logging) may use fetch too, and CI runs them, so a raw call
		// count is environment-dependent.
		const psiCalls = fetchSpy.mock.calls.filter(([input]) =>
			String(input).startsWith('https://www.googleapis.com/')
		)
		expect(psiCalls).toHaveLength(1)
		const requested = new URL(String(psiCalls[0]?.[0]))
		expect(`${requested.origin}${requested.pathname}`).toBe(PSI_ENDPOINT)
		expect(requested.searchParams.get('url')).toBe('https://example.com/')
		expect(requested.searchParams.get('strategy')).toBe('mobile')
		expect(requested.searchParams.get('category')).toBe('performance')
	})

	it('returns { success, data: { metrics } } that the client schema accepts', async () => {
		stubFetch(lighthouseBody())
		const { GET } = await import('@/app/api/pagespeed/route')
		const res = await GET(makeRequest('https://example.com/'))
		expect(res.status).toBe(200)

		const parsed = pagespeedSuccessSchema.safeParse(await res.json())
		expect(parsed.success).toBe(true)
		if (!parsed.success) {
			return
		}
		expect(parsed.data.data.metrics).toEqual({
			performanceScore: 35,
			lcp: { displayValue: '6.1 s', numericValue: 6100 },
			cls: { displayValue: '0.02', numericValue: 0.02 },
			tbt: { displayValue: '880 ms', numericValue: 880 },
			fcp: { displayValue: '2.9 s', numericValue: 2900 }
		})
	})

	it('returns an error instead of 0/100 when Lighthouse reports a runtimeError', async () => {
		stubFetch(
			lighthouseBody({
				runtimeError: {
					code: 'NO_FCP',
					message: 'The page did not paint any content.'
				},
				categories: { performance: { score: null } }
			})
		)
		const { GET } = await import('@/app/api/pagespeed/route')
		const res = await GET(makeRequest('https://example.com/'))
		expect(res.status).toBe(422)
		const parsed = apiErrorSchema.safeParse(await res.json())
		expect(parsed.success).toBe(true)
		expect(parsed.data?.error).toContain('NO_FCP')
	})

	it('returns an error instead of 0/100 when the performance score is null', async () => {
		stubFetch(lighthouseBody({ categories: { performance: { score: null } } }))
		const { GET } = await import('@/app/api/pagespeed/route')
		const res = await GET(makeRequest('https://example.com/'))
		expect(res.status).toBe(422)
		expect(apiErrorSchema.safeParse(await res.json()).success).toBe(true)
	})

	it('returns 502, not a crash, when lighthouseResult is missing', async () => {
		stubFetch({ error: { message: 'unexpected' } })
		const { GET } = await import('@/app/api/pagespeed/route')
		const res = await GET(makeRequest('https://example.com/'))
		expect(res.status).toBe(502)
		expect(apiErrorSchema.safeParse(await res.json()).success).toBe(true)
	})

	it('passes upstream 429 and 400 through with readable messages', async () => {
		const { GET } = await import('@/app/api/pagespeed/route')

		stubFetch({ error: { code: 429 } }, 429)
		const limited = await GET(makeRequest('https://example.com/'))
		expect(limited.status).toBe(429)
		expect(apiErrorSchema.safeParse(await limited.json()).data?.error).toMatch(
			/rate limit/i
		)

		cleanupMocks()
		setupApiMocks()
		stubFetch({ error: { code: 400 } }, 400)
		const badUrl = await GET(makeRequest('https://example.com/'))
		expect(badUrl.status).toBe(400)
		expect(apiErrorSchema.safeParse(await badUrl.json()).success).toBe(true)
	})

	it('returns 504 when the upstream call times out', async () => {
		spyOn(globalThis, 'fetch').mockImplementation((async (
			_input: string | URL | Request,
			_init?: RequestInit
		): Promise<Response> => {
			throw new DOMException('timed out', 'TimeoutError')
		}) as typeof fetch)
		const { GET } = await import('@/app/api/pagespeed/route')
		const res = await GET(makeRequest('https://example.com/'))
		expect(res.status).toBe(504)
	})

	it('allows a 60 second function duration for slow mobile runs', async () => {
		const route = await import('@/app/api/pagespeed/route')
		expect(route.maxDuration).toBe(60)
	})
})

describe('GET /api/pagespeed (SSRF guard gaps, QA-17)', () => {
	beforeEach(() => {
		setupApiMocks()
	})

	afterEach(() => {
		cleanupMocks()
	})

	const REJECTED = [
		// IPv6 link-local, unspecified, IPv4-compatible and NAT64
		'http://[fe80::1]/',
		'http://[febf::1]/',
		'http://[::]/',
		'http://[::127.0.0.1]/',
		'http://[64:ff9b::7f00:1]/',
		'http://[ff02::1]/',
		// Trailing-dot internal names
		'http://localhost./',
		'http://LOCALHOST./',
		'http://app.localhost./',
		// CGNAT, multicast and broadcast
		'http://100.64.0.1/',
		'http://100.127.255.255/',
		'http://224.0.0.1/',
		'http://255.255.255.255/',
		// Other spellings of 127.0.0.1 (URL canonicalises them)
		'http://2130706433/',
		'http://0x7f.1/',
		'http://127.1/',
		'http://127.0.0.1./',
		// Not a URL at all
		'not a url'
	]

	it('rejects every gap with a 400 and never calls fetch', async () => {
		// Stubbed so a regression could never reach Google; the spy can
		// carry calls from earlier tests in this file
		const fetchSpy = stubFetch(lighthouseBody())
		fetchSpy.mockClear()
		const { GET } = await import('@/app/api/pagespeed/route')
		for (const url of REJECTED) {
			const res = await GET(makeRequest(url))
			expect(res.status, url).toBe(400)
			const body = apiErrorSchema.safeParse(await res.json())
			expect(body.success, url).toBe(true)
		}
		const psiCalls = fetchSpy.mock.calls.filter(([input]) =>
			String(input).startsWith('https://www.googleapis.com/')
		)
		expect(psiCalls).toHaveLength(0)
	})

	it('rejects an empty url= as missing', async () => {
		const { GET } = await import('@/app/api/pagespeed/route')
		const res = await GET(
			new NextRequest('http://localhost/api/pagespeed?url=')
		)
		expect(res.status).toBe(400)
	})

	it('lets public domains that start with fc or fd through to PSI', async () => {
		const fetchSpy = stubFetch(lighthouseBody())
		fetchSpy.mockClear()
		const { GET } = await import('@/app/api/pagespeed/route')
		const allowed = ['https://fdic.gov/', 'https://fcc.gov/', 'https://fd.io/']
		for (const url of allowed) {
			const res = await GET(makeRequest(url))
			expect(res.status, url).toBe(200)
		}
		const requested = fetchSpy.mock.calls
			.map(([input]) => String(input))
			.filter(input => input.startsWith('https://www.googleapis.com/'))
			.map(input => new URL(input))
		expect(requested.map(u => `${u.origin}${u.pathname}`)).toEqual(
			allowed.map(() => PSI_ENDPOINT)
		)
		expect(requested.map(u => u.searchParams.get('url'))).toEqual(allowed)
	})
})
