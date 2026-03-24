/**
 * Newsletter Unsubscribe API Route
 * Marks a subscriber as unsubscribed in the database.
 */

import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withRateLimit } from '@/lib/api/rate-limit-wrapper'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { newsletterSubscribers } from '@/lib/schemas/emails'

const unsubscribeSchema = z.object({
	email: z.string().email()
})

async function handleUnsubscribe(request: NextRequest) {
	try {
		const body = await request.json()
		const parsed = unsubscribeSchema.safeParse(body)
		if (!parsed.success) {
			return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
		}

		await db
			.update(newsletterSubscribers)
			.set({
				status: 'unsubscribed',
				unsubscribedAt: new Date()
			})
			.where(eq(newsletterSubscribers.email, parsed.data.email))

		logger.info('Newsletter unsubscribe', { email: parsed.data.email })
		return NextResponse.json({ success: true })
	} catch (error) {
		logger.error('Newsletter unsubscribe failed', error)
		return NextResponse.json({ error: 'Unsubscribe failed' }, { status: 500 })
	}
}

export const POST = withRateLimit(handleUnsubscribe, 'newsletter')
