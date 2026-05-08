/**
 * PageSpeed Insights API Proxy
 * Fetches performance metrics for a given URL
 */

import { connection, type NextRequest } from 'next/server'
import { withRateLimit } from '@/lib/api/rate-limit-wrapper'
import { errorResponse, successResponse } from '@/lib/api/responses'
import { createServerLogger } from '@/lib/logger'

const logger = createServerLogger('pagespeed-api')
const PAGESPEED_API_URL =
	'https://www.googleapis.com/pagespeedinsights/v5/runPagespeed'

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

	try {
		logger.info('Fetching PageSpeed data', { url })

		// Call PageSpeed Insights API
		const response = await fetch(
			`${PAGESPEED_API_URL}?url=${encodeURIComponent(url)}&strategy=mobile&category=performance`,
			{
				headers: {
					'User-Agent': 'Hudson Digital Solutions Website Analyzer'
				}
			}
		)

		if (!response.ok) {
			logger.error(
				'PageSpeed API error',
				new Error(`Status: ${response.status}`)
			)
			return errorResponse('Failed to fetch performance data', response.status)
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
		logger.error(
			'PageSpeed API error',
			error instanceof Error ? error : new Error(String(error))
		)
		return errorResponse('Failed to analyze website performance', 500)
	}
}

export const GET = withRateLimit(handlePageSpeed, 'pagespeedApi')
