/**
 * LocalBusiness JSON-LD generator — contract + security.
 * Locks src/lib/schema-generator.ts.
 */

import { describe, expect, test } from 'bun:test'
import {
	buildLocalBusinessSchema,
	LOCAL_BUSINESS_TYPES,
	type LocalBusinessInput,
	serializeSchema,
	validateLocalBusinessInput
} from '@/lib/schema-generator'

const DALLAS_PLUMBER: LocalBusinessInput = {
	type: 'Plumber',
	name: 'Acme Plumbing',
	address: {
		street: '1500 Main St',
		city: 'Dallas',
		region: 'TX',
		postalCode: '75201',
		country: 'US'
	}
}

describe('LOCAL_BUSINESS_TYPES', () => {
	test('drops the deprecated ProfessionalService and Attorney types', () => {
		const types: readonly string[] = LOCAL_BUSINESS_TYPES
		expect(types).not.toContain('ProfessionalService')
		expect(types).not.toContain('Attorney')
	})

	test('includes the specific subtypes Google asks for', () => {
		for (const type of [
			'Dentist',
			'Plumber',
			'Electrician',
			'RoofingContractor',
			'HVACBusiness',
			'RealEstateAgent',
			'DaySpa',
			'MedicalClinic',
			'AutoRepair',
			'HairSalon',
			'BeautySalon',
			'LegalService',
			'Restaurant',
			'Store'
		]) {
			expect(LOCAL_BUSINESS_TYPES).toContain(
				type as (typeof LOCAL_BUSINESS_TYPES)[number]
			)
		}
	})
})

describe('validateLocalBusinessInput', () => {
	test('a name and full address pass', () => {
		expect(validateLocalBusinessInput(DALLAS_PLUMBER)).toEqual({
			errors: {},
			warnings: []
		})
	})

	test('requires name and every address part', () => {
		const { errors } = validateLocalBusinessInput({ name: '  ' })
		expect(Object.keys(errors).sort()).toEqual(
			['city', 'country', 'name', 'postalCode', 'region', 'street'].sort()
		)
	})

	test('requires a 2-letter country code', () => {
		const { errors } = validateLocalBusinessInput({
			...DALLAS_PLUMBER,
			address: { ...DALLAS_PLUMBER.address, country: 'USA' }
		})
		expect(errors.country).toContain('2-letter')
	})

	test('flags out-of-range and malformed coordinates', () => {
		expect(
			validateLocalBusinessInput({
				...DALLAS_PLUMBER,
				geo: { latitude: '120.00000', longitude: '-96.79700' }
			}).errors.latitude
		).toBe('Latitude must be between -90 and 90.')
		expect(
			validateLocalBusinessInput({
				...DALLAS_PLUMBER,
				geo: { latitude: '32.77670', longitude: '200.00000' }
			}).errors.longitude
		).toBe('Longitude must be between -180 and 180.')
		expect(
			validateLocalBusinessInput({
				...DALLAS_PLUMBER,
				geo: { latitude: '32.7767, -96.797', longitude: '' }
			}).errors.latitude
		).toContain('single decimal number')
	})

	test('flags a lone coordinate on the missing one', () => {
		const { errors } = validateLocalBusinessInput({
			...DALLAS_PLUMBER,
			geo: { latitude: '32.77670', longitude: '' }
		})
		expect(errors.latitude).toBeUndefined()
		expect(errors.longitude).toContain('need both values')
	})

	test('requires at least 5 decimal places', () => {
		const { errors } = validateLocalBusinessInput({
			...DALLAS_PLUMBER,
			geo: { latitude: '32.7767', longitude: '-96.79700' }
		})
		expect(errors.latitude).toContain('5 decimal places')
		expect(errors.longitude).toBeUndefined()
	})

	test('priceRange must be shorter than 100 characters', () => {
		expect(
			validateLocalBusinessInput({
				...DALLAS_PLUMBER,
				priceRange: '$'.repeat(99)
			}).errors.priceRange
		).toBeUndefined()
		expect(
			validateLocalBusinessInput({
				...DALLAS_PLUMBER,
				priceRange: '$'.repeat(100)
			}).errors.priceRange
		).toContain('fewer than 100')
	})

	test('warns when hours are partial instead of dropping them silently', () => {
		for (const entry of [
			{ days: ['Monday'], opens: '', closes: '' },
			{ days: [], opens: '09:00', closes: '17:00' },
			{ days: ['Monday'], opens: '09:00', closes: '' }
		]) {
			expect(
				validateLocalBusinessInput({ ...DALLAS_PLUMBER, openingHours: [entry] })
					.warnings
			).toHaveLength(1)
		}
		expect(
			validateLocalBusinessInput({
				...DALLAS_PLUMBER,
				openingHours: [{ days: [], opens: '', closes: '' }]
			}).warnings
		).toEqual([])
	})
})

