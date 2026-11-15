/**
 * Location Data Tests
 * Tests location data functions and Service schema generation
 */
import { describe, expect, test } from 'bun:test'
import {
	generateLocationServiceSchema,
	getAllLocationSlugs,
	getLocationBySlug,
	LOCATIONS
} from '@/lib/locations'
import { RETIRED_LOCATION_SLUGS } from '@/lib/locations/retired'

describe('Location Data', () => {
	describe('LOCATIONS', () => {
		test('covers the DFW cities served in person, Lewisville first', () => {
			expect(getAllLocationSlugs()).toEqual([
				'lewisville',
				'dallas',
				'fort-worth',
				'arlington'
			])
			for (const location of LOCATIONS) {
				expect(location.stateCode).toBe('TX')
			}
		})

		test('each location has required fields', () => {
			for (const location of LOCATIONS) {
				expect(location.slug).toBeTruthy()
				expect(location.city).toBeTruthy()
				expect(location.tagline).toBeTruthy()
				expect(location.description).toBeTruthy()
				expect(location.metaDescription.length).toBeGreaterThanOrEqual(120)
				expect(location.metaDescription.length).toBeLessThanOrEqual(160)
				expect(location.neighborhoods.length).toBeGreaterThan(0)
				expect(location.features.length).toBeGreaterThan(0)
			}
		})

		test('all slugs are unique', () => {
			const slugs = LOCATIONS.map(l => l.slug)
			expect(new Set(slugs).size).toBe(slugs.length)
		})
	})

	describe('RETIRED_LOCATION_SLUGS', () => {
		test('no retired slug is still served', () => {
			expect(RETIRED_LOCATION_SLUGS.length).toBe(72)
			for (const slug of RETIRED_LOCATION_SLUGS) {
				expect(getLocationBySlug(slug)).toBeUndefined()
			}
		})
	})

	describe('getLocationBySlug', () => {
		test('returns location data for valid slug', () => {
			const location = getLocationBySlug('dallas')
			expect(location?.city).toBe('Dallas')
			expect(location?.neighborhoods).toContain('Downtown Dallas')
		})

		test('returns undefined for invalid slug', () => {
			expect(getLocationBySlug('nonexistent')).toBeUndefined()
		})
	})

	describe('generateLocationServiceSchema', () => {
		test('describes the service in the city, provided by the one business', () => {
			const location = getLocationBySlug('dallas')
			if (!location) {
				throw new Error('Dallas location not found')
			}

			const schema = generateLocationServiceSchema(location)

			expect(schema['@context']).toBe('https://schema.org')
			expect(schema['@type']).toBe('Service')
			expect(schema.url).toBe(
				'https://hudsondigitalsolutions.com/locations/dallas'
			)
			expect(schema.provider).toEqual({
				'@id': 'https://hudsondigitalsolutions.com/#localbusiness'
			})
		})

		test('never claims an address in the target city', () => {
			for (const location of LOCATIONS) {
				const schema = generateLocationServiceSchema(location)
				expect('address' in schema).toBe(false)
			}
		})

		test('serves the city first, then its neighborhoods', () => {
			const location = getLocationBySlug('lewisville')
			if (!location) {
				throw new Error('Lewisville location not found')
			}

			const [city, ...areas] = generateLocationServiceSchema(location)
				.areaServed as Array<Record<string, unknown>>

			expect(city).toMatchObject({
				'@type': 'City',
				name: 'Lewisville',
				containedInPlace: { '@type': 'State', name: 'Texas' }
			})
			expect(areas.map(area => area.name)).toEqual(location.neighborhoods)
		})
	})
})
