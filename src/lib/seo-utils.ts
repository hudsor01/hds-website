// Native SEO utilities - logic only, no data bloat

import { BUSINESS_INFO } from '@/lib/constants/business'

const SITE_URL = 'https://hudsondigitalsolutions.com'
const LOGO_URL = `${SITE_URL}/HDS-Logo.webp`

/**
 * Generate schema markup for website
 */
export function generateWebsiteSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'Hudson Digital Solutions',
		url: SITE_URL,
		description:
			'Professional website design and development for small businesses.'
	}
}

/**
 * Generate schema markup for organization
 */
export function generateOrganizationSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'Hudson Digital Solutions',
		url: SITE_URL,
		logo: LOGO_URL,
		image: LOGO_URL,
		description:
			'Professional website design and development for small businesses.',
		foundingDate: '2020',
		address: {
			'@type': 'PostalAddress',
			streetAddress: BUSINESS_INFO.location.streetAddress,
			addressLocality: BUSINESS_INFO.location.city,
			addressRegion: BUSINESS_INFO.location.stateCode,
			postalCode: BUSINESS_INFO.location.postalCode,
			addressCountry: 'US'
		},
		contactPoint: {
			'@type': 'ContactPoint',
			contactType: 'Customer Service',
			email: BUSINESS_INFO.email,
			telephone: BUSINESS_INFO.phone,
			url: `${SITE_URL}/contact`,
			availableLanguage: ['English']
		},
		sameAs: ['https://github.com/hudsor01']
	}
}

/**
 * Generate local business schema. Render only on routes that represent the
 * primary business entity (home, about, contact, services). Per-location
 * pages emit their own LocalBusiness via @/lib/locations.
 */
export function generateLocalBusinessSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'LocalBusiness',
		'@id': `${SITE_URL}/#localbusiness`,
		name: 'Hudson Digital Solutions',
		url: SITE_URL,
		image: LOGO_URL,
		description:
			'Professional website design and development for small businesses',
		address: {
			'@type': 'PostalAddress',
			streetAddress: BUSINESS_INFO.location.streetAddress,
			addressLocality: BUSINESS_INFO.location.city,
			addressRegion: BUSINESS_INFO.location.stateCode,
			postalCode: BUSINESS_INFO.location.postalCode,
			addressCountry: 'US'
		},
		geo: {
			'@type': 'GeoCoordinates',
			latitude: BUSINESS_INFO.location.latitude,
			longitude: BUSINESS_INFO.location.longitude
		},
		openingHoursSpecification: [
			{
				'@type': 'OpeningHoursSpecification',
				dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
				opens: '09:00',
				closes: '17:00'
			}
		],
		telephone: BUSINESS_INFO.phone,
		email: BUSINESS_INFO.email,
		areaServed: {
			'@type': 'AdministrativeArea',
			name: 'Dallas-Fort Worth Metroplex'
		}
	}
}
