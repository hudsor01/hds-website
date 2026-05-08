/**
 * Tests for shared validators in src/lib/schemas/common.ts.
 * Closes one half of the audit's "Validation schemas: tests required"
 * gap (the other half is per-feature schemas — see schemas-*.test.ts).
 */

import { describe, expect, it } from 'bun:test'
import {
	budgetOptionsSchema,
	companySchema,
	emailSchema,
	messageSchema,
	nameSchema,
	phoneSchema,
	serviceOptionsSchema,
	timelineOptionsSchema,
	urlSchema
} from '@/lib/schemas/common'

describe('emailSchema', () => {
	it('lower-cases the local-part on success', () => {
		// emailSchema validates first, then lower-cases + trims, so the
		// surrounding-whitespace case fails .email() before transform runs.
		// The realistic shape is upper-case mid-input that we want lowered.
		const result = emailSchema.safeParse('Test@Example.COM')
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data).toBe('test@example.com')
		}
	})

	it('rejects malformed addresses', () => {
		expect(emailSchema.safeParse('not-an-email').success).toBe(false)
		expect(emailSchema.safeParse('').success).toBe(false)
	})
})

describe('phoneSchema', () => {
	it('accepts digits, spaces, dashes, parens, and the leading +', () => {
		expect(phoneSchema.safeParse('+1 (214) 555-0182').success).toBe(true)
		expect(phoneSchema.safeParse('').success).toBe(true) // optional
	})

	it('rejects letters and < 10 chars', () => {
		expect(phoneSchema.safeParse('555-FOO').success).toBe(false)
		expect(phoneSchema.safeParse('555').success).toBe(false)
	})
})

describe('urlSchema', () => {
	it('requires HTTPS', () => {
		expect(urlSchema.safeParse('https://example.com').success).toBe(true)
		expect(urlSchema.safeParse('http://example.com').success).toBe(false)
		expect(urlSchema.safeParse('not-a-url').success).toBe(false)
	})
})

describe('nameSchema', () => {
	it('accepts letters, spaces, hyphens, apostrophes', () => {
		expect(nameSchema.safeParse("O'Connor-Smith").success).toBe(true)
		expect(nameSchema.safeParse('Jo').success).toBe(true)
	})

	it('rejects digits, single chars, > 50 chars', () => {
		expect(nameSchema.safeParse('John1').success).toBe(false)
		expect(nameSchema.safeParse('A').success).toBe(false)
		expect(nameSchema.safeParse('A'.repeat(51)).success).toBe(false)
	})
})

describe('companySchema', () => {
	it('accepts an empty string or up to 100 chars', () => {
		expect(companySchema.safeParse('').success).toBe(true)
		expect(companySchema.safeParse('Acme Corp').success).toBe(true)
		expect(companySchema.safeParse('A'.repeat(101)).success).toBe(false)
	})
})

describe('messageSchema', () => {
	it('requires 10–5000 chars after trimming', () => {
		expect(messageSchema.safeParse('Short').success).toBe(false)
		expect(messageSchema.safeParse('Just enough!').success).toBe(true)
		expect(messageSchema.safeParse('A'.repeat(5001)).success).toBe(false)
	})
})

describe('option enum schemas', () => {
	it('reject values outside the allowed set', () => {
		expect(serviceOptionsSchema.safeParse('web-development').success).toBe(true)
		expect(serviceOptionsSchema.safeParse('marketing').success).toBe(false)
		expect(budgetOptionsSchema.safeParse('5k-15k').success).toBe(true)
		expect(budgetOptionsSchema.safeParse('1k-2k').success).toBe(false)
		expect(timelineOptionsSchema.safeParse('asap').success).toBe(true)
		expect(timelineOptionsSchema.safeParse('next-week').success).toBe(false)
	})
})
