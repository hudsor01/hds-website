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
		z.string().trim().max(maxLength).optional()
	)

// Helper: optional http(s) URL that treats empty strings as undefined.
// Only http and https pass, so a javascript: or data: URL can never be
// stored and later rendered as a link (matches admin-testimonials.ts).
const optionalHttpUrl = () =>
	z.preprocess(
		val => (typeof val === 'string' && val.trim() === '' ? undefined : val),
		z
			.url({
				protocol: /^https?$/,
				error: 'Enter a link that starts with http:// or https://'
			})
			.max(2000)
			.optional()
	)

/** Shared with the submit form so its live counter matches the server. */
export const TESTIMONIAL_MIN_LENGTH = 20
export const TESTIMONIAL_MAX_LENGTH = 2000

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
	// submitter received an invite; without it, anyone could POST a
	// testimonial directly into the moderation queue.
	// .trim() + min(1) rejects whitespace-only tokens that would
	// otherwise silently fail the request lookup.
	token: z.string().trim().min(1, 'Submission token is required'),
	// trim() runs before the length checks (Zod applies them in order), so
	// padding with spaces cannot satisfy a minimum.
	client_name: z
		.string()
		.trim()
		.min(2, 'Name must be at least 2 characters')
		.max(100, 'Name must be less than 100 characters'),
	company: optionalString(100),
	role: optionalString(100),
	rating: z.coerce
		.number({ error: 'Please choose a star rating' })
		.int()
		.min(1, 'Please choose a star rating')
		.max(5, 'Rating must be at most 5'),
	content: z
		.string()
		.trim()
		.min(TESTIMONIAL_MIN_LENGTH, 'Testimonial must be at least 20 characters')
		.max(
			TESTIMONIAL_MAX_LENGTH,
			'Testimonial must be less than 2000 characters'
		),
	video_url: optionalHttpUrl()
})
