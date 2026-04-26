import type { NextRequest } from 'next/server'
import { after } from 'next/server'
import { withRateLimit } from '@/lib/api/rate-limit-wrapper'
import {
	errorResponse,
	successResponse,
	validationErrorResponse
} from '@/lib/api/responses'
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
import { leads } from '@/lib/schemas/leads'

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

		// Step 3b: Save to leads table
		try {
			await db.insert(leads).values({
				email: data.email,
				name: `${data.firstName} ${data.lastName}`.trim(),
				source: 'contact-form',
				status: 'new',
				metadata: {
					service: data.service,
					budget: data.budget,
					timeline: data.timeline,
					message: data.message
				}
			})
		} catch (dbError) {
			// Log but do not fail the request if DB insert fails
			logger.error('Failed to save contact lead to database', dbError)
		}

		// Step 4: Calculate lead score and prepare email data
		const leadScoring = scoreLeadFromContactData(data)
		const leadScore = leadScoring.score
		const sequenceId = leadScoring.sequenceType
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

export const POST = withRateLimit(handleContactPost, 'contactForm')
