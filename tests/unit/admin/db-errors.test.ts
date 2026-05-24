/**
 * Unit tests for `isUniqueViolation`, the Postgres unique-constraint
 * predicate used by admin Server Actions to map duplicate-slug failures
 * onto a field-level Zod-style error.
 *
 * Postgres SQLSTATE for unique_violation is `23505`. node-postgres surfaces
 * the column name inside `error.message` and/or `error.detail` (e.g.
 * `duplicate key value violates unique constraint "showcase_slug_unique"` +
 * `Key (slug)=(jirahshop)...`). The predicate matches by code AND by the
 * literal `column` substring appearing in either field.
 */
import { describe, expect, it } from 'bun:test'
import { isUniqueViolation } from '@/lib/admin/db-errors'

describe('isUniqueViolation', () => {
	it('returns true for code 23505 whose message references the column', () => {
		const err = {
			code: '23505',
			message:
				'duplicate key value violates unique constraint "showcase_slug_unique"',
			detail: 'Key (slug)=(jirahshop) already exists.'
		}
		expect(isUniqueViolation(err, 'slug')).toBe(true)
	})

	it('returns true when only the detail field references the column', () => {
		const err = {
			code: '23505',
			message: 'duplicate key value violates unique constraint',
			detail: 'Key (slug)=(jirahshop) already exists.'
		}
		expect(isUniqueViolation(err, 'slug')).toBe(true)
	})

	it('returns false when the constraint matches a different column', () => {
		const err = {
			code: '23505',
			message:
				'duplicate key value violates unique constraint "showcase_slug_unique"',
			detail: 'Key (slug)=(jirahshop) already exists.'
		}
		expect(isUniqueViolation(err, 'title')).toBe(false)
	})

	it('returns false for non-23505 Postgres errors', () => {
		const err = {
			code: '23503',
			message: 'foreign key violation involving slug'
		}
		expect(isUniqueViolation(err, 'slug')).toBe(false)
	})

	it('returns false for a plain Error instance', () => {
		expect(isUniqueViolation(new Error('boom'), 'slug')).toBe(false)
	})

	it('returns false for null, undefined, and primitives', () => {
		expect(isUniqueViolation(null, 'slug')).toBe(false)
		expect(isUniqueViolation(undefined, 'slug')).toBe(false)
		expect(isUniqueViolation('string', 'slug')).toBe(false)
		expect(isUniqueViolation(42, 'slug')).toBe(false)
	})

	it('returns false when message/detail are not strings', () => {
		const err = { code: '23505', message: 12345, detail: null }
		expect(isUniqueViolation(err, 'slug')).toBe(false)
	})
})
