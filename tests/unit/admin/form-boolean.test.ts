/**
 * Phase 08-followup form-boolean coercion.
 *
 * Regression: every admin Zod schema used `z.coerce.boolean().default(...)`
 * for the `featured` and `published` flags. `z.coerce.boolean()` wraps
 * native `Boolean(value)`, which treats any non-empty string as truthy.
 * Form serializers stringify `false` -> `"false"` on the way into
 * FormData, so the schema decoded `"false"` as `true` and the operator's
 * "save as draft" silently published the row. These tests pin the new
 * `formBoolean` against that bug PLUS the other shapes a form might
 * emit (raw boolean, checkbox `"on"`, empty unchecked surface).
 */
import { describe, expect, it } from 'bun:test'
import { z } from 'zod'
import { formBoolean } from '@/lib/admin/form-boolean'

const SCHEMA = formBoolean

describe('formBoolean', () => {
	it('parses "true" as true', () => {
		expect(SCHEMA.parse('true')).toBe(true)
	})

	it('parses "on" as true (HTML default checkbox value)', () => {
		expect(SCHEMA.parse('on')).toBe(true)
	})

	it('parses "false" as false (the bug fix)', () => {
		// THIS is the regression. z.coerce.boolean() would return true here.
		expect(SCHEMA.parse('false')).toBe(false)
	})

	it('parses "" (empty unchecked checkbox) as false', () => {
		expect(SCHEMA.parse('')).toBe(false)
	})

	it('passes raw boolean true through', () => {
		expect(SCHEMA.parse(true)).toBe(true)
	})

	it('passes raw boolean false through', () => {
		expect(SCHEMA.parse(false)).toBe(false)
	})

	it('rejects an unknown string', () => {
		const result = SCHEMA.safeParse('maybe')
		expect(result.success).toBe(false)
	})

	it('rejects a number', () => {
		const result = SCHEMA.safeParse(1)
		expect(result.success).toBe(false)
	})

	it('rejects null', () => {
		const result = SCHEMA.safeParse(null)
		expect(result.success).toBe(false)
	})

	it('rejects undefined when no default is applied', () => {
		const result = SCHEMA.safeParse(undefined)
		expect(result.success).toBe(false)
	})

	it('honors a downstream .default(false) when undefined is passed', () => {
		const withDefault = z.object({ published: formBoolean.default(false) })
		expect(withDefault.parse({}).published).toBe(false)
		expect(withDefault.parse({ published: 'false' }).published).toBe(false)
		expect(withDefault.parse({ published: 'true' }).published).toBe(true)
	})

	it('honors a downstream .default(true)', () => {
		const withDefault = z.object({ published: formBoolean.default(true) })
		expect(withDefault.parse({}).published).toBe(true)
		expect(withDefault.parse({ published: 'false' }).published).toBe(false)
	})
})
