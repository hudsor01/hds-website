/**
 * Location Data
 * Dynamic location pages for SEO and local marketing across the US
 */

import { BUSINESS_ID } from '@/lib/seo-utils'

import { ARIZONA_LOCATIONS } from './arizona'
import { ARKANSAS_LOCATIONS } from './arkansas'
import { COLORADO_LOCATIONS } from './colorado'
import { FLORIDA_LOCATIONS } from './florida'
import { GEORGIA_LOCATIONS } from './georgia'
import { LOUISIANA_LOCATIONS } from './louisiana'
import { NEW_MEXICO_LOCATIONS } from './new-mexico'
import { NORTH_CAROLINA_LOCATIONS } from './north-carolina'
import { OKLAHOMA_LOCATIONS } from './oklahoma'
import { TENNESSEE_LOCATIONS } from './tennessee'
import { TEXAS_LOCATIONS } from './texas'

export type { LocationData } from './types'

import type { LocationData } from './types'

export const LOCATIONS: LocationData[] = [
	...TEXAS_LOCATIONS,
	...LOUISIANA_LOCATIONS,
	...OKLAHOMA_LOCATIONS,
	...ARIZONA_LOCATIONS,
	...NEW_MEXICO_LOCATIONS,
	...ARKANSAS_LOCATIONS,
	...GEORGIA_LOCATIONS,
	...COLORADO_LOCATIONS,
	...TENNESSEE_LOCATIONS,
	...NORTH_CAROLINA_LOCATIONS,
	...FLORIDA_LOCATIONS
]

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
 * Get all locations grouped by state name
 */
export function getLocationsByState(): Record<string, LocationData[]> {
	return LOCATIONS.reduce(
		(acc, location) => {
			const state = location.state
			if (!acc[state]) {
				acc[state] = []
			}
			acc[state].push(location)
			return acc
		},
		{} as Record<string, LocationData[]>
	)
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
