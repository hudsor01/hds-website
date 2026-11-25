/**
 * PageSpeed Insights API Proxy
 * Fetches performance metrics for a given URL
 */

import { connection, type NextRequest } from 'next/server'
import { z } from 'zod'
import { env } from '@/env'
import { withRateLimit } from '@/lib/api/rate-limit-wrapper'
import { errorResponse, successResponse } from '@/lib/api/responses'
import { createServerLogger } from '@/lib/logger'
import {
	type LabMetric,
	type PagespeedMetrics,
	type PsiResponse,
	psiResponseSchema
} from '@/lib/schemas/pagespeed'

const logger = createServerLogger('pagespeed-api')
// Documented endpoint:
// https://developers.google.com/speed/docs/insights/v5/get-started
const PAGESPEED_API_URL =
	'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'

// A mobile Lighthouse run through PSI routinely takes 15 to 60 seconds.
// maxDuration lets the function live for 60s (allowed with cacheComponents:
// only dynamic, dynamicParams, revalidate, fetchCache and runtime are
// removed). The upstream fetch aborts at 55s so the route still answers
// with a readable 504 instead of the platform killing it mid-request.
export const maxDuration = 60
const PAGESPEED_FETCH_TIMEOUT_MS = 55_000

const urlParamSchema = z.url()

/** IPv4 ranges that are private, local or not unicast. */
function isBlockedIpv4(host: string): boolean {
	const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
	if (!ipv4) {
		return false
	}
	const octets = ipv4.slice(1, 5).map(n => Number(n))
	if (octets.some(n => n > 255)) {
		return true
	}
	const [a, b] = octets as [number, number, number, number]
	return (
		// 0.0.0.0/8 is "this host on this network"; on Linux it routes to
		// localhost
		a === 0 ||
		a === 10 ||
		a === 127 ||
		(a === 169 && b === 254) ||
		(a === 172 && b >= 16 && b <= 31) ||
		(a === 192 && b === 168) ||
		// 100.64.0.0/10 carrier-grade NAT
		(a === 100 && b >= 64 && b <= 127) ||
		// 224.0.0.0/4 multicast, 240.0.0.0/4 reserved, 255.255.255.255
		a >= 224
	)
}

/**
 * IPv6 ranges that are not public unicast. Only called for an IPv6
 * literal, so a domain such as fdic.gov never meets the fc00::/7 rule.
 * URL has already normalised the address (lower case, leading zeros
 * dropped, an embedded IPv4 written as hex).
 */
function isBlockedIpv6(host: string): boolean {
	const hextets = host.split(':')
	const first = Number.parseInt(hextets[0] || '0', 16)
	return (
		// ::/8 covers :: (unspecified), ::1 (loopback), ::a.b.c.d
		// (IPv4-compatible, e.g. ::7f00:1) and ::ffff:a.b.c.d (IPv4-mapped)
		(first & 0xff00) === 0 ||
		// fc00::/7 unique local
		(first & 0xfe00) === 0xfc00 ||
		// fe80::/10 link-local and fec0::/10 old site-local
		(first & 0xffc0) === 0xfe80 ||
		(first & 0xffc0) === 0xfec0 ||
		// ff00::/8 multicast
		(first & 0xff00) === 0xff00 ||
		// 64:ff9b::/32 NAT64, which embeds an IPv4 address
		(hextets[0] === '64' && hextets[1] === 'ff9b')
	)
}

/**
 * Reject URLs that point at private/internal address space. The pagespeed
 * tool is meant for public-internet URLs only. The route never fetches the
 * URL itself (only Google's API does), but this defends against SSRF if
 * Google's API ever changes behavior or a future caller fetches it
 * server-side.
 *
 * Blocks:
 *  - non-http(s) schemes (file:, gopher:, ftp:, etc.)
 *  - internal names (localhost, *.localhost, *.local, *.internal), with
 *    or without a trailing dot
 *  - IPv4 0/8, 10/8, 127/8, 169.254/16, 172.16/12, 192.168/16,
 *    100.64/10 and 224/4 upward (multicast, reserved, broadcast). URL
 *    canonicalises 2130706433, 0x7f.1 and 127.1 to 127.0.0.1 first
 *  - IPv6 ::/8 (unspecified, loopback, IPv4-compatible, IPv4-mapped),
 *    fc00::/7, fe80::/10, fec0::/10, ff00::/8 and 64:ff9b::/32
 *
 * A DNS name that resolves to a private address cannot be caught without
 * resolving it, which is not needed while only Google fetches the URL.
 */
function isPublicHttpUrl(rawUrl: string): boolean {
	let parsed: URL
	try {
		parsed = new URL(rawUrl)
	} catch {
		return false
	}
	if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
		return false
	}

	const hostname = parsed.hostname.toLowerCase()
	if (hostname.startsWith('[')) {
		return !isBlockedIpv6(hostname.slice(1, -1))
	}

	// "localhost." is the same host as "localhost"
	const host = hostname.endsWith('.') ? hostname.slice(0, -1) : hostname
	if (
		host === '' ||
		host === 'localhost' ||
		host.endsWith('.localhost') ||
		host.endsWith('.local') ||
		host.endsWith('.internal')
	) {
		return false
	}

	return !isBlockedIpv4(host)
}

