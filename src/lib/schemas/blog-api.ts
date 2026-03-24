/**
 * Blog API Validation Schemas
 * Zod schemas for blog post creation via external systems (n8n, etc.)
 */

import { z } from 'zod'

/** Schema for creating a new blog post via API */
export const createBlogPostSchema = z.object({
	title: z.string().min(1, 'Title is required').max(200),
	slug: z
		.string()
		.min(1)
		.max(200)
		.regex(
			/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
			'Slug must be lowercase alphanumeric with hyphens'
		),
	excerpt: z.string().min(1, 'Excerpt is required').max(500),
	content: z.string().min(1, 'Content is required'),
	featureImage: z.string().url().nullable().optional(),
	readingTime: z.number().int().min(1).max(60).optional().default(5),
	featured: z.boolean().optional().default(false),
	published: z.boolean().optional().default(false),
	authorSlug: z.string().min(1, 'Author slug is required'),
	tagSlugs: z.array(z.string()).optional().default([])
})

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>
