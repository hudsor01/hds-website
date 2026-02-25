/**
 * API Route: Individual Testimonial Request
 * DELETE /api/testimonials/requests/[id] - Delete testimonial request
 */

import type { NextRequest } from 'next/server'
import { withRateLimitParams } from '@/lib/api/rate-limit-wrapper'
import { errorResponse, successResponse } from '@/lib/api/responses'
import { validateAdminAuth } from '@/lib/auth/admin'
import { logger } from '@/lib/logger'
import { deleteTestimonialRequest } from '@/lib/testimonials'

interface RouteParams {
	params: Promise<{ id: string }>
}

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

		const success = await deleteTestimonialRequest(id)

		if (!success) {
			return errorResponse('Failed to delete request', 500)
		}

		logger.info('Testimonial request deleted', {
			component: 'TestimonialRequestAPI',
			action: 'delete',
			requestId: id
		})

		return successResponse({ success: true })
	} catch (error) {
		logger.error('Error deleting testimonial request', {
			error: error instanceof Error ? error.message : String(error),
			component: 'TestimonialRequestAPI',
			action: 'delete'
		})

		return errorResponse('Failed to delete request', 500)
	}
}

export const DELETE = withRateLimitParams(
	handleTestimonialRequestDelete,
	'contactFormApi'
)
