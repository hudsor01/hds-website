import { z } from 'zod'

/**
 * Testimonial submission schemas
 *
 * Used by:
 *  - POST /api/testimonials/requests (admin-issued token creation)
 *  - POST /api/testimonials/submit   (public token-required submission)
 */

// Helper: optional string that treats empty strings as undefined
const optionalString = (maxLength = 100) =>
	z.preprocess(
		val => (typeof val === 'string' && val.trim() === '' ? undefined : val),
		z.string().max(maxLength).optional()
	)

// Helper: optional URL that treats empty strings as undefined
const optionalUrl = () =>
	z.preprocess(
		val => (typeof val === 'string' && val.trim() === '' ? undefined : val),
		z.string().url().optional()
	)

const emptyToUndefined = (val: unknown) =>
	typeof val === 'string' && val.trim() === '' ? undefined : val

export const createTestimonialRequestSchema = z.object({
	clientName: z
		.string()
		.min(1, 'Client name is required')
		.max(200, 'Client name too long')
		.trim(),
	clientEmail: z.preprocess(
		emptyToUndefined,
		z.string().email('Invalid email address').max(254).optional()
	),
	projectName: z.preprocess(
		emptyToUndefined,
		z.string().max(200, 'Project name too long').optional()
	)
})

export const testimonialSubmitSchema = z.object({
	// Token is required: every public submission must originate from a
	// signed request link issued by the admin. The token proves the
	// submitter received an invite — without it, anyone could POST a
	// testimonial directly into the moderation queue.
	// .trim() + min(1) rejects whitespace-only tokens that would
	// otherwise silently fail the request lookup.
	token: z.string().trim().min(1, 'Submission token is required'),
	client_name: z
		.string()
		.min(2, 'Name must be at least 2 characters')
		.max(100, 'Name must be less than 100 characters')
		.trim(),
	company: optionalString(100),
	role: optionalString(100),
	rating: z.coerce
		.number()
		.int()
		.min(1, 'Rating must be at least 1')
		.max(5, 'Rating must be at most 5'),
	content: z
		.string()
		.min(20, 'Testimonial must be at least 20 characters')
		.max(2000, 'Testimonial must be less than 2000 characters')
		.trim(),
	photo_url: optionalUrl(),
	video_url: optionalUrl(),
	service_type: optionalString(100)
})
