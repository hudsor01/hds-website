/**
 * PageSpeed Insights API Proxy
 * Fetches performance metrics for a given URL
 */

import { connection, type NextRequest } from 'next/server'
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
	const url = searchParams.get('url')

	if (!url) {
		return errorResponse('URL parameter is required', 400)
	}

	if (!isPublicHttpUrl(url)) {
		return errorResponse(
			'Enter a public http or https address, like https://example.com',
			400
		)
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
