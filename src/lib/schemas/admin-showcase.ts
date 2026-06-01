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
import { formBoolean } from '@/lib/admin/form-boolean'

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
	featured: formBoolean.default(false),
	published: formBoolean.default(false),
	displayOrder: z.coerce.number().int().min(0).default(0)
})

export const updateShowcaseSchema = createShowcaseSchema.extend({
	id: z.string().uuid()
})

// Client-side validation schema for the showcase create/edit forms. Unlike
// createShowcaseSchema (which parses coerced FormData with defaults and
// transforms), this mirrors the in-memory ShowcaseFormShape exactly — real
// arrays/records/nulls, no defaults — so its input type satisfies TanStack
// Form's onDynamic validator. It enforces the four required columns; the
// server still validates with createShowcaseSchema as the source of truth.
export const showcaseFormClientSchema = z.object({
	slug: z
		.string()
		.min(1, 'Slug is required')
		.regex(slugRegex, 'Slug must be lowercase alphanumeric with hyphens'),
	title: z.string().min(1, 'Title is required'),
	description: z.string().min(1, 'Description is required'),
	showcaseType: z.enum(['quick', 'detailed']),
	longDescription: z.string().nullable(),
	clientName: z.string().nullable(),
	industry: z.string().nullable(),
	projectType: z.string().nullable(),
	category: z.string().nullable(),
	challenge: z.string().nullable(),
	solution: z.string().nullable(),
	results: z.string().nullable(),
	imageUrl: z.string().nullable(),
	ogImageUrl: z.string().nullable(),
	gradientClass: z.string().nullable(),
	externalLink: z.string().nullable(),
	githubLink: z.string().nullable(),
	testimonialText: z.string().nullable(),
	testimonialAuthor: z.string().nullable(),
	testimonialRole: z.string().nullable(),
	testimonialVideoUrl: z.string().nullable(),
	projectDuration: z.string().nullable(),
	teamSize: z.number().nullable(),
	technologies: z.array(z.string()),
	metrics: z.record(z.string(), z.string()),
	galleryImages: z.array(z.string()),
	featured: z.boolean(),
	published: z.boolean(),
	displayOrder: z.number()
})

export type CreateShowcaseInput = z.infer<typeof createShowcaseSchema>
export type UpdateShowcaseInput = z.infer<typeof updateShowcaseSchema>
