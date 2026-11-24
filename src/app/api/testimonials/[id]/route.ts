/**
 * API Route: Individual Testimonial
 * PATCH /api/testimonials/[id] - Update testimonial (approve/feature)
 * DELETE /api/testimonials/[id] - Delete testimonial
 *
 * Bearer auth for automation. Both responses are
 * { success: true, data: { id } }. Every change purges the public
 * testimonial cache immediately so an unpublished or deleted review
 * disappears from /testimonials on the next request.
 */

import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { withRateLimitParams } from '@/lib/api/rate-limit-wrapper'
import { errorResponse, successResponse } from '@/lib/api/responses'
import { validateAdminAuth } from '@/lib/auth/admin'
import { logger } from '@/lib/logger'
import {
	deleteTestimonial,
	purgeTestimonialCaches,
	updateTestimonialStatus
} from '@/lib/testimonials'

interface RouteParams {
	params: Promise<{ id: string }>
}

const idSchema = z.string().uuid()

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
		if (!idSchema.safeParse(id).success) {
			return errorResponse('Invalid testimonial id', 400)
		}

		const rawBody: unknown = await request.json()
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
			return errorResponse('Testimonial not found', 404)
		}
		purgeTestimonialCaches()

		logger.info('Testimonial updated', {
			component: 'TestimonialAPI',
			action: 'update',
			testimonialId: id,
			updates: body
		})

		return successResponse({ id })
	} catch (error) {
		logger.error('Error updating testimonial', error)

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
		if (!idSchema.safeParse(id).success) {
			return errorResponse('Invalid testimonial id', 400)
		}

		const success = await deleteTestimonial(id)

		if (!success) {
			return errorResponse('Testimonial not found', 404)
		}
		purgeTestimonialCaches()

		logger.info('Testimonial deleted', {
			component: 'TestimonialAPI',
			action: 'delete',
			testimonialId: id
		})

		return successResponse({ id })
	} catch (error) {
		logger.error('Error deleting testimonial', error)

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
