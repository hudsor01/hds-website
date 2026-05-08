/**
 * Tests for the public testimonial Zod schemas (src/lib/schemas/query-params).
 *
 * These schemas back the public submit endpoint (token-required) and the
 * admin-issued create-request endpoint. Bad input here means a 400 to the
 * caller — the tests guard the boundary.
 */

import { describe, expect, it } from 'bun:test'
import {
	createTestimonialRequestSchema,
	testimonialSubmitSchema
} from '@/lib/schemas/query-params'

const validSubmit = {
	token: 'abc123def456',
	client_name: 'Sarah Mitchell',
	rating: 5,
	content:
		'They built a website that doubled our lead volume in the first month.'
}

describe('testimonialSubmitSchema', () => {
	it('accepts a minimum valid submission', () => {
		expect(testimonialSubmitSchema.safeParse(validSubmit).success).toBe(true)
	})

	it('requires a token', () => {
		const { token, ...withoutToken } = validSubmit
		void token
		expect(testimonialSubmitSchema.safeParse(withoutToken).success).toBe(false)
		expect(
			testimonialSubmitSchema.safeParse({ ...validSubmit, token: '' }).success
		).toBe(false)
		// Whitespace-only tokens used to slip past min(1) and silently
		// fail the request lookup; the schema now trims first.
		expect(
			testimonialSubmitSchema.safeParse({ ...validSubmit, token: '   ' })
				.success
		).toBe(false)
	})

	it('requires content >= 20 chars', () => {
		expect(
			testimonialSubmitSchema.safeParse({
				...validSubmit,
				content: 'too short'
			}).success
		).toBe(false)
	})

	it('requires content <= 2000 chars', () => {
		expect(
			testimonialSubmitSchema.safeParse({
				...validSubmit,
				content: 'A'.repeat(2001)
			}).success
		).toBe(false)
	})

	it('requires rating 1–5 (integer)', () => {
		expect(
			testimonialSubmitSchema.safeParse({ ...validSubmit, rating: 0 }).success
		).toBe(false)
		expect(
			testimonialSubmitSchema.safeParse({ ...validSubmit, rating: 6 }).success
		).toBe(false)
		// String coerces — schema uses z.coerce.number()
		expect(
			testimonialSubmitSchema.safeParse({ ...validSubmit, rating: '4' }).success
		).toBe(true)
	})

	it('treats empty optional URLs as undefined', () => {
		const result = testimonialSubmitSchema.safeParse({
			...validSubmit,
			photo_url: '',
			video_url: ''
		})
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.photo_url).toBeUndefined()
			expect(result.data.video_url).toBeUndefined()
		}
	})
})

describe('createTestimonialRequestSchema', () => {
	it('requires clientName, allows missing optional fields', () => {
		expect(
			createTestimonialRequestSchema.safeParse({ clientName: 'Acme Co.' })
				.success
		).toBe(true)
	})

	it('rejects empty clientName', () => {
		expect(
			createTestimonialRequestSchema.safeParse({ clientName: '' }).success
		).toBe(false)
	})

	it('validates email format when provided', () => {
		expect(
			createTestimonialRequestSchema.safeParse({
				clientName: 'Acme',
				clientEmail: 'not-an-email'
			}).success
		).toBe(false)
	})

	it('treats empty string as undefined for clientEmail / projectName', () => {
		const result = createTestimonialRequestSchema.safeParse({
			clientName: 'Acme',
			clientEmail: '',
			projectName: ''
		})
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.clientEmail).toBeUndefined()
			expect(result.data.projectName).toBeUndefined()
		}
	})
})
