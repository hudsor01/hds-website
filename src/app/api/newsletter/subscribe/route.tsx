/**
 * Newsletter Subscription API
 * Handles email list subscriptions and welcome email
 */

import { eq } from 'drizzle-orm'
import type { NextRequest } from 'next/server'
import { after } from 'next/server'
import { z } from 'zod'
import { NewsletterAdminNotification } from '@/emails/newsletter-admin-notification'
import { NewsletterWelcome } from '@/emails/newsletter-welcome'
import { withMutationGuards } from '@/lib/api/guards'
import {
	errorResponse,
	successResponse,
	validationErrorResponse
} from '@/lib/api/responses'
import { BUSINESS_INFO } from '@/lib/constants/business'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { getResendClient, isResendConfigured } from '@/lib/resend-client'
import { emailSchema } from '@/lib/schemas/common'
import { newsletterSubscribers } from '@/lib/schemas/emails'
import { buildUnsubscribeUrl } from '@/lib/unsubscribe-token'

// emailSchema lower-cases + trims, matching the unsubscribe-side
// normalisation. Subscribers must be stored in canonical form so the
// unsubscribe token's HMAC (computed over lower-case email) matches the
// DB row at click-time.
const SubscribeSchema = z.object({
	email: emailSchema,
	source: z.string().optional()
})

async function handleNewsletterSubscribe(request: NextRequest) {
	try {
		const body = await request.json()
		const validation = SubscribeSchema.safeParse(body)

		if (!validation.success) {
			return validationErrorResponse(validation.error)
		}

		const { email, source } = validation.data

		// Check if already subscribed
		let existing = null
		try {
			const results = await db
				.select()
				.from(newsletterSubscribers)
				.where(eq(newsletterSubscribers.email, email))
			existing = results[0] ?? null
		} catch (queryError) {
			logger.error('Failed to check existing subscriber:', queryError)
			return errorResponse('Unable to process subscription', 500)
		}

		if (existing && existing.status === 'active') {
			return successResponse(undefined, "You're already on our list!")
		}

		// Insert or update subscriber (upsert on email)
		try {
			await db
				.insert(newsletterSubscribers)
				.values({
					email,
					status: 'active',
					source: source || 'website',
					subscribedAt: new Date(),
					unsubscribedAt: null
				})
				.onConflictDoUpdate({
					target: newsletterSubscribers.email,
					set: {
						status: 'active',
						subscribedAt: new Date(),
						unsubscribedAt: null
					}
				})
		} catch (dbError) {
			logger.error('Failed to save subscriber:', dbError)
			return errorResponse('Failed to subscribe', 500)
		}

		// Defer welcome + admin sends — fire-and-forget, consistent with the
		// other v4.1 routes (contact, testimonials/submit, calculators/submit).
		// User gets immediate ack; emails arrive a beat later.
		if (isResendConfigured()) {
			after(async () => {
				const unsubscribeUrl = await buildUnsubscribeUrl(email)
				try {
					await getResendClient().emails.send({
						from: `Hudson Digital Solutions <noreply@hudsondigitalsolutions.com>`,
						to: email,
						subject: 'Welcome to Hudson Digital Solutions Newsletter',
						react: <NewsletterWelcome unsubscribeUrl={unsubscribeUrl} />
					})
				} catch (emailError) {
					logger.error('Failed to send welcome email:', emailError)
				}

				try {
					await getResendClient().emails.send({
						from: `Hudson Digital Solutions <noreply@hudsondigitalsolutions.com>`,
						to: BUSINESS_INFO.email,
						subject: '[Notification] New Newsletter Subscriber',
						react: (
							<NewsletterAdminNotification
								email={email}
								source={source || 'website'}
							/>
						)
					})
				} catch (adminEmailError) {
					logger.error('Failed to send admin notification:', adminEmailError)
				}
			})
		}

		return successResponse(undefined, 'Successfully subscribed!')
	} catch (error) {
		logger.error('Newsletter subscription error:', error)
		return errorResponse('Internal server error', 500)
	}
}

export const POST = withMutationGuards(handleNewsletterSubscribe, {
	rateLimit: 'newsletter'
})
