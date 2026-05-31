/**
 * Process Emails API Route
 * Drains the scheduled-email queue (contact-form follow-ups, calculator
 * lead-nurture) via Resend. Authenticated with Bearer CRON_SECRET.
 *
 * Exposes BOTH GET and POST. Vercel native cron always invokes the route
 * with an HTTP GET (the vercel.json `crons` schema has no method field, so
 * a method override would be ignored), so a POST-only route returned 405
 * on every scheduled run and the queue never drained in production. POST is
 * kept for n8n / manual invocation. Vercel injects
 * `Authorization: Bearer ${CRON_SECRET}` on cron GETs when the secret is
 * set, so the same guard covers both verbs.
 */

import { type NextRequest, NextResponse } from 'next/server'
import { validateCronAuth } from '@/lib/auth/admin'
import { logger } from '@/lib/logger'
import { processEmailsEndpoint } from '@/lib/scheduled-emails'

async function handleProcessEmails(request: NextRequest) {
	const authError = validateCronAuth(request)
	if (authError) {
		return authError
	}

	try {
		const result = await processEmailsEndpoint()
		logger.info('Email queue processed', { result })
		return NextResponse.json(result)
	} catch (error) {
		logger.error('Email queue processing failed', error)
		return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
	}
}

export async function GET(request: NextRequest) {
	return handleProcessEmails(request)
}

export async function POST(request: NextRequest) {
	return handleProcessEmails(request)
}
