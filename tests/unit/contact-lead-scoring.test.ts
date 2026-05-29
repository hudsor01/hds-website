/**
 * Lock the contract that `scoreLeadFromContactData` is enum-agnostic for
 * the `service` field — `hasSpecificService` only checks `service !==
 * 'other'`, so any new option value picks up the SPECIFIC_SERVICE
 * bonus and any future service-specific scoring branch must be added
 * explicitly (audit #277).
 */
import { describe, expect, it } from 'bun:test'
import {
	type ContactFormData,
	scoreLeadFromContactData
} from '@/lib/schemas/contact'

const BASE: ContactFormData = {
	firstName: 'Riley',
	lastName: 'Sanders',
	email: 'riley@example.com',
	phone: '',
	company: '',
	bestTimeToContact: 'anytime',
	budget: 'under-5k',
	timeline: 'flexible',
	message: 'Hello, looking for help.'
}

describe('scoreLeadFromContactData service enum coverage', () => {
	for (const service of [
		'website-design',
		'seo',
		'booking-payments'
	] as const) {
		it(`awards SPECIFIC_SERVICE points for "${service}"`, () => {
			const out = scoreLeadFromContactData({ ...BASE, service })
			expect(out.factors.hasSpecificService).toBe(true)
		})
	}

	it('does NOT award SPECIFIC_SERVICE points for "other"', () => {
		const out = scoreLeadFromContactData({ ...BASE, service: 'other' })
		expect(out.factors.hasSpecificService).toBe(false)
	})

	it('does NOT award SPECIFIC_SERVICE points when service is omitted', () => {
		// Strip the `service` field entirely; ContactFormData allows it.
		const { service: _omit, ...rest } = { ...BASE, service: 'other' as const }
		const out = scoreLeadFromContactData(rest as ContactFormData)
		expect(out.factors.hasSpecificService).toBe(false)
	})
})
