import { timingSafeEqual } from 'node:crypto'
import { type NextRequest, NextResponse } from 'next/server'
import { env } from '@/env'

function validateBearerToken(
	request: NextRequest,
	secret: string
): NextResponse | null {
	const authHeader = request.headers.get('authorization')
	const token = authHeader?.replace('Bearer ', '')
	const encoder = new TextEncoder()
	const a = encoder.encode(token ?? '')
	const b = encoder.encode(secret)
	if (a.length !== b.length || !timingSafeEqual(a, b)) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}
	return null
}

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
	return validateBearerToken(request, env.ADMIN_SECRET)
}

/**
 * Validate cron job authentication via Bearer token (CRON_SECRET).
 * Returns a 401 response if unauthorized, null if authorized.
 * Uses timing-safe comparison to prevent side-channel attacks.
 */
export function validateCronAuth(request: NextRequest): NextResponse | null {
	if (!env.CRON_SECRET) {
		return NextResponse.json(
			{ error: 'Cron authentication not configured' },
			{ status: 503 }
		)
	}
	return validateBearerToken(request, env.CRON_SECRET)
}
