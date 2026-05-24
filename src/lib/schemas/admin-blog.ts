/**
 * Zod schemas for the admin blog forms (Phase 04, Plan 03).
 *
 * Distinct from `createBlogPostSchema` in `src/lib/schemas/blog-api.ts`,
 * which is the n8n ingest contract and stays byte-equal to main per
 * CONTEXT.md D-13. The admin form picks the author and tags by uuid from
 * existing `blog_authors` / `blog_tags` rows (no slug lookup needed), so a
 * separate schema is cleaner than overloading the public one.
 *
 * Field choices mirror the public DB schema in `src/lib/schemas/blog.ts`:
 *  - `slug` matches the regex used by the public schema so a slug accepted
 *    here is also acceptable on the public surface.
 *  - `published` defaults to `true` (matches the DB column default, unlike
 *    showcase which defaults to `false`).
 *  - `featureImage` accepts URL or empty string; empty string transforms
 *    to `null` so the action can pass `featureImage ?? null` to the DB
 *    without a runtime branch.
 *  - `readingTime`, `featured`, `published` use `z.coerce.*` so a posted
 *    `FormData` value (always a string) coerces cleanly without callers
 *    pre-parsing.
 */
import { z } from 'zod'

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const optionalUrl = z
	.string()
	.max(2000)
	.refine(v => v === '' || /^https?:\/\//.test(v), 'Must be a URL or empty')
	.transform(v => (v === '' ? null : v))
	.nullable()
	.optional()

export const createAdminBlogPostSchema = z.object({
	slug: z
		.string()
		.min(1)
		.max(200)
		.regex(slugRegex, 'Slug must be lowercase alphanumeric with hyphens'),
	title: z.string().min(1).max(200),
	excerpt: z.string().min(1).max(500),
	content: z.string().min(1),
	featureImage: optionalUrl,
	readingTime: z.coerce.number().int().min(1).max(60).default(5),
	featured: z.coerce.boolean().default(false),
	published: z.coerce.boolean().default(true),
	authorId: z.string().uuid(),
	tagIds: z.array(z.string().uuid()).default([])
})

export const updateAdminBlogPostSchema = createAdminBlogPostSchema.extend({
	id: z.string().uuid()
})

export type CreateAdminBlogPostInput = z.infer<typeof createAdminBlogPostSchema>
export type UpdateAdminBlogPostInput = z.infer<typeof updateAdminBlogPostSchema>
