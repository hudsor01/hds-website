/**
 * CSRF Token Issuance
 *
 * GET /api/csrf -> { token: string }
 *
 * Forms call this once before submitting and include the returned token in
 * the `X-CSRF-Token` header on the actual mutation request. Tokens are
 * HMAC-signed with CSRF_SECRET and expire after 1 hour.
 *
 * Same-origin enforcement on the mutating endpoint guarantees a malicious
 * page can't read the token (CORS blocks the JSON response from a
 * cross-origin fetch); the token check is defense-in-depth on top of that.
 */

import { NextResponse } from 'next/server'
import { generateCsrfToken } from '@/lib/csrf'

export async function GET() {
	const token = await generateCsrfToken()
	return NextResponse.json(
		{ token },
		{
			headers: {
				// Tokens are per-issue; do not cache
				'Cache-Control': 'no-store, no-cache, must-revalidate'
			}
		}
	)
}
