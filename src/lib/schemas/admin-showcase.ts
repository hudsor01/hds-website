/**
 * Admin Showcase Validation Schemas
 *
 * Pure Zod file (no DB imports) consumed by:
 *  - The admin Server Actions in `src/app/admin/showcase/actions.ts`
 *    (safeParse on FormData -> object).
 *  - The TanStack Form bindings in the create and edit forms.
 *
 * Mirrors the 30-column `showcase` table in `src/lib/schemas/showcase.ts`.
 * The four required columns (slug, title, description, showcaseType) are
 * enforced as `min(1)`; every other column is nullable / optional and an
 * empty string from an unfilled form field coerces to `null` so the DB
 * sees a real NULL rather than the literal "".
 *
 * Slug regex matches the existing public schema in `src/lib/schemas/blog-api.ts`
 * so admin-created rows are always reachable from the public read helpers.
 */
import { z } from 'zod'

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Optional text column: empty string trims to null, otherwise the raw string. */
const optionalText = z
	.string()
	.max(2000)
	.transform(v => (v.trim() === '' ? null : v))
	.nullable()
	.optional()

/** Optional URL column: empty string -> null, otherwise must be http(s). */
const optionalUrl = z
	.string()
	.max(2000)
	.refine(v => v === '' || /^https?:\/\//.test(v), 'Must be a URL or empty')
	.transform(v => (v === '' ? null : v))
	.nullable()
	.optional()

export const createShowcaseSchema = z.object({
	// Required
	slug: z
		.string()
		.min(1)
		.max(200)
		.regex(slugRegex, 'Slug must be lowercase alphanumeric with hyphens'),
	title: z.string().min(1).max(200),
	description: z.string().min(1).max(1000),
	showcaseType: z.enum(['quick', 'detailed']).default('quick'),

	// Long-form / client metadata
	longDescription: optionalText,
	clientName: optionalText,
	industry: optionalText,
	projectType: optionalText,
	category: optionalText,
	challenge: optionalText,
	solution: optionalText,
	results: optionalText,

	// Imagery
	imageUrl: optionalUrl,
	ogImageUrl: optionalUrl,
	gradientClass: optionalText,

	// External links
	externalLink: optionalUrl,
	githubLink: optionalUrl,

	// Testimonial fields
	testimonialText: optionalText,
	testimonialAuthor: optionalText,
	testimonialRole: optionalText,
	testimonialVideoUrl: optionalUrl,

	// Project metadata
	projectDuration: optionalText,
	teamSize: z.coerce.number().int().min(1).max(1000).nullable().optional(),

	// JSONB columns
	technologies: z.array(z.string().min(1)).default([]),
	metrics: z.record(z.string(), z.string()).default({}),
	galleryImages: z.array(z.string().url()).default([]),

	// Booleans / ordering
	featured: z.coerce.boolean().default(false),
	published: z.coerce.boolean().default(false),
	displayOrder: z.coerce.number().int().min(0).default(0)
})

export const updateShowcaseSchema = createShowcaseSchema.extend({
	id: z.string().uuid()
})

export type CreateShowcaseInput = z.infer<typeof createShowcaseSchema>
export type UpdateShowcaseInput = z.infer<typeof updateShowcaseSchema>
