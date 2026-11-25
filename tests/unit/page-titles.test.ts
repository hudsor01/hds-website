/**
 * Page titles use the short " | Hudson Digital" brand suffix so the full
 * <title> fits in 60 characters (QA-09). There is no title template, so
 * every page writes its own suffix; this scan keeps the long
 * " | Hudson Digital Solutions" / " - Hudson Digital Solutions" suffix from
 * creeping back in and catches a doubled brand.
 *
 * Scope: site pages under src/app. Blog and tool pages are covered by their
 * own title tests; admin pages are noindex and out of scope.
 */

import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { Glob } from 'bun'
import { getAllCategorySlugs, getCategoryBySlug } from '@/lib/help-articles'
import { LOCATIONS } from '@/lib/locations'
import {
	BRAND_SUFFIX,
	MAX_TITLE_LENGTH,
	qualifiedTitle
} from '@/lib/seo-config'

const EXCLUDED_DIRS = [
	'src/app/(public)/blog/',
	'src/app/(public)/tools/',
	'src/app/admin/'
]

const LONG_SUFFIX = /[-|] Hudson Digital Solutions['`]/
const TITLE_LITERAL = /\btitle:\s*'([^']*Hudson Digital[^']*)'/g

const SITE_FILES = [...new Glob('src/app/**/*.{ts,tsx}').scanSync('.')]
	.filter(file => !EXCLUDED_DIRS.some(dir => file.startsWith(dir)))
	.sort()

describe('site page titles', () => {
	test('scan finds the site pages', () => {
		expect(SITE_FILES).toContain('src/app/(public)/showcase/page.tsx')
		expect(SITE_FILES).toContain('src/app/(public)/faq/page.tsx')
	})

	test('no page uses the long brand suffix', () => {
		const offenders = SITE_FILES.filter(file =>
			LONG_SUFFIX.test(readFileSync(file, 'utf8'))
		)
		expect(offenders).toEqual([])
	})

	test('literal titles name the brand once and fit in 60 characters', () => {
		const problems: string[] = []
		for (const file of SITE_FILES) {
			for (const [, title] of readFileSync(file, 'utf8').matchAll(
				TITLE_LITERAL
			)) {
				if (!title) {
					continue
				}
				if (title.split('Hudson Digital').length > 2) {
					problems.push(`${file}: brand twice in "${title}"`)
				}
				if (title.length > 60) {
					problems.push(`${file}: ${title.length} chars "${title}"`)
				}
			}
		}
		expect(problems).toEqual([])
	})
})

// Titles built from data are invisible to the literal scan above. The pages
// are not imported here (other suites mock next/navigation partially and
// bun's module mocks are process-wide), so this builds each title from the
// same data the page uses. DB-backed titles (showcase items, help articles)
// go through qualifiedTitle, which drops the qualifier past 60 characters.
describe('data-driven page titles', () => {
	test('every location title fits in 60 characters', () => {
		// Same string as generateMetadata in locations/[slug]/page.tsx.
		const titles = LOCATIONS.map(
			({ city, stateCode }) =>
				`Website Design in ${city}, ${stateCode}${BRAND_SUFFIX}`
		)
		expect(titles.length).toBeGreaterThan(0)
		expect(titles.filter(title => title.length > MAX_TITLE_LENGTH)).toEqual([])
	})

	test('every help category title fits in 60 characters', () => {
		const titles = getAllCategorySlugs().map(slug =>
			qualifiedTitle(getCategoryBySlug(slug)?.name ?? slug, 'Help Center')
		)
		expect(titles.length).toBeGreaterThan(0)
		expect(titles.filter(title => title.length > MAX_TITLE_LENGTH)).toEqual([])
	})
})
