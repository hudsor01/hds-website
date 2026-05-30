/**
 * LocalBusiness JSON-LD generator — contract + security.
 * Locks src/lib/schema-generator.ts.
 */

import { describe, expect, test } from 'bun:test'
import {
	buildLocalBusinessSchema,
	type LocalBusinessInput,
	serializeSchema
} from '@/lib/schema-generator'

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
			expect(buildLocalBusinessSchema({ name: 'A', url: 'example.com' }).url).toBe(
				'https://example.com'
			)
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
		test('rejects JS numeric-literal forms Number() would coerce', () => {
			for (const bad of ['0x10', '1e1', '0b101', '0o17']) {
				expect(
					buildLocalBusinessSchema({
						name: 'A',
						geo: { latitude: bad, longitude: '45' }
					}).geo
				).toBeUndefined()
			}
		})

		test('still accepts signed, decimal, and whitespace-padded coordinates', () => {
			expect(
				buildLocalBusinessSchema({
					name: 'A',
					geo: { latitude: '+45.5', longitude: '-96.79' }
				}).geo
			).toEqual({ '@type': 'GeoCoordinates', latitude: 45.5, longitude: -96.79 })
			expect(
				buildLocalBusinessSchema({
					name: 'A',
					geo: { latitude: '  32.7767  ', longitude: '-96.797' }
				}).geo
			).toEqual({
				'@type': 'GeoCoordinates',
				latitude: 32.7767,
				longitude: -96.797
			})
		})

		test('omits geo for comma-format / European-decimal coordinates', () => {
			expect(
				buildLocalBusinessSchema({
					name: 'A',
					geo: { latitude: '32.7,96', longitude: '45' }
				}).geo
			).toBeUndefined()
			expect(
				buildLocalBusinessSchema({
					name: 'A',
					geo: { latitude: '32,7767', longitude: '-96,797' }
				}).geo
			).toBeUndefined()
		})

		test('includes GeoCoordinates when both are valid', () => {
			const out = buildLocalBusinessSchema({
				name: 'Acme',
				geo: { latitude: '32.7767', longitude: '-96.797' }
			})
			expect(out.geo).toEqual({
				'@type': 'GeoCoordinates',
				latitude: 32.7767,
				longitude: -96.797
			})
		})

		test('omits geo when only one coordinate is provided', () => {
			expect(
				buildLocalBusinessSchema({ name: 'Acme', geo: { latitude: '32.7' } }).geo
			).toBeUndefined()
		})

		test('omits geo for non-numeric coordinates', () => {
			expect(
				buildLocalBusinessSchema({
					name: 'Acme',
					geo: { latitude: 'abc', longitude: '5' }
				}).geo
			).toBeUndefined()
		})

		test('omits geo for out-of-range coordinates', () => {
			expect(
				buildLocalBusinessSchema({
					name: 'Acme',
					geo: { latitude: '120', longitude: '5' }
				}).geo
			).toBeUndefined()
			expect(
				buildLocalBusinessSchema({
					name: 'Acme',
					geo: { latitude: '45', longitude: '200' }
				}).geo
			).toBeUndefined()
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

	describe('sameAs', () => {
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
		const out = serializeSchema(
			buildLocalBusinessSchema({ name: `a${ls}b` })
		)
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