function labMetric(
	audits: NonNullable<PsiResponse['lighthouseResult']['audits']>,
	id: string
): LabMetric {
	const audit = audits[id]
	return {
		displayValue: audit?.displayValue ?? 'N/A',
		numericValue: audit?.numericValue ?? null
	}
}

async function handlePageSpeed(request: NextRequest) {
	const { searchParams } = new URL(request.url)
	const rawUrl = searchParams.get('url')

	if (!rawUrl) {
		return errorResponse('URL parameter is required', 400)
	}

	const parsedUrl = urlParamSchema.safeParse(rawUrl)
	if (!parsedUrl.success || !isPublicHttpUrl(parsedUrl.data)) {
		return errorResponse(
			'Enter a public http or https address, like https://example.com',
			400
		)
	}

	const url = parsedUrl.data

	// connection() forces dynamic rendering; only call it once we know we
	// have a real URL to fetch. Calling it for invalid input wastes a
	// dynamic-segment opt-in and (in unit tests) throws because there's
	// no request scope.
	await connection()

	const apiKey = env.PAGESPEED_API_KEY
	const requestUrl = `${PAGESPEED_API_URL}?url=${encodeURIComponent(url)}&strategy=mobile&category=performance${
		apiKey ? `&key=${encodeURIComponent(apiKey)}` : ''
	}`

	try {
		logger.info('Fetching PageSpeed data', {
			url,
			hasApiKey: Boolean(apiKey)
		})

		// AbortSignal.timeout() rejects the fetch with a TimeoutError if the
		// upstream call exceeds the budget. Caught below and translated to a
		// 504 + a user-readable message that names the failure mode instead
		// of the generic "Failed to analyze website" the route used to ship.
		const response = await fetch(requestUrl, {
			headers: {
				'User-Agent': 'Hudson Digital Solutions Website Analyzer'
			},
			signal: AbortSignal.timeout(PAGESPEED_FETCH_TIMEOUT_MS)
		})

		if (!response.ok) {
			logger.error(
				'PageSpeed API error',
				new Error(`Status: ${response.status}`)
			)
			// 429 from Google = anonymous rate limit (no key) or per-project
			// quota exhausted. Surface a different message so the operator
			// knows to add or rotate PAGESPEED_API_KEY.
			if (response.status === 429) {
				return errorResponse(
					'Rate limit hit on the PageSpeed API. Try again in a minute, or contact me if it keeps happening.',
					429
				)
			}
			// Google answers 400 when Lighthouse cannot load the page itself
			// (DNS failure, blocked crawler, non-HTML document).
			if (response.status === 400) {
				return errorResponse(
					'PageSpeed could not load that URL. Make sure the site is reachable from the public internet and try again.',
					400
				)
			}
			return errorResponse(
				'PageSpeed is not responding right now. Try again in a few minutes.',
				502
			)
		}

		const parsed = psiResponseSchema.safeParse(await response.json())
		if (!parsed.success) {
			logger.error('PageSpeed returned an unexpected response', parsed.error)
			return errorResponse(
				'PageSpeed returned a response I could not read. Try again in a few minutes.',
				502
			)
		}

		const {
			runtimeError,
			categories,
			audits = {}
		} = parsed.data.lighthouseResult

		// Lighthouse reports a failed run inside a 200 response: a
		// runtimeError plus a null score. Treating null as 0 would show a
		// real-looking 0/100 for a page that was never measured.
		if (runtimeError) {
			logger.warn('Lighthouse runtime error', {
				url,
				code: runtimeError.code
			})
			return errorResponse(
				`Lighthouse could not finish testing that page (${runtimeError.code}). Make sure it loads in a normal browser and try again.`,
				422
			)
		}

		const score = categories?.performance?.score
		if (score === null || score === undefined) {
			logger.warn('Lighthouse returned no performance score', { url })
			return errorResponse(
				'Lighthouse ran but did not produce a performance score for that page. Try again.',
				422
			)
		}

		const performanceScore = Math.round(score * 100)
		const metrics: PagespeedMetrics = {
			performanceScore,
			lcp: labMetric(audits, 'largest-contentful-paint'),
			cls: labMetric(audits, 'cumulative-layout-shift'),
			tbt: labMetric(audits, 'total-blocking-time'),
			fcp: labMetric(audits, 'first-contentful-paint')
		}

		logger.info('PageSpeed data fetched successfully', {
			url,
			performanceScore
		})

		return successResponse({ metrics })
	} catch (error) {
		logger.error('PageSpeed API error', error)
		// `AbortSignal.timeout()` rejects with a DOMException whose `name`
		// is "TimeoutError", distinguishable from generic fetch failures.
		// Translating it to a 504 with a user-readable message keeps the
		// tool honest when the upstream is simply slow (audit #236).
		if (
			error instanceof Error &&
			(error.name === 'TimeoutError' || error.name === 'AbortError')
		) {
			return errorResponse(
				'PageSpeed did not finish analyzing that URL in time. Try again, or run a Lighthouse audit in your browser DevTools.',
				504
			)
		}
		return errorResponse(
			'Something went wrong while analyzing that URL. Try again in a few minutes.',
			500
		)
	}
}

export const GET = withRateLimit(handlePageSpeed, 'pagespeedApi')
