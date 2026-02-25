/**
 * API Route: Testimonials
 * GET /api/testimonials - List testimonials
 *
 * Query params:
 *   - all=true: Return all testimonials including unapproved
 */

import type { NextRequest } from 'next/server'
import { withRateLimit } from '@/lib/api/rate-limit-wrapper'
import { errorResponse, successResponse } from '@/lib/api/responses'
import { validateAdminAuth } from '@/lib/auth/admin'
import { logger } from '@/lib/logger'
import { getAllTestimonials, getApprovedTestimonials } from '@/lib/testimonials'

async function handleGetTestimonials(request: NextRequest) {
	try {
		const url = new URL(request.url)
		const requestAll = url.searchParams.get('all') === 'true'

		if (requestAll) {
			const authError = validateAdminAuth(request)
			if (authError) {
				return authError
			}

			logger.info('Fetching all testimonials', {
				component: 'TestimonialsAPI',
				action: 'list-all'
			})

			const testimonials = await getAllTestimonials()
			return successResponse({ testimonials })
		}

		logger.info('Public testimonials API accessed', {
			component: 'TestimonialsAPI',
			action: 'list-approved'
		})

		const testimonials = await getApprovedTestimonials()
		return successResponse({ testimonials })
	} catch (error) {
		logger.error('Error fetching testimonials', {
			error: error instanceof Error ? error.message : String(error),
			component: 'TestimonialsAPI',
			action: 'list'
		})

		return errorResponse('Failed to fetch testimonials', 500)
	}
}

export const GET = withRateLimit(handleGetTestimonials, 'readOnlyApi')
