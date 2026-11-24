/**
 * Admin-only Zod schemas for the testimonials CRUD vertical slice.
 *
 * Separate from the public `testimonialSubmitSchema` in
 * `src/lib/schemas/query-params.ts` because the admin form lets the
 * operator pick `featured` + `published` explicitly and omits the
 * request token entirely. Both the DB column and the admin create form
 * default `published` to `false`, so a freshly created row stays
 * unpublished until the operator reviews it and flips it on.
 *
 * Optional URL fields coerce empty strings (what a blank form input
 * submits) to `null` so the Drizzle insert sees a real null instead
 * of an empty string masquerading as a URL.
 */
import { z } from 'zod'
import { formBoolean } from '@/lib/admin/form-boolean'

const optionalText = z
	.string()
	.max(500)
	.transform(v => (v.trim() === '' ? null : v))
	.nullable()
	.optional()

const optionalUrl = z
	.string()
	.max(2000)
	.refine(v => v === '' || /^https?:\/\//.test(v), 'Must be a URL or empty')
	.transform(v => (v === '' ? null : v))
	.nullable()
	.optional()

export const createAdminTestimonialSchema = z.object({
	name: z.string().min(1).max(200),
	content: z.string().min(1).max(2000),
	role: optionalText,
	company: optionalText,
	rating: z.coerce.number().int().min(1).max(5).nullable().optional(),
	imageUrl: optionalUrl,
	videoUrl: optionalUrl,
	featured: formBoolean.default(false),
	published: formBoolean.default(false)
})

export const updateAdminTestimonialSchema = createAdminTestimonialSchema.extend(
	{
		id: z.string().uuid()
	}
)

export type CreateAdminTestimonialInput = z.infer<
	typeof createAdminTestimonialSchema
>
export type UpdateAdminTestimonialInput = z.infer<
	typeof updateAdminTestimonialSchema
>

/**
 * Admin "new review link" form. Every field arrives as a string (an empty
 * input submits ''), so the input type matches the TanStack Form values.
 * The JSON API for automation keeps `createTestimonialRequestSchema`.
 */
export const createTestimonialRequestFormSchema = z.object({
	clientName: z
		.string()
		.trim()
		.min(1, 'Client name is required')
		.max(200, 'Client name too long'),
	clientEmail: z.union([
		z.literal(''),
		z.email('Invalid email address').max(254)
	]),
	projectName: z.string().trim().max(200, 'Project name too long')
})
