/**
 * API Route: Submit Testimonial
 * POST /api/testimonials/submit
 *
 * Always token-gated: every public submission must come from an admin-
 * issued testimonial-request link. The token is claimed atomically together
 * with the insert (claimTokenAndSubmitTestimonial), so a link is truly
 * single use even under concurrent submits. withMutationGuards adds
 * same-origin + CSRF + rate-limit on top.
 */

import type { NextRequest } from 'next/server'
import { after } from 'next/server'
import { TestimonialAdminNotification } from '@/emails/testimonial-admin-notification'
import { withMutationGuards } from '@/lib/api/guards'
import {
	errorResponse,
	successResponse,
	validationErrorResponse
} from '@/lib/api/responses'
import { BUSINESS_INFO } from '@/lib/constants/business'
import { logger } from '@/lib/logger'
import { getResendClient, isResendConfigured } from '@/lib/resend-client'
import { testimonialSubmitSchema } from '@/lib/schemas/query-params'
import {
	type ClaimFailure,
	claimTokenAndSubmitTestimonial,
	purgeTestimonialCaches
} from '@/lib/testimonials'
import { sanitizeEmailHeader } from '@/lib/utils'

const CLAIM_FAILURE_MESSAGES: Record<ClaimFailure, string> = {
	invalid: 'Invalid testimonial link',
	used: 'This link has already been used',
	expired: 'This link has expired'
}

async function handleTestimonialSubmit(request: NextRequest) {
	try {
		const rawBody: unknown = await request.json()
		const parseResult = testimonialSubmitSchema.safeParse(rawBody)
		if (!parseResult.success) {
			return validationErrorResponse(parseResult.error)
		}

		const body = parseResult.data

		const claim = await claimTokenAndSubmitTestimonial(body.token, {
			client_name: body.client_name,
			company: body.company,
			role: body.role,
			rating: body.rating,
			content: body.content,
			video_url: body.video_url
		})

		if (!claim.ok) {
			return errorResponse(CLAIM_FAILURE_MESSAGES[claim.reason], 400)
		}

		// The token page now shows "Already submitted". The approved list is
		// unchanged (new rows start unpublished), so only the token is purged.
		purgeTestimonialCaches(body.token)

		logger.info('Testimonial submitted', {
			component: 'TestimonialAPI',
			action: 'submit',
			metadata: {
				testimonialId: claim.testimonialId,
				rating: body.rating
			}
		})

		if (isResendConfigured()) {
			after(async () => {
				try {
					// Sanitize the subject: schema .trim() doesn't strip CRLF,
					// and an attacker-crafted client_name with embedded \r\n
					// could inject additional headers in the Resend API call.
					await getResendClient().emails.send({
						from: `Hudson Digital Solutions <noreply@hudsondigitalsolutions.com>`,
						to: BUSINESS_INFO.email,
						subject: sanitizeEmailHeader(
							`[Notification] New Testimonial Submitted - ${body.client_name}`
						),
						react: (
							<TestimonialAdminNotification
								clientName={body.client_name}
								company={body.company}
								role={body.role}
								rating={body.rating}
								content={body.content}
								videoUrl={body.video_url}
								submittedAt={new Date()}
							/>
						)
					})
				} catch (adminEmailError) {
					logger.error(
						'Failed to send admin notification for testimonial',
						adminEmailError
					)
				}
			})
		}

		return successResponse(undefined, 'Testimonial submitted successfully')
	} catch (error) {
		logger.error('Failed to submit testimonial', error)
		return errorResponse('Failed to submit testimonial. Please try again.', 500)
	}
}

export const POST = withMutationGuards(handleTestimonialSubmit, {
	rateLimit: 'contactForm'
})
