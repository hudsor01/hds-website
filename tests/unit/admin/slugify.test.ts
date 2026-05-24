/**
 * Unit tests for the pure slugify helper used by admin forms.
 *
 * Goal: turn arbitrary title input into a URL-safe slug that matches the
 * existing public slug regex `^[a-z0-9]+(?:-[a-z0-9]+)*$` (see
 * `src/lib/schemas/blog-api.ts`). All input characters outside [a-z0-9]
 * collapse into a single dash; leading and trailing dashes are stripped.
 * Pure function, no DB call, no async.
 */
import { describe, expect, it } from 'bun:test'
import { slugify } from '@/lib/admin/slugify'

describe('slugify', () => {
	it('lowercases and replaces a single space with a single dash', () => {
		expect(slugify('Hello World')).toBe('hello-world')
	})

	it('drops punctuation and collapses runs of non-alphanumeric chars', () => {
		expect(slugify('Hello, World!')).toBe('hello-world')
	})

	it('strips combining diacritics via NFKD normalization', () => {
		expect(slugify('Cafe & Te'.normalize('NFC'))).toBe('cafe-te')
		expect(slugify('Café & Té')).toBe('cafe-te')
	})

	it('trims leading and trailing dash runs', () => {
		expect(slugify('  --A  B  --')).toBe('a-b')
	})

	it('returns the empty string when no alphanumeric characters survive', () => {
		expect(slugify('!!!')).toBe('')
		expect(slugify('   ')).toBe('')
		expect(slugify('')).toBe('')
	})

	it('preserves embedded hyphens that already separate alphanumeric tokens', () => {
		expect(slugify('JirahShop e-commerce')).toBe('jirahshop-e-commerce')
	})

	it('produces output that matches the existing slug regex', () => {
		const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
		const samples = [
			'Hello World',
			'Hello, World!',
			'Café & Té',
			'JirahShop e-commerce',
			'2026 Q1 Report'
		]
		for (const input of samples) {
			expect(slugify(input)).toMatch(slugRegex)
		}
	})
})
