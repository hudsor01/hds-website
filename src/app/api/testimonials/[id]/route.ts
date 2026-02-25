/**
 * API Route: Individual Testimonial
 * PATCH /api/testimonials/[id] - Update testimonial (approve/feature)
 * DELETE /api/testimonials/[id] - Delete testimonial
 */

import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { withRateLimitParams } from '@/lib/api/rate-limit-wrapper'
import { errorResponse, successResponse } from '@/lib/api/responses'
import { validateAdminAuth } from '@/lib/auth/admin'
import { logger } from '@/lib/logger'
import { deleteTestimonial, updateTestimonialStatus } from '@/lib/testimonials'

interface RouteParams {
	params: Promise<{ id: string }>
}

const updateSchema = z.object({
	approved: z.boolean().optional(),
	featured: z.boolean().optional()
})

async function handlePatchTestimonial(
	request: NextRequest,
	{ params }: RouteParams
) {
	try {
		const authError = validateAdminAuth(request)
		if (authError) {
			return authError
		}

		const { id } = await params
		const rawBody = await request.json()
		const parsed = updateSchema.safeParse(rawBody)
		if (!parsed.success) {
			return errorResponse('Invalid input', 400)
		}

		const body = parsed.data

		const success = await updateTestimonialStatus(id, {
			approved: body.approved,
			featured: body.featured
		})

		if (!success) {
			return errorResponse('Failed to update testimonial', 500)
		}

		logger.info('Testimonial updated', {
			component: 'TestimonialAPI',
			action: 'update',
			testimonialId: id,
			updates: body
		})

		return successResponse({ success: true })
	} catch (error) {
		logger.error('Error updating testimonial', {
			error: error instanceof Error ? error.message : String(error),
			component: 'TestimonialAPI',
			action: 'update'
		})

		return errorResponse('Failed to update testimonial', 500)
	}
}

async function handleDeleteTestimonial(
	request: NextRequest,
	{ params }: RouteParams
) {
	try {
		const authError = validateAdminAuth(request)
		if (authError) {
			return authError
		}

		const { id } = await params

		const success = await deleteTestimonial(id)

		if (!success) {
			return errorResponse('Failed to delete testimonial', 500)
		}

		logger.info('Testimonial deleted', {
			component: 'TestimonialAPI',
			action: 'delete',
			testimonialId: id
		})

		return successResponse({ success: true })
	} catch (error) {
		logger.error('Error deleting testimonial', {
			error: error instanceof Error ? error.message : String(error),
			component: 'TestimonialAPI',
			action: 'delete'
		})

		return errorResponse('Failed to delete testimonial', 500)
	}
}

export const PATCH = withRateLimitParams(
	handlePatchTestimonial,
	'contactFormApi'
)
export const DELETE = withRateLimitParams(
	handleDeleteTestimonial,
	'contactFormApi'
)