describe('buildLocalBusinessSchema', () => {
	test('minimal input produces a valid LocalBusiness object', () => {
		expect(buildLocalBusinessSchema({ name: 'Acme Co' })).toEqual({
			'@context': 'https://schema.org',
			'@type': 'LocalBusiness',
			name: 'Acme Co'
		})
	})

	test('honors the @type subtype', () => {
		const out = buildLocalBusinessSchema({
			name: 'Joe Law',
			type: 'LegalService'
		})
		expect(out['@type']).toBe('LegalService')
	})

	test('omits every blank/whitespace field', () => {
		const out = buildLocalBusinessSchema({
			name: 'Acme',
			description: '   ',
			url: '',
			telephone: undefined,
			email: '\t'
		})
		expect(out).toEqual({
			'@context': 'https://schema.org',
			'@type': 'LocalBusiness',
			name: 'Acme'
		})
	})

	test('trims field values', () => {
		const out = buildLocalBusinessSchema({
			name: '  Acme  ',
			telephone: '  555-1234 '
		})
		expect(out.name).toBe('Acme')
		expect(out.telephone).toBe('555-1234')
	})

	describe('address', () => {
		test('uppercases the country code', () => {
			const out = buildLocalBusinessSchema({
				name: 'Acme',
				address: { country: 'us' }
			})
			expect(out.address).toEqual({
				'@type': 'PostalAddress',
				addressCountry: 'US'
			})
		})

		test('includes PostalAddress with only the present sub-fields', () => {
			const out = buildLocalBusinessSchema({
				name: 'Acme',
				address: { city: 'Dallas', region: 'TX' }
			})
			expect(out.address).toEqual({
				'@type': 'PostalAddress',
				addressLocality: 'Dallas',
				addressRegion: 'TX'
			})
		})

		test('omits address entirely when all sub-fields are blank', () => {
			const out = buildLocalBusinessSchema({
				name: 'Acme',
				address: { street: '', city: '   ' }
			})
			expect(out.address).toBeUndefined()
		})
	})

	describe('url normalization', () => {
		test('prepends https:// to a bare domain', () => {
			expect(
				buildLocalBusinessSchema({ name: 'A', url: 'example.com' }).url
			).toBe('https://example.com')
			expect(
				buildLocalBusinessSchema({ name: 'A', url: 'www.acme.com' }).url
			).toBe('https://www.acme.com')
		})

		test('leaves an explicit scheme or protocol-relative URL untouched', () => {
			expect(
				buildLocalBusinessSchema({ name: 'A', url: 'https://x.com' }).url
			).toBe('https://x.com')
			expect(
				buildLocalBusinessSchema({ name: 'A', url: 'http://x.com' }).url
			).toBe('http://x.com')
			expect(
				buildLocalBusinessSchema({ name: 'A', url: '//cdn.x.com' }).url
			).toBe('//cdn.x.com')
		})

		test('normalizes the image field too, preserving blank omission', () => {
			expect(
				buildLocalBusinessSchema({
					name: 'A',
					image: 'cdn.example.com/logo.png'
				}).image
			).toBe('https://cdn.example.com/logo.png')
			expect(
				buildLocalBusinessSchema({ name: 'A', image: '   ' }).image
			).toBeUndefined()
		})
	})

	describe('geo', () => {
		const geoOf = (latitude: string, longitude?: string) =>
			JSON.parse(
				serializeSchema(
					buildLocalBusinessSchema({ name: 'A', geo: { latitude, longitude } })
				)
			).geo

		test('rejects JS numeric-literal forms Number() would coerce', () => {
			for (const bad of ['0x10', '1e1', '0b101', '0o17']) {
				expect(geoOf(bad, '45.00000')).toBeUndefined()
			}
		})

		test('accepts signed, decimal and whitespace-padded coordinates', () => {
			expect(geoOf('+45.50000', '-96.79000')).toEqual({
				'@type': 'GeoCoordinates',
				latitude: 45.5,
				longitude: -96.79
			})
			expect(geoOf('  32.77670  ', '-96.79700')).toEqual({
				'@type': 'GeoCoordinates',
				latitude: 32.7767,
				longitude: -96.797
			})
		})

		test('serializes coordinates exactly as entered, keeping trailing zeros', () => {
			const out = serializeSchema(
				buildLocalBusinessSchema({
					name: 'A',
					geo: { latitude: '+32.77670', longitude: '-096.79700' }
				}),
				{ pretty: false }
			)
			expect(out).toContain('"latitude":32.77670')
			expect(out).toContain('"longitude":-96.79700')
			expect(() => JSON.parse(out)).not.toThrow()
		})

		test('omits geo for comma-format / European-decimal coordinates', () => {
			expect(geoOf('32.7,96', '45.00000')).toBeUndefined()
			expect(geoOf('32,7767', '-96,797')).toBeUndefined()
		})

		test('omits geo when only one coordinate is provided', () => {
			expect(geoOf('32.77670')).toBeUndefined()
		})

		test('omits geo for non-numeric coordinates', () => {
			expect(geoOf('abc', '5.00000')).toBeUndefined()
		})

		test('omits geo for out-of-range coordinates', () => {
			expect(geoOf('120.00000', '5.00000')).toBeUndefined()
			expect(geoOf('45.00000', '200.00000')).toBeUndefined()
		})
	})

	describe('openingHours', () => {
		test('maps a valid entry to OpeningHoursSpecification', () => {
			const out = buildLocalBusinessSchema({
				name: 'Acme',
				openingHours: [
					{ days: ['Monday', 'Tuesday'], opens: '09:00', closes: '17:00' }
				]
			})
			expect(out.openingHoursSpecification).toEqual([
				{
					'@type': 'OpeningHoursSpecification',
					dayOfWeek: ['Monday', 'Tuesday'],
					opens: '09:00',
					closes: '17:00'
				}
			])
		})

		test('orders dayOfWeek by the week, not by click order', () => {
			const out = buildLocalBusinessSchema({
				name: 'Acme',
				openingHours: [
					{
						days: ['Friday', 'Monday', 'Wednesday'],
						opens: '09:00',
						closes: '17:00'
					}
				]
			})
			expect(out.openingHoursSpecification).toEqual([
				{
					'@type': 'OpeningHoursSpecification',
					dayOfWeek: ['Monday', 'Wednesday', 'Friday'],
					opens: '09:00',
					closes: '17:00'
				}
			])
		})

		test('drops entries with no days or missing times', () => {
			const out = buildLocalBusinessSchema({
				name: 'Acme',
				openingHours: [
					{ days: [], opens: '09:00', closes: '17:00' },
					{ days: ['Monday'], opens: '', closes: '17:00' }
				]
			})
			expect(out.openingHoursSpecification).toBeUndefined()
		})
	})

	describe('areaServed', () => {
		test('trims, filters blanks and de-duplicates', () => {
			const out = buildLocalBusinessSchema({
				name: 'Acme',
				areaServed: [' Dallas ', '', 'Plano', 'Dallas']
			})
			expect(out.areaServed).toEqual(['Dallas', 'Plano'])
		})
	})

	describe('sameAs', () => {
		test('prepends https:// to bare profile URLs', () => {
			const out = buildLocalBusinessSchema({
				name: 'Acme',
				sameAs: ['facebook.com/acme', 'https://x.com/acme']
			})
			expect(out.sameAs).toEqual([
				'https://facebook.com/acme',
				'https://x.com/acme'
			])
		})

		test('filters blanks and de-duplicates', () => {
			const out = buildLocalBusinessSchema({
				name: 'Acme',
				sameAs: [
					'https://x.com/acme',
					'  ',
					'https://x.com/acme',
					'https://fb.com/acme'
				]
			})
			expect(out.sameAs).toEqual(['https://x.com/acme', 'https://fb.com/acme'])
		})

		test('omits sameAs when empty', () => {
			expect(
				buildLocalBusinessSchema({ name: 'Acme', sameAs: ['', '  '] }).sameAs
			).toBeUndefined()
		})
	})
})

