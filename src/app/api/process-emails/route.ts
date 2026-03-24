/**
 * Process Emails API Route
 * Called by Vercel Cron to process the scheduled email queue.
 * Authenticated via Bearer token (CRON_SECRET).
 */

import { type NextRequest, NextResponse } from 'next/server'
import { env } from '@/env'
import { logger } from '@/lib/logger'
import { processEmailsEndpoint } from '@/lib/scheduled-emails'

export async function POST(request: NextRequest) {
	if (!env.CRON_SECRET) {
		return NextResponse.json(
			{ error: 'Cron authentication not configured' },
			{ status: 503 }
		)
	}
	const authHeader = request.headers.get('authorization')
	if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
