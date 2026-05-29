/**
 * Newsletter Unsubscribe API Route
 *
 * Marks a subscriber as unsubscribed in the database. Requires an HMAC
 * token tied to the email so that only someone who received the original
 * unsubscribe link (or knows the secret) can unsubscribe a given address.
 */

import { eq } from 'drizzle-orm'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { withMutationGuards } from '@/lib/api/guards'
import { errorResponse, successResponse } from '@/lib/api/responses'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { emailSchema } from '@/lib/schemas/common'
import { newsletterSubscribers } from '@/lib/schemas/emails'
import { verifyUnsubscribeToken } from '@/lib/unsubscribe-token'

// emailSchema applies .toLowerCase().trim() — the SAME normalisation
// generateUnsubscribeToken uses when computing the HMAC. Without this,
// a mixed-case email in the URL would verify against the token (the
// HMAC helper normalises) but miss the DB row (stored lowercased at
// subscribe time, looked up via raw `eq()` here).
const unsubscribeSchema = z.object({
	email: emailSchema,
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
			return errorResponse('Email and unsubscribe token are required', 400)
		}

		const { email, token } = parsed.data
		const tokenOk = await verifyUnsubscribeToken(email, token)
		if (!tokenOk) {
			logger.warn('Unsubscribe token mismatch', {
				metadata: { email: hashedEmail(email) }
			})
			return errorResponse('Invalid unsubscribe link', 403)
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
		return successResponse()
	} catch (error) {
		logger.error('Newsletter unsubscribe failed', error)
		return errorResponse('Unsubscribe failed', 500)
	}
}

export const POST = withMutationGuards(handleUnsubscribe, {
	rateLimit: 'newsletter'
})