describe('serializeSchema', () => {
	const base: LocalBusinessInput = { name: 'Acme' }

	test('pretty by default (2-space indent)', () => {
		const out = serializeSchema(buildLocalBusinessSchema(base))
		expect(out).toContain('\n  "@context"')
	})

	test('compact when pretty is false', () => {
		const out = serializeSchema(buildLocalBusinessSchema(base), {
			pretty: false
		})
		expect(out).not.toContain('\n')
	})

	test('wraps in a script tag when requested', () => {
		const out = serializeSchema(buildLocalBusinessSchema(base), {
			scriptTag: true
		})
		expect(out.startsWith('<script type="application/ld+json">')).toBe(true)
		expect(out.trimEnd().endsWith('</script>')).toBe(true)
	})

	// Security: a value containing </script> must NOT be able to break out
	// of the inline script block. < > & must be unicode-escaped.
	test('escapes </script> to prevent script-tag breakout (XSS)', () => {
		const schema = buildLocalBusinessSchema({
			name: '</script><script>alert(1)</script>'
		})
		const out = serializeSchema(schema, { scriptTag: true })
		// The raw closing tag must not appear except the legitimate wrapper.
		expect(out.match(/<\/script>/g)?.length).toBe(1)
		expect(out).toContain('\\u003c/script\\u003e')
		expect(out).not.toContain('<script>alert')
	})

	test('escapes ampersand and angle brackets', () => {
		const out = serializeSchema(
			buildLocalBusinessSchema({ name: 'Tom & Jerry < >' })
		)
		expect(out).toContain('\\u0026')
		expect(out).toContain('\\u003c')
		expect(out).toContain('\\u003e')
		expect(out).not.toContain('Tom & Jerry')
	})

	test('escapes U+2028 / U+2029 line separators', () => {
		const ls = String.fromCharCode(0x2028)
		const out = serializeSchema(buildLocalBusinessSchema({ name: `a${ls}b` }))
		expect(out).toContain('\\u2028')
	})

	test('round-trips to valid JSON after escaping', () => {
		const schema = buildLocalBusinessSchema({
			name: 'Tom & Jerry </script>',
			description: 'a < b > c'
		})
		const out = serializeSchema(schema)
		// Escaped output must still parse as JSON and recover the original values.
		expect(JSON.parse(out)).toEqual(schema)
	})
})
