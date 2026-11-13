/**
 * Next.js 16 Proxy (formerly Middleware)
 *
 * Lives in src/ because the app router lives in src/app: Next only loads
 * proxy.ts (and instrumentation*.ts) from the directory that holds `app`.
 *
 * Application-wide request layer. Owns:
 *  - Security headers (CSP, HSTS, frame-options, etc.)
 *  - User-agent blocklist for known scanners
 *  - CORS for /api/*
 *  - Performance timing header
 *  - /admin/* cookie presence check (defense in depth; the
 *    admin layout server component is the source of truth)
 *
 * Does NOT redirect HTTP to HTTPS. Vercel upgrades at its edge, and in
 * front of `next start` / the standalone server Next reports
 * x-forwarded-proto as `http` for every plain request, so a redirect here
 * would loop any deploy without a TLS terminator. HSTS covers repeat visits.
 *
 * Does NOT set Cache-Control. Pages are owned by cacheComponents and route
 * handlers set their own headers (e.g. the RSS feed's public max-age). A
 * proxy-set Cache-Control wins over the one Next computes, so setting it
 * here would mark dynamic renders and 404s as CDN-cacheable.
 *
 * Does NOT do CSRF / rate-limit / origin checks any more - those moved to
 * `src/lib/api/guards.ts::withMutationGuards` so they can be opted-in
 * per-route. Browser beacons (`/api/web-vitals`, `/api/csp-reports`)
 * legitimately can't carry a CSRF token, so a blanket proxy-level CSRF
 * gate would have killed them. The proxy used to also rate-limit with
 * a different counter shape than the route wrapper, leading to a real
 * double-decrement; that's gone.
 *
 * Runs on the Node.js runtime (the only runtime Next 16 allows for proxy).
 * On Vercel every matched request is a function invocation, so the matcher
 * skips anything that never needs document headers: build assets, public
 * files, metadata image/text routes (plus /llms.txt), Vercel beacons, the Sentry tunnel
 * (`/monitoring`, see next.config.ts tunnelRoute), router prefetches, the
 * same-origin telemetry beacons (web-vitals, csp-reports, error-report),
 * uptime pings (/api/health) and RSS feed polls (/api/rss/* plus the
 * vercel.json feed rewrites). Routing middleware runs before the CDN cache,
 * so a matched feed would cost an invocation on every poll.
 */

import { type NextRequest, NextResponse, type ProxyConfig } from 'next/server'
import { env } from '@/env'
import { applySecurityHeaders } from '@/lib/security-headers'

export const config = {
	matcher: [
		{
			source:
				'/((?!_next/static|_next/image|_vercel|monitoring|api/(?:web-vitals|csp-reports|error-report|health)$|api/rss/|(?:blog/)?(?:rss|feed)$|(?:rss|feed)\\.xml$|favicon\\.ico|robots\\.txt|llms\\.txt|sitemap\\.xml|manifest\\.json|offline\\.html|icon|apple-icon|opengraph-image|twitter-image|fonts/|.*/(?:opengraph|twitter)-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
			missing: [
				{ type: 'header', key: 'next-router-prefetch' },
				{ type: 'header', key: 'purpose', value: 'prefetch' }
			]
		}
	]
} satisfies ProxyConfig

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

	applySecurityHeaders(response, { isDev: env.NODE_ENV === 'development' })

	// Block obvious scanner traffic before it reaches a render.
	const userAgent = request.headers.get('user-agent') ?? ''
	if (SUSPICIOUS_UA.some(pattern => pattern.test(userAgent))) {
		return new NextResponse('Blocked', { status: 403 })
	}

	// /admin/* requires a session cookie. Presence-only check; the
	// admin layout (src/app/(admin)/admin/layout.tsx) validates the session
	// and enforces the role. This branch keeps unauthenticated traffic out
	// of the React server-render path and gives bots a quick bounce.
	//
	// Better Auth prefixes the cookie with `__Secure-` when baseURL is
	// https (production). Check both names so the guard is active
	// in production too. 302 is intentional: this is a presence redirect
	// for browser GET navigation; a 307 would preserve POST method on
	// any future server-action POSTs under /admin and break them.
	if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
		const sessionCookie =
			request.cookies.get('better-auth.session_token') ??
			request.cookies.get('__Secure-better-auth.session_token')
		if (!sessionCookie) {
			const signInUrl = new URL('/auth/sign-in', request.url)
			return NextResponse.redirect(signInUrl, { status: 302 })
		}
	}

	if (url.pathname.startsWith('/api/')) {
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
