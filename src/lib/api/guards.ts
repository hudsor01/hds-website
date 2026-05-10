/**
 * Mutation Guards for API Routes
 *
 * Composes the three lines of defense for any state-changing route:
 *  1. Same-origin check — rejects cross-origin POSTs that bypass SameSite
 *     cookies and CORS preflight (browser will still send form-encoded
 *     POSTs cross-origin without an Origin verification step)
 *  2. CSRF token check — verifies a signed token issued by /api/csrf, so a
 *     malicious page that *somehow* defeats the origin check (e.g. a
 *     compromised subdomain) still cannot submit on the user's behalf
 *  3. Rate limit — caps abuse from a single IP regardless of intent
 *
 * Browser-initiated beacons (web-vitals, csp-reports) cannot embed a CSRF
 * token; they pass `{ csrf: false }` to require origin + rate-limit only.
 *
 * Routes that authenticate via Bearer admin token (n8n/cron) skip this
 * wrapper entirely — the admin token IS the trust mechanism.
 */

import type { NextRequest } from 'next/server'
import { errorResponse } from '@/lib/api/responses'
import { validateCsrfForMutation } from '@/lib/csrf'
import { createServerLogger } from '@/lib/logger'
import { getUnifiedRateLimiter } from '@/lib/rate-limiter'
import { getClientIp, isSameOriginRequest } from '@/lib/request'

type RateLimitKey =
	| 'api'
	| 'readOnlyApi'
	| 'contactFormApi'
	| 'contactForm'
	| 'newsletter'
	| 'pagespeedApi'
	| 'default'

interface GuardOptions {
	/** Rate-limit tier. Defaults to 'api'. */
	rateLimit?: RateLimitKey
	/** Require a CSRF token on mutating methods. Defaults to true. */
	csrf?: boolean
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export function withMutationGuards(
	handler: (request: NextRequest) => Promise<Response>,
	options: GuardOptions = {}
) {
	const { rateLimit = 'api', csrf = true } = options
	const logger = createServerLogger('mutation-guards')

	return async (request: NextRequest): Promise<Response> => {
		const isMutation = !SAFE_METHODS.has(request.method)

		if (isMutation && !isSameOriginRequest(request)) {
			logger.warn('Cross-origin mutation rejected', {
				origin: request.headers.get('origin') ?? null,
				referer: request.headers.get('referer') ?? null,
				path: request.nextUrl.pathname
			})
			return errorResponse('Forbidden', 403)
		}

		if (isMutation && csrf) {
			const csrfOk = await validateCsrfForMutation(request)
			if (!csrfOk) {
				logger.warn('Missing or invalid CSRF token', {
					path: request.nextUrl.pathname
				})
				return errorResponse('Invalid or missing CSRF token', 403)
			}
		}

		const clientIp = getClientIp(request)
		const isAllowed = await getUnifiedRateLimiter().checkLimit(
			clientIp,
			rateLimit
		)
		if (!isAllowed) {
			logger.warn(`Rate limit exceeded for ${rateLimit}`, {
				ip: clientIp,
				path: request.nextUrl.pathname
			})
			return errorResponse('Too many requests. Please try again later.', 429)
		}

		return handler(request)
	}
}
