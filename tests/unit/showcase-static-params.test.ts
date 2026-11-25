/**
 * /showcase/[slug] uses "not-found" param matching, so its build-time slug
 * list is the only set of showcase pages a deploy serves. A failed slug
 * query logs and returns [], so with a database configured an empty list
 * must fail the build rather than ship a deploy where every page 404s.
 */

import { describe, expect, test } from 'bun:test'
import {
	SHOWCASE_PLACEHOLDER_SLUG,
	showcaseStaticParams
} from '@/app/(public)/showcase/[slug]/static-params'

describe('showcaseStaticParams', () => {
	test('maps every published slug to a param', () => {
		expect(
			showcaseStaticParams(['tenantflow', 'richard-hudson-jr'], true)
		).toEqual([{ slug: 'tenantflow' }, { slug: 'richard-hudson-jr' }])
	})

	test('fails the build when a database is configured but no slugs came back', () => {
		expect(() => showcaseStaticParams([], true)).toThrow(
			/No published showcase slugs at build time/
		)
	})

	test('falls back to the placeholder only for builds with no database', () => {
		expect(showcaseStaticParams([], false)).toEqual([
			{ slug: SHOWCASE_PLACEHOLDER_SLUG }
		])
	})
})
