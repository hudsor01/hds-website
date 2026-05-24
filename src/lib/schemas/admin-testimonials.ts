/**
 * Admin-only Zod schemas for the testimonials CRUD vertical slice.
 *
 * Separate from the public `testimonialSubmitSchema` in
 * `src/lib/schemas/query-params.ts` because the admin form lets the
 * operator pick `featured` + `published` explicitly and omits the
 * request token entirely. The DB defaults `published: true`, but the
 * admin create form intentionally defaults to `false` so a freshly
 * created row is unpublished by default and the operator can review
 * before flipping it on.
 *
 * Optional URL fields coerce empty strings (what a blank form input
 * submits) to `null` so the Drizzle insert sees a real null instead
 * of an empty string masquerading as a URL.
 */
import { z } from 'zod'

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
	featured: z.coerce.boolean().default(false),
	published: z.coerce.boolean().default(false)
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
