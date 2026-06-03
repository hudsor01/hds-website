/**
 * Request Utilities
 * Centralized utilities for extracting trustworthy info from Next.js requests.
 *
 * On Vercel, the client IP is delivered via two headers:
 *  - `x-real-ip` — set unilaterally by Vercel's edge to the connecting peer
 *  - `x-forwarded-for` — comma-separated chain ending in the Vercel hop
 *
 * The LEFTMOST `x-forwarded-for` entry is attacker-controlled (a client can
 * pre-set the header before it ever hits Vercel; Vercel appends rather than
 * strips). The RIGHTMOST entry is the trusted hop. Prefer `x-real-ip` and
 * fall back to the rightmost `x-forwarded-for` value.
 */

import type { NextRequest } from 'next/server'
import { env } from '@/env'

const LOCALHOST = '127.0.0.1'

function readClientIp(headers: Headers): string {
	const realIp = headers.get('x-real-ip')?.trim()
	if (realIp) {
		return realIp
	}

	const forwardedFor = headers.get('x-forwarded-for')
	if (forwardedFor) {
		// Take the rightmost entry — that's the trusted upstream hop.
		const parts = forwardedFor
			.split(',')
			.map(p => p.trim())
			.filter(Boolean)
		const lastIp = parts.at(-1)
		if (lastIp) {
			return lastIp
		}
	}

	return LOCALHOST
}

/**
 * Extract client IP from a NextRequest.
 */
export function getClientIp(request: NextRequest): string {
	return readClientIp(request.headers)
}

/**
 * Verify the request originated from this site (or an explicitly allowed
 * origin). Defends against cross-origin form-encoded POSTs that bypass
 * SameSite cookies and CORS preflight.
 *
 * Returns true when:
 *  - method is safe (GET/HEAD/OPTIONS), OR
 *  - Origin/Referer matches the configured BASE_URL host
 */
export function isSameOriginRequest(request: Request): boolean {
	if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
		return true
	}

	const allowedHost = (() => {
		try {
			return new URL(env.BASE_URL).host
		} catch {
			return null
		}
	})()
	if (!allowedHost) {
		return false
	}

	const origin = request.headers.get('origin')
	if (origin) {
		try {
			return new URL(origin).host === allowedHost
		} catch {
			return false
		}
	}

	// Some browsers/clients omit Origin on same-origin POSTs and only send
	// Referer. Accept that as a fallback.
	const referer = request.headers.get('referer')
	if (referer) {
		try {
			return new URL(referer).host === allowedHost
		} catch {
			return false
		}
	}

	return false
}
