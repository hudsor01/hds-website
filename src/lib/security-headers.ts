// Comprehensive security headers for production deployment
export const SECURITY_HEADERS = {
	// Prevent clickjacking attacks
	'X-Frame-Options': 'DENY',

	// Prevent MIME type sniffing
	'X-Content-Type-Options': 'nosniff',

	// Control referrer information
	'Referrer-Policy': 'strict-origin-when-cross-origin',

	// Enforce HTTPS (HSTS)
	'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

	// Content Security Policy.
	//
	// We DON'T use nonce + strict-dynamic, even though that would be the
	// strictest pattern — it requires the layout (or every JsonLd
	// consumer) to read x-nonce via headers() and forward it to script
	// tags, which forces dynamic rendering for every page. This site
	// relies on cacheComponents-driven static generation, so we accept a
	// slightly weaker policy in exchange for keeping the static shell.
	//
	// The chosen policy: 'self' 'unsafe-inline' for scripts and styles.
	// Inline-script defenses live at the source level — JsonLd escapes
	// `</script>` in DB-sourced fields (see src/components/utilities/JsonLd.tsx)
	// and sanitize-html locks down user-submitted blog HTML. The previous
	// policy had a wildcard `https:` fallback that allowed every TLS
	// origin; THAT is now removed. connect-src covers:
	//   • 'self' — own API routes, plus @vercel/speed-insights, which
	//     beacons to /_vercel/speed-insights/vitals (same-origin proxy
	//     when deployed on Vercel)
	//   • https://*.vercel-insights.com — @vercel/analytics data endpoint
	//   • https://*.vercel-scripts.com — script-tag src for both packages
	'Content-Security-Policy':
		"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https: blob:; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; connect-src 'self' https://*.vercel-insights.com https://*.vercel-scripts.com; worker-src 'self' blob:; child-src 'none'; manifest-src 'self'; report-uri /api/csp-reports;",

	// Cross-origin policies
	'Cross-Origin-Opener-Policy': 'same-origin',
	'Cross-Origin-Embedder-Policy': 'credentialless',
	'Cross-Origin-Resource-Policy': 'cross-origin',

	// Permissions policy (formerly feature policy)
	'Permissions-Policy': [
		'camera=()',
		'microphone=()',
		'geolocation=()',
		'interest-cohort=()',
		'payment=()',
		'usb=()',
		'bluetooth=()',
		'magnetometer=()',
		'accelerometer=()',
		'gyroscope=()',
		'fullscreen=(self)'
	].join(', ')
} as const

// Apply headers to a NextResponse (or any Response). Static — there is
// no per-request nonce to inject; see proxy.ts and the CSP comment
// above for why nonce mode was removed.
export function applySecurityHeaders(response: Response) {
	for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
		response.headers.set(key, value)
	}
	return response
}
