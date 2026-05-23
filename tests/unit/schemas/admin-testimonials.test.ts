/**
 * Unit tests for the admin-side testimonial Zod schemas.
 *
 * These schemas back the admin Server Actions (create + update). Public
 * submit schemas live in `src/lib/schemas/query-params.ts` and stay
 * untouched. The admin shape differs because the operator picks
 * `published` and `featured` explicitly (the public submit forces
 * published=false), and the admin form omits the request token entirely.
 *
 * Critical edge cases:
 *  - empty optional URL strings collapse to null (forms send "" for blank)
 *  - rating is integer 1..5; outside that range rejects
 *  - update schema requires a uuid `id`
 */
import { describe, expect, it } from 'bun:test'
import {
	createAdminTestimonialSchema,
	updateAdminTestimonialSchema
} from '@/lib/schemas/admin-testimonials'

const validCreate = {
	name: 'Sarah Mitchell',
	content:
		'They built a website that doubled our lead volume in the first month.'
}

describe('createAdminTestimonialSchema', () => {
	it('accepts a minimum valid input (name + content only)', () => {
		const result = createAdminTestimonialSchema.safeParse(validCreate)
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.name).toBe('Sarah Mitchell')
			expect(result.data.featured).toBe(false)
			expect(result.data.published).toBe(false)
		}
	})

	it('rejects when name is missing', () => {
		const { name, ...withoutName } = validCreate
		void name
		expect(createAdminTestimonialSchema.safeParse(withoutName).success).toBe(
			false
		)
		expect(
			createAdminTestimonialSchema.safeParse({ ...validCreate, name: '' })
				.success
		).toBe(false)
	})

	it('rejects rating below 1', () => {
		expect(
			createAdminTestimonialSchema.safeParse({ ...validCreate, rating: 0 })
				.success
		).toBe(false)
	})

	it('rejects rating above 5', () => {
		expect(
			createAdminTestimonialSchema.safeParse({ ...validCreate, rating: 6 })
				.success
		).toBe(false)
	})

	it('coerces empty imageUrl / videoUrl strings to null', () => {
		const result = createAdminTestimonialSchema.safeParse({
			...validCreate,
			imageUrl: '',
			videoUrl: ''
		})
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.imageUrl).toBeNull()
			expect(result.data.videoUrl).toBeNull()
		}
	})
})

describe('updateAdminTestimonialSchema', () => {
	it('requires a uuid id on top of the create shape', () => {
		const result = updateAdminTestimonialSchema.safeParse({
			...validCreate,
			id: 'not-a-uuid'
		})
		expect(result.success).toBe(false)

		const ok = updateAdminTestimonialSchema.safeParse({
			...validCreate,
			id: '11111111-2222-4333-8444-555555555555'
		})
		expect(ok.success).toBe(true)
	})
})
