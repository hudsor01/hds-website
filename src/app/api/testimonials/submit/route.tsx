/**
 * API Route: Submit Testimonial
 * POST /api/testimonials/submit
 *
 * Always token-gated — every public submission must come from an admin-
 * issued testimonial-request link. The token proves the submitter received
 * an invite (no anonymous public submissions). withMutationGuards adds
 * same-origin + CSRF + rate-limit on top.
 */

import { revalidateTag } from 'next/cache'
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
	getTestimonialRequestByToken,
	markRequestSubmitted,
	submitTestimonial
} from '@/lib/testimonials'

async function handleTestimonialSubmit(request: NextRequest) {
	try {
		const rawBody = await request.json()
		const parseResult = testimonialSubmitSchema.safeParse(rawBody)
		if (!parseResult.success) {
			return validationErrorResponse(parseResult.error)
		}

		const body = parseResult.data

		// Token is required by the schema; verify it backs a real, unused,
		// unexpired request before doing anything else.
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

		const testimonial = await submitTestimonial({
			request_id: testimonialRequest.id,
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

		// Hard-purge cache so subsequent requests see `submitted: true`.
		const marked = await markRequestSubmitted(body.token)
		if (!marked) {
			logger.error(
				'Failed to mark testimonial request as submitted; cache not invalidated',
				{ metadata: { testimonialId: testimonial.id } }
			)
			return errorResponse('Failed to finalize submission', 500)
		}
		revalidateTag(`testimonial-token:${body.token}`, 'max')

		logger.info('Testimonial submitted', {
			component: 'TestimonialAPI',
			action: 'submit',
			metadata: {
				testimonialId: testimonial.id,
				rating: body.rating
			}
		})

		if (isResendConfigured()) {
			after(async () => {
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
								isPrivateLink={true}
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
