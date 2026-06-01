import type { NextRequest } from 'next/server'
import { after } from 'next/server'
import { sendAdConversion } from '@/lib/ad-conversions'
import { withMutationGuards } from '@/lib/api/guards'
import {
	errorResponse,
	successResponse,
	validationErrorResponse
} from '@/lib/api/responses'
import { deriveChannel } from '@/lib/attribution'
import {
	checkForSecurityThreats,
	prepareEmailVariables,
	scheduleFollowUpEmails,
	sendAdminNotification,
	sendLeadNotifications,
	sendWelcomeEmail
} from '@/lib/contact-service'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { getClientIp } from '@/lib/request'
import { isResendConfigured } from '@/lib/resend-client'
import {
	contactFormSchema,
	scoreLeadFromContactData
} from '@/lib/schemas/contact'
import { leadAttribution, leads } from '@/lib/schemas/leads'

async function handleContactPost(request: NextRequest) {
	const logContext = { component: 'contact-form', timestamp: Date.now() }
	const clientIP = getClientIp(request)

	try {
		logger.info(
			`Contact form submission started - contact-form-${Date.now()}`,
			logContext
		)

		// Step 1: Parse and validate form data
		const rawData = await request.json()
		const validation = contactFormSchema.safeParse(rawData)

		if (!validation.success) {
			return validationErrorResponse(validation.error)
		}

		const data = validation.data

		// Step 3: Security check (monitoring only)
		checkForSecurityThreats(data, clientIP, logger)

		// Lead score is computed up front: it drives both the persisted row
		// and the follow-up email sequence below.
		const leadScoring = scoreLeadFromContactData(data)
		const leadScore = leadScoring.score
		const sequenceId = leadScoring.sequenceType

		// Step 3b: Save to leads table.
		let leadId: string | undefined
		try {
			const [inserted] = await db
				.insert(leads)
				.values({
					email: data.email,
					name: `${data.firstName} ${data.lastName}`.trim(),
					phone: data.phone ?? null,
					company: data.company ?? null,
					source: 'contact-form',
					status: 'new',
					score: leadScore,
					metadata: {
						service: data.service,
						budget: data.budget,
						timeline: data.timeline,
						message: data.message,
						// Full attribution (incl. gclid/fbclid) for offline
						// conversion export back to the ad platform.
						attribution: data.attribution ?? null
					}
				})
				.returning({ id: leads.id })
			leadId = inserted?.id
		} catch (dbError) {
			// Log but do not fail the request if DB insert fails
			logger.error('Failed to save contact lead to database', dbError)
		}

		// Step 3c: Record the normalized marketing touchpoint for the admin
		// Touchpoints view + reporting. Its own try/catch: neon-http commits
		// each insert independently, so a touchpoint-write failure must not be
		// logged as "lead not saved" - the lead row above already exists, and
		// the full attribution is also stored on leads.metadata.
		if (leadId && data.attribution) {
			const attr = data.attribution
			try {
				await db.insert(leadAttribution).values({
					leadId,
					touchpoint: 'conversion',
					channel: deriveChannel(attr),
					source: attr.utmSource ?? null,
					medium: attr.utmMedium ?? null,
					campaign: attr.utmCampaign ?? null,
					content: attr.utmContent ?? null,
					term: attr.utmTerm ?? null,
					referrer: attr.referrer ?? null,
					landingPage: attr.landingPage ?? null,
					touchpointOrder: 1,
					isFirstTouch: true,
					isLastTouch: true,
					attributionWeight: '1'
				})
			} catch (dbError) {
				logger.error(
					'Failed to write lead_attribution row; lead was saved',
					dbError,
					{ metadata: { leadId } }
				)
			}
		}

		// Step 3d: Report the lead to Google Ads after the response is sent.
		// Self-guarding: a no-op unless GOOGLE_ADS_* creds are set and the lead
		// carries a Google click ID, so it is safe to register unconditionally
		// (independent of the email branch below) and never throws.
		after(() =>
			sendAdConversion({
				leadId,
				email: data.email,
				phone: data.phone,
				attribution: data.attribution
			})
		)

		// Step 4: Prepare email data (lead score computed above).
		const emailVariables = prepareEmailVariables(data)

		// Step 5: Defer all email sends + lead notifications + follow-up
		// scheduling — these are fire-and-forget. The user-facing response
		// returns immediately; failures are logged but don't gate the response.
		if (isResendConfigured()) {
			after(async () => {
				try {
					await sendAdminNotification(data, leadScore, sequenceId, logger)
					await sendWelcomeEmail(data, sequenceId, emailVariables, logger)
					await sendLeadNotifications(data, leadScore, logger)
					await scheduleFollowUpEmails(data, sequenceId, emailVariables, logger)

					logger.info('Contact form post-response side effects complete', {
						...logContext,
						email: data.email,
						leadScore,
						sequenceId
					})
				} catch (emailError) {
					logger.error(
						'Failed to send email or schedule follow-ups',
						emailError
					)
				}
			})

			return successResponse(
				undefined,
				'Thank you! Your message has been sent successfully.'
			)
		} else {
			// Test mode: schedule emails without email service
			await scheduleFollowUpEmails(data, sequenceId, emailVariables, logger)

			logger.info('Contact form submission successful (test mode)', {
				...logContext,
				email: data.email,
				leadScore,
				sequenceId
			})

			return successResponse(
				undefined,
				'Form submitted successfully (test mode - email service not configured)'
			)
		}
	} catch (error) {
		logger.error('Contact form error', error)
		return errorResponse(
			'An unexpected error occurred. Please try again later.',
			500
		)
	}
}

export const POST = withMutationGuards(handleContactPost, {
	rateLimit: 'contactForm'
})
