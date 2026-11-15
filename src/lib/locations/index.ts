/**
 * Location Data
 * Service-area pages for the Dallas-Fort Worth cities the business serves
 * in person. Out-of-area pages were retired; see ./retired.ts.
 */

import { BUSINESS_ID } from '@/lib/seo-utils'

import { DFW_LOCATIONS } from './dfw'

export type { LocationData } from './types'

import type { LocationData } from './types'

export const LOCATIONS: LocationData[] = DFW_LOCATIONS

/**
 * Get all location slugs for static generation
 */
export function getAllLocationSlugs(): string[] {
	return LOCATIONS.map(location => location.slug)
}

/**
 * Get location data by slug
 */
export function getLocationBySlug(slug: string): LocationData | undefined {
	return LOCATIONS.find(location => location.slug === slug)
}

/**
 * Service schema for a location page.
 *
 * The business has one address, in Lewisville. A location page describes
 * the service offered to a city, so it emits a Service whose provider is
 * that one business (by @id) and whose areaServed is the city. It used to
 * emit a LocalBusiness that spliced the Lewisville street and ZIP onto
 * each city, an address that does not exist, on every location page.
 */
export function generateLocationServiceSchema(location: LocationData) {
	const url = `https://hudsondigitalsolutions.com/locations/${location.slug}`
	return {
		'@context': 'https://schema.org',
		'@type': 'Service',
		'@id': `${url}#service`,
		name: `Website design in ${location.city}, ${location.stateCode}`,
		serviceType: 'Web design',
		description: location.metaDescription,
		url,
		provider: { '@id': BUSINESS_ID },
		areaServed: [
			{
				'@type': 'City',
				name: location.city,
				containedInPlace: { '@type': 'State', name: location.state }
			},
			...location.neighborhoods.map(name => ({ '@type': 'Place', name }))
		]
	}
}
