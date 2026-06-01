/**
 * Unit tests for the free-mockup -> contact payload mapping. Verifies the
 * minimal landing form produces a ContactFormData the existing /api/contact
 * pipeline accepts (synthesized message over the 10-char minimum, tagged
 * service, business mapped to company, attribution passed through).
 */
import { describe, expect, it } from 'bun:test'
import type { Attribution } from '@/lib/attribution'
import {
	buildFreeMockupPayload,
	type FreeMockupFormValues
} from '@/lib/free-mockup'
import { contactFormSchema } from '@/lib/schemas/contact'

const BASE: FreeMockupFormValues = {
	firstName: 'Maria',
	lastName: 'Lopez',
	email: 'maria@tacos.com',
	businessName: "Maria's Tacos",
	currentSite: '',
	phone: ''
}

describe('buildFreeMockupPayload', () => {
	it('maps the core contact fields and tags the service', () => {
		const out = buildFreeMockupPayload(BASE, undefined)
		expect(out.firstName).toBe('Maria')
		expect(out.lastName).toBe('Lopez')
		expect(out.email).toBe('maria@tacos.com')
		expect(out.company).toBe("Maria's Tacos")
		expect(out.service).toBe('website-design')
	})

	it('synthesizes a message with the business and a none-provided fallback', () => {
		const out = buildFreeMockupPayload(BASE, undefined)
		expect(out.message).toContain('Free website mockup request')
		expect(out.message).toContain("Business: Maria's Tacos")
		expect(out.message).toContain('none provided')
		// Must clear the contact pipeline's 10-char minimum.
		expect(out.message.length).toBeGreaterThanOrEqual(10)
	})

	it('includes the current site when provided', () => {
		const out = buildFreeMockupPayload(
			{ ...BASE, currentSite: 'mariastacos.square.site' },
			undefined
		)
		expect(out.message).toContain('mariastacos.square.site')
		expect(out.message).not.toContain('none provided')
	})

	it('trims whitespace from inputs', () => {
		const out = buildFreeMockupPayload(
			{
				...BASE,
				firstName: '  Maria  ',
				businessName: '  Tacos  ',
				phone: ' 5551234567 '
			},
			undefined
		)
		expect(out.firstName).toBe('Maria')
		expect(out.company).toBe('Tacos')
		expect(out.phone).toBe('5551234567')
	})

	it('passes marketing attribution through to the lead', () => {
		const attribution = { gclid: 'GCLID_1', utmSource: 'google' } as Attribution
		const out = buildFreeMockupPayload(BASE, attribution)
		expect(out.attribution).toEqual(attribution)
	})
})

describe('buildFreeMockupPayload output satisfies contactFormSchema', () => {
	it('produces a payload the /api/contact pipeline accepts', () => {
		const result = contactFormSchema.safeParse(
			buildFreeMockupPayload(
				{ ...BASE, currentSite: 'mariastacos.com', phone: '555-123-4567' },
				undefined
			)
		)
		expect(result.success).toBe(true)
	})

	it('validates with the smallest valid inputs (2-char names, blank optionals)', () => {
		const result = contactFormSchema.safeParse(
			buildFreeMockupPayload(
				{
					firstName: 'Al',
					lastName: 'Bo',
					email: 'al@bo.co',
					businessName: 'Al Co',
					currentSite: '',
					phone: ''
				},
				undefined
			)
		)
		expect(result.success).toBe(true)
	})
})
