/**
 * Hudson Digital Solutions business information
 * Single source of truth for company contact details
 */
export const BUSINESS_INFO = {
	/** Company legal name */
	name: 'Hudson Digital Solutions',

	/** Short display name */
	displayName: 'Hudson Digital',

	/** Primary contact email */
	email: 'hello@hudsondigitalsolutions.com',

	/** Business phone number */
	phone: '(214) 843-0779',

	/** Business location — used for NAP consistency in schema and email footers */
	location: {
		streetAddress: '1301 Cherry Hill Ln',
		city: 'Lewisville',
		state: 'Texas',
		stateCode: 'TX',
		postalCode: '75067',
		country: 'United States',
		/** Approximate coords for Lewisville, TX 75067 */
		latitude: 33.0462,
		longitude: -96.9942
	},

	/** Social media and web presence */
	links: {
		website: 'https://hudsondigitalsolutions.com'
	}
} as const

export type BusinessInfo = typeof BUSINESS_INFO
