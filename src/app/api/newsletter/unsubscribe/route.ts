/**
 * Newsletter Unsubscribe API Route
 *
 * Marks a subscriber as unsubscribed in the database. Requires an HMAC
 * token tied to the email so that only someone who received the original
 * unsubscribe link (or knows the secret) can unsubscribe a given address.
 */

import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withMutationGuards } from '@/lib/api/guards'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { newsletterSubscribers } from '@/lib/schemas/emails'
import { verifyUnsubscribeToken } from '@/lib/unsubscribe-token'

const unsubscribeSchema = z.object({
	email: z.string().email(),
	token: z.string().min(1, 'Unsubscribe token is required')
})

/**
 * Hash an email for log lines so we can track unsubscribe activity without
 * persisting the raw address in structured logs (PII redaction).
 */
function hashedEmail(email: string): string {
	const local = email.split('@')[0] ?? ''
	const domain = email.split('@')[1] ?? ''
	const localHint = local.length > 2 ? `${local.slice(0, 2)}***` : '***'
	return `${localHint}@${domain}`
}

async function handleUnsubscribe(request: NextRequest) {
	try {
		const body = await request.json()
		const parsed = unsubscribeSchema.safeParse(body)
		if (!parsed.success) {
			return NextResponse.json(
				{ error: 'Email and unsubscribe token are required' },
				{ status: 400 }
			)
		}

		const { email, token } = parsed.data
		const tokenOk = await verifyUnsubscribeToken(email, token)
		if (!tokenOk) {
			logger.warn('Unsubscribe token mismatch', {
				metadata: { email: hashedEmail(email) }
			})
			return NextResponse.json(
				{ error: 'Invalid unsubscribe link' },
				{ status: 403 }
			)
		}

		await db
			.update(newsletterSubscribers)
			.set({
				status: 'unsubscribed',
				unsubscribedAt: new Date()
			})
			.where(eq(newsletterSubscribers.email, email))

		logger.info('Newsletter unsubscribe', {
			metadata: { email: hashedEmail(email) }
		})
		return NextResponse.json({ success: true })
	} catch (error) {
		logger.error('Newsletter unsubscribe failed', error)
		return NextResponse.json({ error: 'Unsubscribe failed' }, { status: 500 })
	}
}

export const POST = withMutationGuards(handleUnsubscribe, {
	rateLimit: 'newsletter'
})
