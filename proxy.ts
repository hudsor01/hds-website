/**
 * Next.js 16 Proxy (formerly Middleware)
 *
 * Application-wide request layer. Owns:
 *  - Security headers (CSP, HSTS, frame-options, etc.)
 *  - HTTPS redirect in production
 *  - User-agent blocklist for known scanners
 *  - Cache-Control and CORS for /api/*
 *  - Performance timing header
 *  - /admin/* cookie presence check (defense in depth; the
 *    admin layout server component is the source of truth)
 *
 * Does NOT do CSRF / rate-limit / origin checks any more - those moved to
 * `src/lib/api/guards.ts::withMutationGuards` so they can be opted-in
 * per-route. Browser beacons (`/api/web-vitals`, `/api/csp-reports`)
 * legitimately can't carry a CSRF token, so a blanket proxy-level CSRF
 * gate would have killed them. The proxy used to also rate-limit with
 * a different counter shape than the route wrapper, leading to a real
 * double-decrement; that's gone.
 *
 * Edge runtime by default; matcher excludes static assets.
 */

import { type NextRequest, NextResponse } from 'next/server'
import { env } from '@/env'
import { applySecurityHeaders } from '@/lib/security-headers'

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
	]
}

// User-agent fragments associated with vulnerability scanners. Defense
// in depth - sophisticated attackers spoof UAs trivially, but this
// catches the noisy crawl traffic.
const SUSPICIOUS_UA = [
	/sqlmap/i,
	/nikto/i,
	/nessus/i,
	/masscan/i,
	/zmap/i,
	/nmap/i,
	/gobuster/i,
	/dirb/i
]

export function proxy(request: NextRequest) {
	const url = request.nextUrl
	const start = Date.now()
	const response = NextResponse.next()

	applySecurityHeaders(response)

	// Force HTTPS in production.
	if (
		env.NODE_ENV === 'production' &&
		request.headers.get('x-forwarded-proto') === 'http'
	) {
		return NextResponse.redirect(
			`https://${request.headers.get('host')}${url.pathname}${url.search}`,
			{ status: 301 }
		)
	}

	// Block obvious scanner traffic at the edge.
	const userAgent = request.headers.get('user-agent') ?? ''
	if (SUSPICIOUS_UA.some(pattern => pattern.test(userAgent))) {
		return new NextResponse('Blocked', { status: 403 })
	}

	// /admin/* requires a session cookie. Presence-only check; the
	// admin layout (src/app/admin/layout.tsx) validates the session and
	// enforces the role. This branch keeps unauthenticated traffic out
	// of the React server-render path and gives bots a quick bounce.
	if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
		const sessionCookie = request.cookies.get('better-auth.session_token')
		if (!sessionCookie) {
			const signInUrl = new URL('/auth/sign-in', request.url)
			signInUrl.searchParams.set('from', url.pathname + url.search)
			return NextResponse.redirect(signInUrl, { status: 307 })
		}
	}

	// Cache-Control for top-level static-ish pages.
	if (url.pathname.match(/^\/(about|services|pricing|privacy)$/)) {
		response.headers.set(
			'Cache-Control',
			'public, s-maxage=3600, stale-while-revalidate=86400'
		)
	} else if (url.pathname.startsWith('/blog')) {
		response.headers.set(
			'Cache-Control',
			'public, s-maxage=7200, stale-while-revalidate=604800'
		)
	} else if (url.pathname.startsWith('/api')) {
		response.headers.set('Cache-Control', 'no-store, max-age=0')
		response.headers.set(
			'Access-Control-Allow-Origin',
			env.NODE_ENV === 'production' ? 'https://hudsondigitalsolutions.com' : '*'
		)
		response.headers.set(
			'Access-Control-Allow-Methods',
			'GET, POST, PUT, DELETE, OPTIONS'
		)
		response.headers.set(
			'Access-Control-Allow-Headers',
			'Content-Type, Authorization, X-CSRF-Token'
		)
	}

	response.headers.set('Server-Timing', `proxy;dur=${Date.now() - start}`)
	return response
}
