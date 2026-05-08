import { type NextRequest, NextResponse } from 'next/server'
import { applySecurityHeaders } from '@/lib/security-headers'

/**
 * Apply security headers (CSP, HSTS, frame-options, etc.) on every request.
 *
 * Note: there used to be CSP nonce generation here, but we deliberately
 * removed it. Wiring nonces requires reading `x-nonce` via `headers()` in
 * every layout/component that emits a script tag — and `headers()` forces
 * dynamic rendering, defeating the cacheComponents-driven static
 * generation across this site. The CSP in security-headers.ts uses
 * 'self' 'unsafe-inline' instead; inline-script defenses live at the
 * source level (JsonLd escapes `</script>` and sanitize-html locks down
 * user-submitted blog HTML).
 */
export function middleware(request: NextRequest) {
	const response = NextResponse.next({ request })
	applySecurityHeaders(response)
	return response
}

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$).*)'
	]
}
