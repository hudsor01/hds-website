/**
 * Process Emails API Route
 * Called by Vercel Cron to process the scheduled email queue.
 * Authenticated via Bearer token (CRON_SECRET).
 */

import { type NextRequest, NextResponse } from 'next/server'
import { validateCronAuth } from '@/lib/auth/admin'
import { logger } from '@/lib/logger'
import { processEmailsEndpoint } from '@/lib/scheduled-emails'

export async function POST(request: NextRequest) {
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
