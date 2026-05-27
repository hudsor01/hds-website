/**
 * Phase 10 cursor + LIKE-escape codec.
 *
 * encodeCursor/decodeCursor must round-trip the (direction, parts) tuple
 * exactly. decodeCursor must return null on any malformed input so the
 * caller can fall back to page 1 instead of crashing the list. escape
 * must protect % / _ / \ from being interpreted as SQL LIKE wildcards.
 */
import { describe, expect, it } from 'bun:test'
import {
	buildPaginationHref,
	decodeCursor,
	encodeCursor,
	escapeLikePattern,
	PAGE_SIZE
} from '@/lib/admin/list-cursor'

describe('list-cursor: PAGE_SIZE', () => {
	it('is exactly 25', () => {
		expect(PAGE_SIZE).toBe(25)
	})
})

describe('list-cursor: encode + decode round-trip', () => {
	it('round-trips string parts with direction "after"', () => {
		const raw = encodeCursor('after', ['2026-05-27T12:34:56.789Z', 'abc-uuid'])
		expect(raw.startsWith('after:')).toBe(true)
		expect(decodeCursor(raw)).toEqual({
			direction: 'after',
			parts: ['2026-05-27T12:34:56.789Z', 'abc-uuid']
		})
	})

	it('round-trips with direction "before"', () => {
		const raw = encodeCursor('before', ['x', 'y'])
		expect(decodeCursor(raw)).toEqual({
			direction: 'before',
			parts: ['x', 'y']
		})
	})

	it('stringifies numeric parts on encode', () => {
		const raw = encodeCursor('before', [42, 'id'])
		expect(decodeCursor(raw)).toEqual({
			direction: 'before',
			parts: ['42', 'id']
		})
	})

	it('encodes Date parts as ISO strings', () => {
		const d = new Date('2026-05-27T12:34:56.789Z')
		const raw = encodeCursor('after', [d, 'abc'])
		expect(decodeCursor(raw)).toEqual({
			direction: 'after',
			parts: ['2026-05-27T12:34:56.789Z', 'abc']
		})
	})
})

describe('list-cursor: decodeCursor malformed input', () => {
	it('returns null for undefined', () => {
		expect(decodeCursor(undefined)).toBeNull()
	})

	it('returns null for empty string', () => {
		expect(decodeCursor('')).toBeNull()
	})

	it('returns null when payload is empty', () => {
		expect(decodeCursor('after:')).toBeNull()
	})

	it('returns null for bad direction prefix', () => {
		expect(decodeCursor('sideways:abc')).toBeNull()
	})

	it('returns null when base64url decode fails', () => {
		expect(decodeCursor('after:not-base64!!!')).toBeNull()
	})

	it('returns null when no direction separator is present', () => {
		expect(decodeCursor('after-no-colon')).toBeNull()
	})
})

describe('list-cursor: escapeLikePattern', () => {
	it('passes plain text through unchanged', () => {
		expect(escapeLikePattern('foo')).toBe('foo')
	})

	it('escapes %', () => {
		expect(escapeLikePattern('50%')).toBe('50\\%')
	})

	it('escapes _', () => {
		expect(escapeLikePattern('a_b')).toBe('a\\_b')
	})

	it('escapes backslash', () => {
		expect(escapeLikePattern('back\\slash')).toBe('back\\\\slash')
	})

	it('escapes a mix without double-escaping the backslash', () => {
		expect(escapeLikePattern('mix 100%_off\\')).toBe('mix 100\\%\\_off\\\\')
	})
})

describe('list-cursor: buildPaginationHref', () => {
	it('builds a baseHref + cursor query string with no preserved params', () => {
		expect(buildPaginationHref('/admin/leads', 'after:abc')).toBe(
			'/admin/leads?cursor=after%3Aabc'
		)
	})

	it('appends preserved params after the cursor', () => {
		const href = buildPaginationHref('/admin/leads', 'after:xyz', {
			q: 'hello world',
			status: 'new'
		})
		expect(href.startsWith('/admin/leads?')).toBe(true)
		expect(href.includes('cursor=after%3Axyz')).toBe(true)
		expect(href.includes('status=new')).toBe(true)
		expect(
			href.includes('q=hello+world') || href.includes('q=hello%20world')
		).toBe(true)
	})

	it('omits preserved params whose value is the empty string', () => {
		const href = buildPaginationHref('/admin/leads', 'after:xyz', {
			status: '',
			q: 'hello'
		})
		expect(href.includes('status=')).toBe(false)
		expect(href.includes('q=hello')).toBe(true)
	})

	it('URL-encodes special characters in the cursor value', () => {
		const href = buildPaginationHref('/admin/leads', 'after:a/b+c=d')
		// `/`, `+`, `=` must all be percent-encoded so the receiving server
		// reads them as part of the cursor value, not as URL structure.
		expect(href.includes('cursor=after%3Aa%2Fb%2Bc%3Dd')).toBe(true)
	})
})
