/**
 * CSS class hygiene — guards against silently-broken Tailwind utilities.
 *
 * Tailwind v4 silently drops class names that don't match a registered
 * token (e.g. `text-destructive-texter` falls through to inherited
 * color with no compile error). These tests catch the typo / non-existent
 * token patterns that have historically slipped past review:
 *
 *   - `*-texter` (typo for `*-text`) — saw 6 instances in PR #183
 *   - `(hover|focus|active):*-dark` outside the legitimate
 *     `grid-pattern-dark` utility — `--color-*-dark` tokens were
 *     removed in PR #183 since they were never consumed
 *
 * If you legitimately need a new pattern that matches one of these
 * regexes, prefer renaming the new utility OR add an explicit allowlist
 * entry below with the rationale.
 */

import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { Glob } from 'bun'

const SRC_GLOB = 'src/**/*.{ts,tsx,css}'
const EXCLUDE_PATHS = [
	'_generated/', // brand.ts is regenerated from globals.css
	'.next/',
	'node_modules/'
]

interface Violation {
	file: string
	line: number
	content: string
}

async function findViolations(pattern: RegExp): Promise<Violation[]> {
	const violations: Violation[] = []
	const glob = new Glob(SRC_GLOB)
	for await (const file of glob.scan()) {
		if (EXCLUDE_PATHS.some(skip => file.includes(skip))) {
			continue
		}
		const content = await readFile(file, 'utf8')
		const lines = content.split('\n')
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i]
			if (line && pattern.test(line)) {
				violations.push({
					file,
					line: i + 1,
					content: line.trim()
				})
			}
		}
	}
	return violations
}

describe('CSS class hygiene', () => {
	test('no `-texter` suffix typos (intended: `-text`)', async () => {
		const violations = await findViolations(/\b[a-z]+-texter\b/)
		if (violations.length > 0) {
			const detail = violations
				.map(v => `  ${v.file}:${v.line}  ${v.content}`)
				.join('\n')
			throw new Error(
				`Found ${violations.length} occurrence(s) of "-texter" typo. ` +
					`The intended token suffix is "-text" (see --color-*-text in ` +
					`src/app/globals.css). Tailwind silently no-ops the malformed ` +
					`class.\n${detail}`
			)
		}
		expect(violations).toEqual([])
	})

	test('no broken `:*-dark` variants outside `grid-pattern-dark`', async () => {
		// The 24 `--color-*-dark` tokens were removed in PR #183 (never
		// consumed). The ONLY legitimate `*-dark` utility in this project is
		// `grid-pattern-dark` (a custom @utility in globals.css for the dark
		// grid background pattern). Anything else is a stale reference.
		const violations = await findViolations(
			/\b(?:hover|focus|active|dark|sm|md|lg|xl|2xl):[a-z-]+-dark\b/
		)
		const filtered = violations.filter(
			v => !/grid-pattern-dark/.test(v.content)
		)
		if (filtered.length > 0) {
			const detail = filtered
				.map(v => `  ${v.file}:${v.line}  ${v.content}`)
				.join('\n')
			throw new Error(
				`Found ${filtered.length} occurrence(s) of broken \`:*-dark\` ` +
					`variant. The --color-*-dark tokens were removed in PR #183 — use ` +
					`the unsuffixed token (the .dark class redefines it for dark mode) ` +
					`or alpha-mix darkening (e.g. /80) instead.\n${detail}`
			)
		}
		expect(filtered).toEqual([])
	})
})
