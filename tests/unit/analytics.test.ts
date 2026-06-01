import { beforeEach, describe, expect, it } from 'bun:test'
import { stripPii, trackConversion } from '@/lib/analytics'

describe('stripPii', () => {
	it('drops PII keys (case-insensitive) and keeps everything else', () => {
		const out = stripPii({
			email: 'jane@example.com',
			Phone: '555-0100',
			firstName: 'Jane',
			address: '1 Main St',
			source: 'newsletter',
			count: 3
		})
		expect(out.email).toBeUndefined()
		expect(out.Phone).toBeUndefined()
		expect(out.firstName).toBeUndefined()
		expect(out.address).toBeUndefined()
		expect(out.source).toBe('newsletter')
		expect(out.count).toBe(3)
	})

	it('returns an empty object for undefined input', () => {
		expect(stripPii(undefined)).toEqual({})
	})
})

// No module mock: trackConversion's Vercel Analytics call is wrapped in
// try/catch and inert outside a Vercel-instrumented page, and we assert only
// the platform-agnostic dataLayer push. Mocking @vercel/analytics here would
// leak globally and break other suites.

describe('trackConversion -> dataLayer', () => {
	beforeEach(() => {
		window.dataLayer = []
	})

	it('pushes a GA4/GTM-standard event a tag manager can consume', () => {
		trackConversion('generate_lead', 1500, 'USD', { source: 'contact-form' })
		const last = (window.dataLayer ?? []).at(-1) as Record<string, unknown>
		expect(last.event).toBe('generate_lead')
		expect(last.value).toBe(1500)
		expect(last.currency).toBe('USD')
		expect(last.source).toBe('contact-form')
	})

	it('omits value/currency when no value is provided', () => {
		trackConversion('generate_lead', undefined, undefined, {
			source: 'contact-form'
		})
		const last = (window.dataLayer ?? []).at(-1) as Record<string, unknown>
		expect(last.event).toBe('generate_lead')
		expect('value' in last).toBe(false)
		expect('currency' in last).toBe(false)
	})

	it('strips PII before pushing to the dataLayer (3rd-party sink)', () => {
		trackConversion('generate_lead', undefined, undefined, {
			email: 'jane@example.com',
			phone: '555-0100',
			name: 'Jane Doe',
			source: 'contact-form'
		})
		const last = (window.dataLayer ?? []).at(-1) as Record<string, unknown>
		expect(last.email).toBeUndefined()
		expect(last.phone).toBeUndefined()
		expect(last.name).toBeUndefined()
		expect(last.source).toBe('contact-form')
	})
})
