/**
 * PageSpeed Insights API Proxy
 * Fetches performance metrics for a given URL
 */

import { connection, type NextRequest } from 'next/server'
import { env } from '@/env'
import { withRateLimit } from '@/lib/api/rate-limit-wrapper'
import { errorResponse, successResponse } from '@/lib/api/responses'
import { createServerLogger } from '@/lib/logger'

const logger = createServerLogger('pagespeed-api')
const PAGESPEED_API_URL =
	'https://www.googleapis.com/pagespeedinsights/v5/runPagespeed'

// Stay under Vercel Hobby's 10-second function ceiling. PageSpeed Insights
// can legitimately take 30-60s for slow sites — without an explicit abort
// the upstream call ran past Vercel's hard timeout, which surfaces to the
// browser as a generic 500 and to logs as "PageSpeed API error: Object"
// (audit #236). Fail fast with a useful message instead.
const PAGESPEED_FETCH_TIMEOUT_MS = 9_000

/**
 * Reject URLs that point at private/internal address space. The pagespeed
 * tool is meant for public-internet URLs only — defending against SSRF if
 * Google's API ever changes behavior or if a future caller fetches
 * server-side themselves.
 *
 * Blocks:
 *  - non-http(s) schemes (file:, gopher:, ftp:, etc.)
 *  - bare hostnames that are known internal (localhost, *.local)
 *  - IPv4 in private ranges (10/8, 172.16/12, 192.168/16, 169.254/16, 127/8)
 *  - IPv6 loopback (::1) and unique-local (fc00::/7)
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

	// URL.hostname strips brackets from IPv6 addresses on most engines,
	// but keep a defensive trim for the rare case where it doesn't.
	const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '')
	if (
		host === 'localhost' ||
		host.endsWith('.local') ||
		host.endsWith('.internal') ||
		host.endsWith('.localhost')
	) {
		return false
	}

	// IPv4 numeric check
	const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
	if (ipv4) {
		const octets = ipv4.slice(1, 5).map(n => Number(n))
		if (octets.some(n => n > 255)) {
			return false
		}
		const [a, b] = octets as [number, number, number, number]
		// 0.0.0.0/8 is the "this host on this network" range — on Linux
		// it routes to localhost. Block the entire /8.
		if (a === 0) {
			return false
		}
		if (a === 10 || a === 127 || (a === 169 && b === 254)) {
			return false
		}
		if (a === 172 && b >= 16 && b <= 31) {
			return false
		}
		if (a === 192 && b === 168) {
			return false
		}
	}

	// IPv6: loopback (::1), unique-local (fc00::/7 → fc00–fdff prefixes),
	// and IPv4-mapped IPv6 (::ffff:a.b.c.d, normalised by URL parser to
	// `::ffff:` followed by hex). The mapped form bypasses the IPv4 regex
	// above, so explicitly reject anything starting with `::ffff:`.
	if (
		host === '::1' ||
		host.startsWith('fc') ||
		host.startsWith('fd') ||
		host.startsWith('::ffff:')
	) {
		return false
	}

	return true
}

interface PageSpeedResponse {
	lighthouseResult: {
		categories: {
			performance: {
				score: number
			}
		}
		audits: {
			'first-contentful-paint': { displayValue: string; score: number }
			'largest-contentful-paint': { displayValue: string; score: number }
			'total-blocking-time': { displayValue: string; score: number }
			'cumulative-layout-shift': { displayValue: string; score: number }
			'speed-index': { displayValue: string; score: number }
		}
	}
}

async function handlePageSpeed(request: NextRequest) {
	const { searchParams } = new URL(request.url)
	const url = searchParams.get('url')

	if (!url) {
		return errorResponse('URL parameter is required', 400)
	}

	if (!isPublicHttpUrl(url)) {
		return errorResponse('URL must be a public http(s) address', 400)
	}

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
					'Rate limit hit on the PageSpeed API. Try again in a minute, or contact us if it keeps happening.',
					429
				)
			}
			return errorResponse(
				'PageSpeed could not analyze that URL. Make sure the site is reachable from the public internet and try again.',
				response.status
			)
		}

		const data = (await response.json()) as PageSpeedResponse

		// Extract key metrics
		const performanceScore = Math.round(
			(data.lighthouseResult.categories.performance.score || 0) * 100
		)
		const audits = data.lighthouseResult.audits

		const metrics = {
			performanceScore,
			fcp: audits['first-contentful-paint']?.displayValue || 'N/A',
			lcp: audits['largest-contentful-paint']?.displayValue || 'N/A',
			tbt: audits['total-blocking-time']?.displayValue || 'N/A',
			cls: audits['cumulative-layout-shift']?.displayValue || 'N/A',
			speedIndex: audits['speed-index']?.displayValue || 'N/A',
			fcpScore: Math.round(
				(audits['first-contentful-paint']?.score || 0) * 100
			),
			lcpScore: Math.round(
				(audits['largest-contentful-paint']?.score || 0) * 100
			),
			tbtScore: Math.round((audits['total-blocking-time']?.score || 0) * 100),
			clsScore: Math.round(
				(audits['cumulative-layout-shift']?.score || 0) * 100
			)
		}

		logger.info('PageSpeed data fetched successfully', {
			url,
			performanceScore
		})

		return successResponse({ metrics })
	} catch (error) {
		const err = error instanceof Error ? error : new Error(String(error))
		logger.error('PageSpeed API error', err)
		// `AbortSignal.timeout()` rejects with a DOMException whose `name`
		// is "TimeoutError" — distinguishable from generic fetch failures.
		// Translating it to a 504 with a user-readable message keeps the
		// tool honest when the upstream is simply slow (audit #236).
		if (err.name === 'TimeoutError' || err.name === 'AbortError') {
			return errorResponse(
				'PageSpeed took too long to analyze that URL. Slow sites can exceed our budget — try again, or run a Lighthouse audit in your browser DevTools instead.',
				504
			)
		}
		return errorResponse('Failed to analyze website performance', 500)
	}
}

export const GET = withRateLimit(handlePageSpeed, 'pagespeedApi')
