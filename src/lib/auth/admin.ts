import { timingSafeEqual } from 'node:crypto'
import { type NextRequest, NextResponse } from 'next/server'
import { env } from '@/env'

/**
 * Validate admin API authentication via Bearer token.
 * Returns a 401 response if unauthorized, null if authorized.
 * Uses timing-safe comparison to prevent side-channel attacks.
 */
export function validateAdminAuth(request: NextRequest): NextResponse | null {
	if (!env.ADMIN_SECRET) {
		return NextResponse.json(
			{ error: 'Admin authentication not configured' },
			{ status: 503 }
		)
	}
	const authHeader = request.headers.get('authorization')
	const token = authHeader?.replace('Bearer ', '')
	const encoder = new TextEncoder()
	const a = encoder.encode(token ?? '')
	const b = encoder.encode(env.ADMIN_SECRET)
	if (a.length !== b.length || !timingSafeEqual(a, b)) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}
	return null
}
