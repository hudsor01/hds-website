/**
 * API Route: Testimonial Requests
 * GET  /api/testimonials/requests  — list (admin)
 * POST /api/testimonials/requests  — create (admin)
 *
 * Admin auth via Bearer token. CSRF is not applied — n8n/server-to-server
 * callers can't fetch a CSRF token. The admin secret IS the trust signal.
 */

import type { NextRequest } from 'next/server'
import { withRateLimit } from '@/lib/api/rate-limit-wrapper'
import {
	errorResponse,
	successResponse,
	validationErrorResponse
} from '@/lib/api/responses'
import { validateAdminAuth } from '@/lib/auth/admin'
import { logger } from '@/lib/logger'
import { createTestimonialRequestSchema } from '@/lib/schemas/query-params'
import {
	createTestimonialRequest,
	getTestimonialRequests
} from '@/lib/testimonials'

async function handleTestimonialRequestsGet(request: NextRequest) {
	const authError = validateAdminAuth(request)
	if (authError) {
		return authError
	}
	try {
		const requests = await getTestimonialRequests()
		return successResponse({ requests })
	} catch (error) {
		logger.error('Error fetching testimonial requests', error)
		return errorResponse('Failed to fetch requests', 500)
	}
}

export const GET = withRateLimit(handleTestimonialRequestsGet, 'api')

async function handleTestimonialRequestsPost(request: NextRequest) {
	const authError = validateAdminAuth(request)
	if (authError) {
		return authError
	}

	try {
		const rawBody = await request.json()
		const parseResult = createTestimonialRequestSchema.safeParse(rawBody)
		if (!parseResult.success) {
			return validationErrorResponse(parseResult.error)
		}

		const { clientName, clientEmail, projectName } = parseResult.data
		const newRequest = await createTestimonialRequest(
			clientName,
			clientEmail,
			projectName
		)
		if (!newRequest) {
			throw new Error('Failed to create request')
		}

		logger.info('Testimonial request created', {
			component: 'TestimonialRequestsAPI',
			action: 'create',
			metadata: { requestId: newRequest.id }
		})

		return successResponse({
			token: newRequest.token,
			id: newRequest.id
		})
	} catch (error) {
		logger.error('Error creating testimonial request', error)
		return errorResponse('Failed to create request', 500)
	}
}

export const POST = withRateLimit(
	handleTestimonialRequestsPost,
	'contactFormApi'
)
