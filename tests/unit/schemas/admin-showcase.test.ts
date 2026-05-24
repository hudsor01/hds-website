/**
 * Unit tests for the admin showcase Zod schemas.
 *
 * Verifies the create / update contract that backs both the Server Action
 * safeParse and the TanStack Form bindings:
 *  - Required fields (slug, title, description, showcaseType) reject when missing.
 *  - The shared slug regex matches the existing public schema in
 *    `src/lib/schemas/blog-api.ts`.
 *  - Optional text columns accept empty strings and coerce them to null so
 *    the DB sees a real NULL rather than the literal empty string.
 *  - URL-typed columns either look like an http(s) URL or come through as null.
 *  - JSONB columns (technologies, metrics, galleryImages) carry sane defaults
 *    when omitted from the form payload.
 *  - updateShowcaseSchema only differs from create by requiring `id`.
 */
import { describe, expect, it } from 'bun:test'
import {
	createShowcaseSchema,
	updateShowcaseSchema
} from '@/lib/schemas/admin-showcase'

describe('createShowcaseSchema', () => {
	const minimumValid = {
		slug: 'my-project',
		title: 'My Project',
		description: 'A short description.',
		showcaseType: 'quick' as const
	}

	it('accepts the minimum required field set and applies defaults', () => {
		const result = createShowcaseSchema.safeParse(minimumValid)
		expect(result.success).toBe(true)
		if (!result.success) {
			return
		}
		expect(result.data.slug).toBe('my-project')
		expect(result.data.showcaseType).toBe('quick')
		expect(result.data.technologies).toEqual([])
		expect(result.data.metrics).toEqual({})
		expect(result.data.galleryImages).toEqual([])
		expect(result.data.featured).toBe(false)
		expect(result.data.published).toBe(false)
		expect(result.data.displayOrder).toBe(0)
	})

	it('rejects when slug is missing', () => {
		const { slug: _slug, ...withoutSlug } = minimumValid
		const result = createShowcaseSchema.safeParse(withoutSlug)
		expect(result.success).toBe(false)
	})

	it('rejects when slug violates the kebab-case regex', () => {
		const result = createShowcaseSchema.safeParse({
			...minimumValid,
			slug: 'Not A Valid Slug'
		})
		expect(result.success).toBe(false)
	})

	it('rejects when title is empty', () => {
		const result = createShowcaseSchema.safeParse({
			...minimumValid,
			title: ''
		})
		expect(result.success).toBe(false)
	})

	it('rejects when showcaseType is not in the enum', () => {
		const result = createShowcaseSchema.safeParse({
			...minimumValid,
			showcaseType: 'banana'
		})
		expect(result.success).toBe(false)
	})

	it('parses technologies as a string array', () => {
		const result = createShowcaseSchema.safeParse({
			...minimumValid,
			technologies: ['Next.js', 'Drizzle', 'Neon']
		})
		expect(result.success).toBe(true)
		if (!result.success) {
			return
		}
		expect(result.data.technologies).toEqual(['Next.js', 'Drizzle', 'Neon'])
	})

	it('coerces optional text empty string to null', () => {
		const result = createShowcaseSchema.safeParse({
			...minimumValid,
			clientName: '',
			industry: ''
		})
		expect(result.success).toBe(true)
		if (!result.success) {
			return
		}
		expect(result.data.clientName).toBeNull()
		expect(result.data.industry).toBeNull()
	})

	it('coerces optional URL empty string to null', () => {
		const result = createShowcaseSchema.safeParse({
			...minimumValid,
			imageUrl: '',
			externalLink: ''
		})
		expect(result.success).toBe(true)
		if (!result.success) {
			return
		}
		expect(result.data.imageUrl).toBeNull()
		expect(result.data.externalLink).toBeNull()
	})

	it('rejects an optional URL that is not http(s)', () => {
		const result = createShowcaseSchema.safeParse({
			...minimumValid,
			imageUrl: 'not-a-url'
		})
		expect(result.success).toBe(false)
	})

	it('accepts an http(s) URL for optional URL fields', () => {
		const result = createShowcaseSchema.safeParse({
			...minimumValid,
			imageUrl: 'https://example.com/image.png',
			githubLink: 'https://github.com/example/repo'
		})
		expect(result.success).toBe(true)
		if (!result.success) {
			return
		}
		expect(result.data.imageUrl).toBe('https://example.com/image.png')
		expect(result.data.githubLink).toBe('https://github.com/example/repo')
	})

	it('coerces published string "true" to a boolean', () => {
		const result = createShowcaseSchema.safeParse({
			...minimumValid,
			published: 'true'
		})
		expect(result.success).toBe(true)
		if (!result.success) {
			return
		}
		expect(result.data.published).toBe(true)
	})

	it('parses a metrics object of string -> string', () => {
		const result = createShowcaseSchema.safeParse({
			...minimumValid,
			metrics: { users: '10k', uptime: '99.9%' }
		})
		expect(result.success).toBe(true)
		if (!result.success) {
			return
		}
		expect(result.data.metrics).toEqual({ users: '10k', uptime: '99.9%' })
	})
})

describe('updateShowcaseSchema', () => {
	it('requires id in addition to every create field', () => {
		const result = updateShowcaseSchema.safeParse({
			slug: 'my-project',
			title: 'My Project',
			description: 'A short description.',
			showcaseType: 'quick'
		})
		expect(result.success).toBe(false)
	})

	it('accepts a valid uuid id with all required create fields', () => {
		const result = updateShowcaseSchema.safeParse({
			id: '123e4567-e89b-12d3-a456-426614174000',
			slug: 'my-project',
			title: 'My Project',
			description: 'A short description.',
			showcaseType: 'quick'
		})
		expect(result.success).toBe(true)
		if (!result.success) {
			return
		}
		expect(result.data.id).toBe('123e4567-e89b-12d3-a456-426614174000')
	})

	it('rejects a non-uuid id', () => {
		const result = updateShowcaseSchema.safeParse({
			id: 'not-a-uuid',
			slug: 'my-project',
			title: 'My Project',
			description: 'A short description.',
			showcaseType: 'quick'
		})
		expect(result.success).toBe(false)
	})
})
