/**
 * API Route: Submit Testimonial
 * POST /api/testimonials/submit
 */

import type { NextRequest } from 'next/server'
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
					html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #0891b2;">New Testimonial Received</h1>
              <div style="background: white; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
                <p><strong>Name:</strong> ${body.client_name}</p>
                ${body.company ? `<p><strong>Company:</strong> ${body.company}</p>` : ''}
                ${body.role ? `<p><strong>Role:</strong> ${body.role}</p>` : ''}
                <p><strong>Rating:</strong> ${body.rating}/5</p>
                ${body.service_type ? `<p><strong>Service:</strong> ${body.service_type}</p>` : ''}
                <p><strong>Submitted via:</strong> ${body.token ? 'Private link' : 'Public form'}</p>
                <p><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>
              </div>
              <div style="background: #f1f5f9; padding: 20px; border-radius: 8px;">
                <h2 style="margin-top: 0;">Testimonial Content</h2>
                <p style="white-space: pre-wrap;">${body.content}</p>
              </div>
              <p style="margin-top: 20px; color: #64748b; font-size: 12px;">
                This testimonial is pending review. Log in to approve or reject it.
              </p>
            </div>
          `
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
