import { beforeEach, describe, expect, it } from 'bun:test'
import { trackConversion } from '@/lib/analytics'

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
})
