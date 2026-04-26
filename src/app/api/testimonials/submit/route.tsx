/**
 * API Route: Submit Testimonial
 * POST /api/testimonials/submit
 */

import type { NextRequest } from 'next/server'
import { TestimonialAdminNotification } from '@/emails/testimonial-admin-notification'
import { withRateLimit } from '@/lib/api/rate-limit-wrapper'
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
	getTestimonialRequestByToken,
	markRequestSubmitted,
	submitTestimonial
} from '@/lib/testimonials'

async function handleTestimonialSubmit(request: NextRequest) {
	try {
		const rawBody = await request.json()

		// Validate request body with Zod
		const parseResult = testimonialSubmitSchema.safeParse(rawBody)
		if (!parseResult.success) {
			return validationErrorResponse(parseResult.error)
		}

		const body = parseResult.data
		let requestId = body.request_id

		// If token provided, validate it and mark as submitted
		if (body.token) {
			const testimonialRequest = await getTestimonialRequestByToken(body.token)

			if (!testimonialRequest) {
				return errorResponse('Invalid testimonial link', 400)
			}

			if (testimonialRequest.submitted) {
				return errorResponse('This link has already been used', 400)
			}

			if (new Date(testimonialRequest.expires_at) < new Date()) {
				return errorResponse('This link has expired', 400)
			}

			// Set request_id from the validated request
			requestId = testimonialRequest.id
		}

		// Submit the testimonial
		const testimonial = await submitTestimonial({
			request_id: requestId,
			client_name: body.client_name,
			company: body.company,
			role: body.role,
			rating: body.rating,
			content: body.content,
			photo_url: body.photo_url,
			video_url: body.video_url,
			service_type: body.service_type
		})

		if (!testimonial) {
			throw new Error('Failed to save testimonial')
		}

		// Mark the request as submitted if token was used
		if (body.token) {
			await markRequestSubmitted(body.token)
		}

		logger.info('Testimonial submitted', {
			component: 'TestimonialAPI',
			action: 'submit',
			testimonialId: testimonial.id,
			rating: body.rating,
			isPrivateLink: !!body.token
		})

		// Send admin notification and submitter confirmation
		if (isResendConfigured()) {
			try {
				await getResendClient().emails.send({
					from: `Hudson Digital Solutions <noreply@hudsondigitalsolutions.com>`,
					to: BUSINESS_INFO.email,
					subject: `[Notification] New Testimonial Submitted - ${body.client_name}`,
					react: (
						<TestimonialAdminNotification
							clientName={body.client_name}
							company={body.company}
							role={body.role}
							rating={body.rating}
							serviceType={body.service_type}
							content={body.content}
							isPrivateLink={!!body.token}
						/>
					)
				})
			} catch (adminEmailError) {
				logger.error(
					'Failed to send admin notification for testimonial',
					adminEmailError
				)
			}
		}

		return successResponse(undefined, 'Testimonial submitted successfully')
	} catch (error) {
		logger.error('Failed to submit testimonial', {
			component: 'TestimonialAPI',
			action: 'submit',
			error
		})

		return errorResponse('Failed to submit testimonial. Please try again.', 500)
	}
}

export const POST = withRateLimit(handleTestimonialSubmit, 'contactForm')
