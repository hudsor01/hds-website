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

describe('Location Data', () => {
	describe('LOCATIONS', () => {
		test('contains 75 locations across multiple states', () => {
			expect(LOCATIONS).toHaveLength(75)
		})

		test('each location has required fields', () => {
			for (const location of LOCATIONS) {
				expect(location.slug).toBeTruthy()
				expect(location.city).toBeTruthy()
				expect(location.state).toBeTruthy()
				expect(location.stateCode).toBeTruthy()
				expect(location.tagline).toBeTruthy()
				expect(location.description).toBeTruthy()
				expect(location.metaDescription).toBeTruthy()
				expect(location.neighborhoods.length).toBeGreaterThan(0)
				expect(location.features.length).toBeGreaterThan(0)
			}
		})

		test('all slugs are unique', () => {
			const slugs = LOCATIONS.map(l => l.slug)
			expect(new Set(slugs).size).toBe(slugs.length)
		})
	})

	describe('getAllLocationSlugs', () => {
		test('returns all location slugs', () => {
			const slugs = getAllLocationSlugs()
			expect(slugs).toHaveLength(75)
			// Texas cities
			expect(slugs).toContain('dallas')
			expect(slugs).toContain('houston')
			expect(slugs).toContain('austin')
			expect(slugs).toContain('san-antonio')
			expect(slugs).toContain('fort-worth')
			expect(slugs).toContain('el-paso')
			expect(slugs).toContain('arlington')
			expect(slugs).toContain('corpus-christi')
			// Louisiana
			expect(slugs).toContain('baton-rouge')
			expect(slugs).toContain('new-orleans')
			expect(slugs).toContain('shreveport')
			expect(slugs).toContain('lafayette')
			expect(slugs).toContain('lake-charles')
			expect(slugs).toContain('monroe')
			expect(slugs).toContain('alexandria')
			// Oklahoma
			expect(slugs).toContain('oklahoma-city')
			expect(slugs).toContain('tulsa')
			expect(slugs).toContain('norman')
			expect(slugs).toContain('broken-arrow')
			expect(slugs).toContain('edmond')
			expect(slugs).toContain('lawton')
			expect(slugs).toContain('stillwater')
			// Arizona
			expect(slugs).toContain('phoenix')
			expect(slugs).toContain('tucson')
			expect(slugs).toContain('mesa')
			expect(slugs).toContain('scottsdale')
			expect(slugs).toContain('chandler')
			expect(slugs).toContain('flagstaff')
			expect(slugs).toContain('tempe')
			// New Mexico
			expect(slugs).toContain('santa-fe')
			expect(slugs).toContain('albuquerque')
			expect(slugs).toContain('las-cruces')
			expect(slugs).toContain('rio-rancho')
			expect(slugs).toContain('roswell')
			expect(slugs).toContain('farmington')
			// Arkansas
			expect(slugs).toContain('little-rock')
			expect(slugs).toContain('fort-smith')
			expect(slugs).toContain('fayetteville')
			expect(slugs).toContain('springdale')
			expect(slugs).toContain('jonesboro')
			expect(slugs).toContain('bentonville')
			expect(slugs).toContain('hot-springs')
			// Georgia
			expect(slugs).toContain('atlanta')
			expect(slugs).toContain('savannah')
			expect(slugs).toContain('augusta')
			expect(slugs).toContain('columbus-ga')
			expect(slugs).toContain('macon')
			expect(slugs).toContain('athens')
			// Colorado
			expect(slugs).toContain('denver')
			expect(slugs).toContain('colorado-springs')
			expect(slugs).toContain('fort-collins')
			expect(slugs).toContain('boulder')
			expect(slugs).toContain('pueblo')
			expect(slugs).toContain('aurora')
			// Tennessee
			expect(slugs).toContain('nashville')
			expect(slugs).toContain('memphis')
			expect(slugs).toContain('knoxville')
			expect(slugs).toContain('chattanooga')
			expect(slugs).toContain('clarksville')
			expect(slugs).toContain('murfreesboro')
			// North Carolina
			expect(slugs).toContain('charlotte')
			expect(slugs).toContain('raleigh')
			expect(slugs).toContain('greensboro')
			expect(slugs).toContain('durham')
			expect(slugs).toContain('winston-salem')
			expect(slugs).toContain('wilmington')
			expect(slugs).toContain('asheville')
			expect(slugs).toContain('fayetteville-nc')
			// Florida
			expect(slugs).toContain('miami')
			expect(slugs).toContain('tallahassee')
			expect(slugs).toContain('jacksonville')
			expect(slugs).toContain('tampa')
			expect(slugs).toContain('orlando')
			expect(slugs).toContain('st-petersburg')
			expect(slugs).toContain('fort-lauderdale')
		})
	})

	describe('getLocationBySlug', () => {
		test('returns location data for valid slug', () => {
			const location = getLocationBySlug('dallas')

			expect(location).toBeDefined()
			expect(location?.city).toBe('Dallas')
			expect(location?.stateCode).toBe('TX')
			expect(location?.neighborhoods).toContain('Downtown Dallas')
		})

		test('returns undefined for invalid slug', () => {
			const location = getLocationBySlug('nonexistent')
			expect(location).toBeUndefined()
		})

		test('returns correct data for representative cities', () => {
			const expectedCityNames: Record<string, string> = {
				// Texas
				dallas: 'Dallas',
				houston: 'Houston',
				austin: 'Austin',
				'san-antonio': 'San Antonio',
				'fort-worth': 'Fort Worth',
				'el-paso': 'El Paso',
				arlington: 'Arlington',
				'corpus-christi': 'Corpus Christi',
				// Louisiana
				'baton-rouge': 'Baton Rouge',
				'new-orleans': 'New Orleans',
				lafayette: 'Lafayette',
				// Oklahoma
				'oklahoma-city': 'Oklahoma City',
				tulsa: 'Tulsa',
				// Arizona
				phoenix: 'Phoenix',
				tucson: 'Tucson',
				scottsdale: 'Scottsdale',
				// New Mexico
				'santa-fe': 'Santa Fe',
				albuquerque: 'Albuquerque',
				// Arkansas
				'little-rock': 'Little Rock',
				fayetteville: 'Fayetteville',
				bentonville: 'Bentonville',
				// Georgia
				atlanta: 'Atlanta',
				savannah: 'Savannah',
				// Colorado
				denver: 'Denver',
				'colorado-springs': 'Colorado Springs',
				boulder: 'Boulder',
				// Tennessee
				nashville: 'Nashville',
				memphis: 'Memphis',
				chattanooga: 'Chattanooga',
				// North Carolina
				charlotte: 'Charlotte',
				raleigh: 'Raleigh',
				durham: 'Durham',
				// Florida
				miami: 'Miami',
				tampa: 'Tampa',
				orlando: 'Orlando'
			}

			for (const [slug, cityName] of Object.entries(expectedCityNames)) {
				const location = getLocationBySlug(slug)
				expect(location?.city).toBe(cityName)
			}
		})

		test('includes locations from all 11 states', () => {
			const states = new Set(LOCATIONS.map(l => l.stateCode))
			expect(states.size).toBe(11)
			expect(states.has('TX')).toBe(true)
			expect(states.has('LA')).toBe(true)
			expect(states.has('OK')).toBe(true)
			expect(states.has('AZ')).toBe(true)
			expect(states.has('NM')).toBe(true)
			expect(states.has('AR')).toBe(true)
			expect(states.has('GA')).toBe(true)
			expect(states.has('CO')).toBe(true)
			expect(states.has('TN')).toBe(true)
			expect(states.has('NC')).toBe(true)
			expect(states.has('FL')).toBe(true)
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
			const location = getLocationBySlug('austin')
			if (!location) {
				throw new Error('Austin location not found')
			}

			const [city, ...areas] = generateLocationServiceSchema(location)
				.areaServed as Array<Record<string, unknown>>

			expect(city).toMatchObject({
				'@type': 'City',
				name: 'Austin',
				containedInPlace: { '@type': 'State', name: 'Texas' }
			})
			expect(areas.map(area => area.name)).toEqual(location.neighborhoods)
		})
	})
})
