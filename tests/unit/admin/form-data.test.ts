/**
 * Unit tests for `formDataToObject`, the FormData flattener used by every
 * admin Server Action before calling Zod safeParse.
 *
 * Contract:
 *  - Single-occurrence keys become a string value.
 *  - Repeated keys (e.g. a multi-select for tags) become a string array in
 *    insertion order.
 *  - Empty FormData becomes the empty object `{}`.
 *  - Non-string values (admin forms never upload files per D-04, but the
 *    helper must not crash) are stringified via `String(value)`.
 */
import { describe, expect, it } from 'bun:test'
import { formDataToObject } from '@/lib/admin/form-data'

describe('formDataToObject', () => {
	it('flattens a single-occurrence string field into a string value', () => {
		const fd = new FormData()
		fd.append('title', 'Hello World')
		expect(formDataToObject(fd)).toEqual({ title: 'Hello World' })
	})

	it('returns an empty object for empty FormData', () => {
		expect(formDataToObject(new FormData())).toEqual({})
	})

	it('collects repeated keys into a string array preserving order', () => {
		const fd = new FormData()
		fd.append('tagIds', 'tag-a')
		fd.append('tagIds', 'tag-b')
		fd.append('tagIds', 'tag-c')
		expect(formDataToObject(fd)).toEqual({
			tagIds: ['tag-a', 'tag-b', 'tag-c']
		})
	})

	it('mixes single and multi keys in one object', () => {
		const fd = new FormData()
		fd.append('title', 'Post')
		fd.append('tagIds', 'tag-a')
		fd.append('tagIds', 'tag-b')
		fd.append('published', 'true')
		expect(formDataToObject(fd)).toEqual({
			title: 'Post',
			tagIds: ['tag-a', 'tag-b'],
			published: 'true'
		})
	})

	it('stringifies non-string values via String()', () => {
		const fd = new FormData()
		const file = new File(['hello'], 'note.txt', { type: 'text/plain' })
		fd.append('attachment', file)
		const out = formDataToObject(fd)
		expect(typeof out.attachment).toBe('string')
	})
})
