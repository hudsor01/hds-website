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
	// script-src uses `'nonce-{n}' 'strict-dynamic'` so scripts loaded by
	// an already-trusted (nonce'd) script are also trusted — this is what
	// lets Vercel Analytics + Speed Insights load without blanket-trusting
	// every https: origin. We also keep `'unsafe-inline'` as a compatibility
	// flag: modern browsers ignore it once a nonce is present (per spec),
	// but it lets older browsers and inert <script type="application/ld+json">
	// blocks render — the latter is server-rendered structured data that
	// is never executed and would otherwise force every JSON-LD page to be
	// dynamic just to inject a per-request nonce.
	//
	// The previous policy used a wildcard `https:` fallback that effectively
	// allowed every TLS origin and defeated the nonce; that is now removed.
	'Content-Security-Policy':
		"default-src 'self'; script-src 'self' 'nonce-{nonce}' 'strict-dynamic' 'unsafe-inline'; style-src 'self' 'nonce-{nonce}' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https: blob:; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; connect-src 'self' https://*.vercel-insights.com https://*.vercel-scripts.com wss:; worker-src 'self' blob:; child-src 'none'; manifest-src 'self'; report-uri /api/csp-reports;",

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

// Apply headers to NextResponse with nonce support
export function applySecurityHeaders(response: Response, nonce?: string) {
	Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
		// Replace nonce placeholder if CSP header and nonce provided
		if (key === 'Content-Security-Policy' && nonce) {
			value = value.replace(/{nonce}/g, nonce)
		}
		response.headers.set(key, value)
	})

	return response
}
