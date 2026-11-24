/**
 * API Route: Individual Testimonial Request
 * DELETE /api/testimonials/requests/[id] - Delete testimonial request
 *
 * Bearer auth for automation. Response: { success: true, data: { id } }.
 */

import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { withRateLimitParams } from '@/lib/api/rate-limit-wrapper'
import { errorResponse, successResponse } from '@/lib/api/responses'
import { validateAdminAuth } from '@/lib/auth/admin'
import { logger } from '@/lib/logger'
import {
	deleteTestimonialRequest,
	purgeTestimonialCaches
} from '@/lib/testimonials'

interface RouteParams {
	params: Promise<{ id: string }>
}

const idSchema = z.string().uuid()

async function handleTestimonialRequestDelete(
	request: NextRequest,
	{ params }: RouteParams
) {
	try {
		const authError = validateAdminAuth(request)
		if (authError) {
			return authError
		}

		const { id } = await params
		if (!idSchema.safeParse(id).success) {
			return errorResponse('Invalid request id', 400)
		}

		const deletedToken = await deleteTestimonialRequest(id)

		if (!deletedToken) {
			return errorResponse('Request not found', 404)
		}
		// The token page must stop offering the form for a revoked link.
		purgeTestimonialCaches(deletedToken)

		logger.info('Testimonial request deleted', {
			component: 'TestimonialRequestAPI',
			action: 'delete',
			requestId: id
		})

		return successResponse({ id })
	} catch (error) {
		logger.error('Error deleting testimonial request', error)

		return errorResponse('Failed to delete request', 500)
	}
}

export const DELETE = withRateLimitParams(
	handleTestimonialRequestDelete,
	'contactFormApi'
)
