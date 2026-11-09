// Comprehensive security headers for production deployment

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
// origin; THAT is now removed.
//
// 'wasm-unsafe-eval' allows WebAssembly compilation only (not eval or
// Function). @react-pdf/renderer lays out pages with yoga-layout, which
// ships solely as wasm, so the invoice/contract/proposal PDF downloads
// need it. yoga also fetch()es its embedded data: URI wasm binary, hence
// data: in connect-src (a data: URI cannot carry anything off the page).
//
// connect-src covers:
//   • data: — yoga-layout's embedded wasm binary (see above)
//   • 'self' — own API routes, the Sentry tunnel (/monitoring), plus
//     @vercel/speed-insights, which beacons to /_vercel/speed-insights/vitals
//     (same-origin proxy when deployed on Vercel)
//   • https://*.vercel-insights.com — @vercel/analytics data endpoint
//   • https://*.vercel-scripts.com — script-tag src for both packages
//   • https://vercel.com — @vercel/blob/client upload() PUTs admin
//     images straight to https://vercel.com/api/blob
// frame-src allows only the showcase video-testimonial embeds, and the
// Permissions-Policy fullscreen allowlist delegates to the same origins
// so the embedded players can go fullscreen.
//
// Development only: React needs 'unsafe-eval' for its debugging stack
// reconstruction, and @vercel/analytics loads its debug script from
// va.vercel-scripts.com (production uses same-origin /_vercel/*).
const VIDEO_EMBED_ORIGINS = [
	'https://www.youtube.com',
	'https://youtube.com',
	'https://www.youtube-nocookie.com',
	'https://www.loom.com',
	'https://loom.com'
] as const

function buildContentSecurityPolicy(isDev: boolean): string {
	const scriptSrc = isDev
		? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com"
		: "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'"

	return [
		"default-src 'self'",
		scriptSrc,
		"style-src 'self' 'unsafe-inline'",
		"font-src 'self' data:",
		"img-src 'self' data: https: blob:",
		"media-src 'self'",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		"frame-ancestors 'none'",
		`frame-src ${VIDEO_EMBED_ORIGINS.join(' ')}`,
		"connect-src 'self' data: https://*.vercel-insights.com https://*.vercel-scripts.com https://vercel.com",
		"worker-src 'self' blob:",
		"manifest-src 'self'",
		'report-uri /api/csp-reports'
	].join('; ')
}

const STATIC_SECURITY_HEADERS = {
	// Prevent clickjacking attacks
	'X-Frame-Options': 'DENY',

	// Prevent MIME type sniffing
	'X-Content-Type-Options': 'nosniff',

	// Control referrer information
	'Referrer-Policy': 'strict-origin-when-cross-origin',

	// Enforce HTTPS (HSTS). Matches Vercel's platform default. No
	// includeSubDomains / preload: that would lock every subdomain to HTTPS
	// for the full max-age, including any that are not served over TLS.
	'Strict-Transport-Security': 'max-age=63072000',

	// Cross-origin policies. No Cross-Origin-Embedder-Policy: nothing here
	// needs cross-origin isolation, and COEP blocks the YouTube/Loom
	// testimonial iframes, which do not send CORP headers.
	'Cross-Origin-Opener-Policy': 'same-origin',
	'Cross-Origin-Resource-Policy': 'cross-origin',

	// Permissions policy (formerly feature policy)
	'Permissions-Policy': [
		'camera=()',
		'microphone=()',
		'geolocation=()',
		'payment=()',
		'usb=()',
		'bluetooth=()',
		'magnetometer=()',
		'accelerometer=()',
		'gyroscope=()',
		`fullscreen=(self ${VIDEO_EMBED_ORIGINS.map(origin => `"${origin}"`).join(' ')})`
	].join(', ')
} as const

const PRODUCTION_CSP = buildContentSecurityPolicy(false)
const DEVELOPMENT_CSP = buildContentSecurityPolicy(true)

// Apply headers to a NextResponse (or any Response). Static — there is
// no per-request nonce to inject; see src/proxy.ts and the CSP comment
// above for why nonce mode was removed.
export function applySecurityHeaders(
	response: Response,
	{ isDev }: { isDev: boolean }
) {
	for (const [key, value] of Object.entries(STATIC_SECURITY_HEADERS)) {
		response.headers.set(key, value)
	}
	response.headers.set(
		'Content-Security-Policy',
		isDev ? DEVELOPMENT_CSP : PRODUCTION_CSP
	)
	return response
}
