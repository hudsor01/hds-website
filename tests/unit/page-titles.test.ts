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

const EXCLUDED_DIRS = [
	'src/app/(public)/blog/',
	'src/app/(public)/tools/',
	'src/app/admin/'
]

// /contact is in the Phase 34 control set: no title edits until the
// 2026-12-13 measurement. Its title is 50 characters, so it is not over the
// limit; swap its suffix after that date.
const LONG_SUFFIX_ALLOWED = new Set(['src/app/(public)/contact/page.tsx'])

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
		const offenders = SITE_FILES.filter(
			file =>
				!LONG_SUFFIX_ALLOWED.has(file) &&
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
