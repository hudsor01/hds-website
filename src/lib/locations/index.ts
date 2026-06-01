/**
 * Location Data
 * Dynamic location pages for SEO and local marketing across the US
 */

import { BUSINESS_INFO } from '../constants/business'

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
 * Generate LocalBusiness schema for a location page.
 *
 * Two address signals at play here:
 *   1. The business's actual postal address (street + zip) — comes from
 *      BUSINESS_INFO.location and is the same on every location page.
 *      Google needs this for rich-result eligibility ("Missing field
 *      streetAddress / postalCode" warning otherwise).
 *   2. The geographic area the page targets — that's `addressLocality`
 *      (the location's city) plus the `areaServed` neighbourhood list.
 *
 * We emit both. The PostalAddress carries the canonical street/zip;
 * areaServed enumerates the neighbourhoods the page is positioned for.
 */
export function generateLocalBusinessSchema(location: LocationData) {
	return {
		'@context': 'https://schema.org',
		'@type': 'LocalBusiness',
		name: 'Hudson Digital Solutions',
		url: `https://hudsondigitalsolutions.com/locations/${location.slug}`,
		email: BUSINESS_INFO.email,
		telephone: BUSINESS_INFO.phone,
		address: {
			'@type': 'PostalAddress',
			streetAddress: BUSINESS_INFO.location.streetAddress,
			addressLocality: location.city,
			addressRegion: location.stateCode,
			postalCode: BUSINESS_INFO.location.postalCode,
			addressCountry: 'US'
		},
		areaServed: location.neighborhoods.map(name => ({
			'@type': 'City',
			name
		})),
		sameAs: [BUSINESS_INFO.links.facebook]
	}
}
