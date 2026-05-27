/**
 * Regression tests for the admin `BUILD_PLACEHOLDER_ID` contract.
 *
 * The placeholder string MUST stay byte-equal across the shared constant
 * AND every admin `[id]` page that returns it from `generateStaticParams`.
 * A drift between the two would silently break the placeholder
 * short-circuit in the loader (the `id === BUILD_PLACEHOLDER_ID` check)
 * and re-introduce the original PPR postponed-boundary "Loading..." bug.
 *
 * These tests are file-source regressions: they read each admin page as
 * text and assert (a) it imports the shared constant, (b) it does not
 * hard-code the literal string anywhere. Coupled with TypeScript, this
 * is enough to prevent the silent typo failure mode.
 */

import { describe, expect, it } from 'bun:test'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { BUILD_PLACEHOLDER_ID } from '@/lib/admin/build-placeholder'

const ADMIN_ROOT = join(process.cwd(), 'src/app/(admin)/admin')

// Files that need the BUILD_PLACEHOLDER_ID contract. Each must:
//   1. Import BUILD_PLACEHOLDER_ID from '@/lib/admin/build-placeholder'
//   2. Reference it from generateStaticParams() (not a hard-coded string)
//   3. Reference it from the loader's short-circuit check
const ADMIN_DYNAMIC_PAGES: string[] = [
	'blog/[id]/edit/page.tsx',
	'showcase/[id]/edit/page.tsx',
	'testimonials/[id]/edit/page.tsx',
	'leads/[id]/page.tsx',
	'leads/calculator/[id]/page.tsx',
	'emails/[id]/page.tsx',
	'newsletter/[id]/page.tsx'
]

describe('BUILD_PLACEHOLDER_ID', () => {
	it('exports the expected literal value', () => {
		expect(BUILD_PLACEHOLDER_ID).toBe('__build_placeholder__')
	})

	it.each(
		ADMIN_DYNAMIC_PAGES
	)('%s imports BUILD_PLACEHOLDER_ID from the shared module', relPath => {
		const source = readFileSync(join(ADMIN_ROOT, relPath), 'utf8')
		expect(source).toContain(
			"import { BUILD_PLACEHOLDER_ID } from '@/lib/admin/build-placeholder'"
		)
	})

	it.each(
		ADMIN_DYNAMIC_PAGES
	)('%s does not hard-code the placeholder string literal', relPath => {
		const source = readFileSync(join(ADMIN_ROOT, relPath), 'utf8')
		// The literal MUST only appear in the shared constant module.
		// Any direct occurrence in a page file means the import was
		// bypassed and the short-circuit could drift silently.
		expect(source).not.toContain("'__build_placeholder__'")
		expect(source).not.toContain('"__build_placeholder__"')
	})

	it.each(
		ADMIN_DYNAMIC_PAGES
	)('%s short-circuits to notFound() before connection() in its loader', relPath => {
		// Strip JSDoc + line comments so we only check actual code.
		// Without this, an `await connection()` mention in the file
		// header docstring would match first and the test would
		// spuriously fail.
		const source = readFileSync(join(ADMIN_ROOT, relPath), 'utf8')
			.replace(/\/\*[\s\S]*?\*\//g, '')
			.replace(/^\s*\/\/.*$/gm, '')
		const notFoundIdx = source.indexOf('if (id === BUILD_PLACEHOLDER_ID) {')
		const connectionIdx = source.indexOf('await connection()')
		expect(notFoundIdx).toBeGreaterThan(-1)
		expect(connectionIdx).toBeGreaterThan(-1)
		expect(notFoundIdx).toBeLessThan(connectionIdx)
	})

	it('covers every admin [id] page (no new dynamic route slipped through)', () => {
		// Walk the admin tree; collect every leaf `page.tsx` that lives
		// inside a [param] segment. Compare to ADMIN_DYNAMIC_PAGES so a
		// future new dynamic route forces the author to update this test.
		function walk(dir: string, rel = ''): string[] {
			const out: string[] = []
			for (const entry of readdirSync(dir, { withFileTypes: true })) {
				const relChild = rel ? `${rel}/${entry.name}` : entry.name
				if (entry.isDirectory()) {
					out.push(...walk(join(dir, entry.name), relChild))
				} else if (entry.name === 'page.tsx' && rel.includes('[')) {
					out.push(relChild)
				}
			}
			return out
		}
		const found = walk(ADMIN_ROOT).sort()
		const expected = ADMIN_DYNAMIC_PAGES.slice().sort()
		expect(found).toEqual(expected)
	})
})
