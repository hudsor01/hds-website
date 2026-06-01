/**
 * Free-mockup landing form -> contact pipeline mapping.
 *
 * The /free-mockup landing page collects a deliberately small set of fields
 * (name, business, current online presence, contact) and maps them onto the
 * shared ContactFormData so the lead flows through the existing /api/contact
 * pipeline unchanged: lead insert, lead scoring, attribution persistence, the
 * Google Ads offline-conversion upload (sendAdConversion), and the welcome /
 * admin emails. Kept as a pure function so the mapping is unit-tested without
 * mounting the client form.
 */

import type { Attribution } from '@/lib/attribution'
import type { ContactFormData } from '@/lib/schemas/contact'

export interface FreeMockupFormValues {
	firstName: string
	lastName: string
	email: string
	businessName: string
	/** Current website URL or Google listing. Optional. */
	currentSite: string
	/** Optional phone number. */
	phone: string
}

/**
 * Map the minimal free-mockup form values onto ContactFormData. The free-text
 * `message` the contact pipeline requires is synthesized from the structured
 * fields, so the prospect never has to write prose and the admin notification
 * still carries the business name and current online presence.
 */
export function buildFreeMockupPayload(
	values: FreeMockupFormValues,
	attribution: Attribution | undefined
): ContactFormData {
	const business = values.businessName.trim()
	const currentSite = values.currentSite.trim()

	const message = [
		'Free website mockup request (via the /free-mockup landing page).',
		`Business: ${business}`,
		`Current website or Google listing: ${currentSite || 'none provided'}`
	].join('\n')

	return {
		firstName: values.firstName.trim(),
		lastName: values.lastName.trim(),
		email: values.email.trim(),
		phone: values.phone.trim(),
		company: business,
		// Tag the lead as a website-design intent so lead scoring credits a
		// specific service and the admin notification shows the request type.
		service: 'website-design',
		message,
		attribution
	}
}
