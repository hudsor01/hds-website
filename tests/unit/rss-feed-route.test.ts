/**
 * Tests the CDATA-escape helper used by /api/rss/feed.
 *
 * Tests the helper directly rather than the route handler so we don't
 * have to `mock.module('@/lib/blog', ...)` — that would leak into other
 * test files (bun:test module mocks are process-wide).
 */

import { describe, expect, test } from 'bun:test'
import { escapeCdata } from '@/lib/xml-escape'

describe('escapeCdata', () => {
	test('passes plain text through unchanged', () => {
		expect(escapeCdata('Normal title')).toBe('Normal title')
		expect(escapeCdata('')).toBe('')
	})

	test('splits a single ]]> into two adjacent CDATA sections', () => {
		expect(escapeCdata('Title with ]]> sequence')).toBe(
			'Title with ]]]]><![CDATA[> sequence'
		)
	})

	test('splits multiple ]]> occurrences', () => {
		expect(escapeCdata('first ]]> middle ]]> last')).toBe(
			'first ]]]]><![CDATA[> middle ]]]]><![CDATA[> last'
		)
	})

	test('does not touch lone ] or ]] sequences', () => {
		expect(escapeCdata('array[0] is ]] not ]]> here ] either')).toBe(
			'array[0] is ]] not ]]]]><![CDATA[> here ] either'
		)
	})

	test('produces a payload that, when wrapped, parses as the original text', () => {
		// The whole point: wrapped output must contain the original chars
		// once a parser reassembles the two adjacent CDATA payloads.
		const original = 'breaks: ]]> here'
		const wrapped = `<![CDATA[${escapeCdata(original)}]]>`
		// Reassemble by stripping every CDATA section delimiter pair.
		// `<![CDATA[X]]><![CDATA[Y]]>` → `XY`.
		const reassembled = wrapped.replace(/]]><!\[CDATA\[/g, '')
		expect(reassembled).toBe(`<![CDATA[${original}]]>`)
	})

	test('the escaped form contains no orphan ]]> outside CDATA delimiters', () => {
		// Strip every well-formed CDATA wrapper, then assert no ]]> remains
		// in the textual payload — that would mean we let one through.
		const wrapped = `<![CDATA[${escapeCdata('a ]]> b ]]> c')}]]>`
		const stripped = wrapped.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '')
		expect(stripped).toBe('')
	})
})
