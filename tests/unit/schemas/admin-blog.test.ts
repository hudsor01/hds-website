/**
 * Unit tests for the admin blog Zod schemas.
 *
 * The admin form is distinct from the n8n ingest endpoint:
 *   - n8n posts `authorSlug` + `tagSlugs` (string lookups).
 *   - the admin form posts `authorId` + `tagIds` (uuid references picked
 *     from the existing `blog_authors` / `blog_tags` tables in <select>s).
 *
 * `createAdminBlogPostSchema` lives in `src/lib/schemas/admin-blog.ts` and
 * leaves the existing `createBlogPostSchema` in `blog-api.ts` byte-equal to
 * main per CONTEXT.md D-13.
 */
import { describe, expect, it } from 'bun:test'
import {
	createAdminBlogPostSchema,
	updateAdminBlogPostSchema
} from '@/lib/schemas/admin-blog'

const VALID_UUID = '00000000-0000-4000-8000-000000000001'
const ANOTHER_UUID = '00000000-0000-4000-8000-000000000002'

function baseInput() {
	return {
		slug: 'hello-world',
		title: 'Hello World',
		excerpt: 'A short summary.',
		content: '# Hello\n\nBody content.',
		featureImage: 'https://cdn.example.com/cover.webp',
		readingTime: 7,
		featured: false,
		published: true,
		authorId: VALID_UUID,
		tagIds: [ANOTHER_UUID]
	}
}

describe('createAdminBlogPostSchema', () => {
	it('parses a fully populated happy-path input', () => {
		const parsed = createAdminBlogPostSchema.safeParse(baseInput())
		expect(parsed.success).toBe(true)
		if (parsed.success) {
			expect(parsed.data.slug).toBe('hello-world')
			expect(parsed.data.authorId).toBe(VALID_UUID)
			expect(parsed.data.tagIds).toEqual([ANOTHER_UUID])
			expect(parsed.data.featureImage).toBe(
				'https://cdn.example.com/cover.webp'
			)
		}
	})

	it('rejects when authorId is missing', () => {
		const input = baseInput() as Record<string, unknown>
		delete input.authorId
		const parsed = createAdminBlogPostSchema.safeParse(input)
		expect(parsed.success).toBe(false)
	})

	it('rejects an invalid slug (uppercase / spaces)', () => {
		const parsed = createAdminBlogPostSchema.safeParse({
			...baseInput(),
			slug: 'Hello World'
		})
		expect(parsed.success).toBe(false)
	})

	it('defaults tagIds to [] when the key is absent', () => {
		const input = baseInput() as Record<string, unknown>
		delete input.tagIds
		const parsed = createAdminBlogPostSchema.safeParse(input)
		expect(parsed.success).toBe(true)
		if (parsed.success) {
			expect(parsed.data.tagIds).toEqual([])
		}
	})

	it('transforms an empty featureImage string to null', () => {
		const parsed = createAdminBlogPostSchema.safeParse({
			...baseInput(),
			featureImage: ''
		})
		expect(parsed.success).toBe(true)
		if (parsed.success) {
			expect(parsed.data.featureImage).toBeNull()
		}
	})
})

describe('updateAdminBlogPostSchema', () => {
	it('extends the create schema with a required uuid id', () => {
		const parsed = updateAdminBlogPostSchema.safeParse({
			...baseInput(),
			id: VALID_UUID
		})
		expect(parsed.success).toBe(true)
	})

	it('rejects when id is missing', () => {
		const parsed = updateAdminBlogPostSchema.safeParse(baseInput())
		expect(parsed.success).toBe(false)
	})
})
