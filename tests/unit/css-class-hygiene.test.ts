/**
 * CSS class hygiene — guards against silently-broken Tailwind utilities.
 *
 * Tailwind v4 silently drops class names that don't match a registered
 * token (e.g. `text-destructive-texter` falls through to inherited
 * color with no compile error). These tests catch the typo / non-existent
 * token patterns that have historically slipped past review:
 *
 *   - `*-texter` (typo for `*-text`) — saw 6 instances in PR #183
 *   - `*-dark` utilities outside the legitimate `grid-pattern-dark`
 *     custom @utility — `--color-*-dark` tokens were removed in PR #183
 *     since they were never consumed
 *
 * Implementation notes:
 *   - Uses match-level allowlisting (not line-level), so a line containing
 *     both a legitimate `grid-pattern-dark` and a buggy `hover:bg-foo-dark`
 *     correctly reports only the second.
 *   - Class-name matching anchors on whitespace, quotes, or string boundaries
 *     (the only positions Tailwind utilities appear in real source). This
 *     avoids word-boundary `\b` quirks with the `@` container-query prefix.
 *   - Variant prefix list intentionally permissive — we'd rather over-detect
 *     and require an allowlist entry than miss a future bug.
 *
 * If you legitimately need a class that matches one of these regexes, add an
 * explicit allowlist entry below with the rationale, or rename the utility.
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

// Anchor for the start of a Tailwind utility class as it appears in source:
// either string boundary, whitespace, a quote, or a backtick.
const CLASS_START = '(?:^|[\\s"\'`])'
// Anchor for the end of a Tailwind utility class.
const CLASS_END = '(?=$|[\\s"\'`])'

// Allowlist of legitimate `*-dark` matches (custom @utility classes that
// happen to share the suffix). Compared against the captured class string,
// not the surrounding line, so adjacent violations on the same line still fire.
const DARK_ALLOWLIST = new Set(['grid-pattern-dark', 'dark:grid-pattern-dark'])

/**
 * Build the regex that matches a whole Tailwind utility ending in `-${suffix}`,
 * anchored on class-string boundaries. Single source of truth so the texter and
 * dark patterns can never drift apart again (which previously caused a HIGH-
 * severity bug where the texter regex didn't accept variant-prefix `:`).
 */
function suffixPattern(suffix: string): RegExp {
	return new RegExp(
		`${CLASS_START}([a-z@][a-z0-9@:_-]*-${suffix})${CLASS_END}`,
		'g'
	)
}

interface Violation {
	file: string
	line: number
	match: string
	content: string
}

async function findMatches(pattern: RegExp): Promise<Violation[]> {
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
			if (!line) {
				continue
			}
			for (const m of line.matchAll(pattern)) {
				// Capture group 1 is structurally required by suffixPattern(),
				// so it always exists on a successful match. The non-null
				// assertion documents that invariant rather than masking it
				// with a fallback that would return a wrong-shape string.
				// biome-ignore lint/style/noNonNullAssertion: see comment
				const utility = m[1]!
				violations.push({
					file,
					line: i + 1,
					match: utility,
					content: line.trim()
				})
			}
		}
	}
	return violations
}

function formatViolations(violations: Violation[]): string {
	return violations
		.map(v => `  ${v.file}:${v.line}  ${v.match}  ←  ${v.content}`)
		.join('\n')
}

describe('CSS class hygiene', () => {
	describe('suffixPattern() regex behavior', () => {
		// Direct regex assertions so anchor / char-class regressions surface
		// without requiring a real source-file violation. These mirror the
		// shapes Tailwind utilities take in real className strings.
		const captures = (input: string, suffix: string): string[] => {
			const re = suffixPattern(suffix)
			// biome-ignore lint/style/noNonNullAssertion: capture group is required
			return [...input.matchAll(re)].map(m => m[1]!)
		}

		test('captures variant-prefixed utility (hover:text-foo-texter)', () => {
			expect(captures('hover:text-foo-texter ', 'texter')).toEqual([
				'hover:text-foo-texter'
			])
		})

		test('captures unprefixed utility wrapped in double quotes', () => {
			expect(captures('"text-foo-texter"', 'texter')).toEqual([
				'text-foo-texter'
			])
		})

		test('captures group-hover prefix (group-hover:bg-info-texter)', () => {
			expect(captures(' group-hover:bg-info-texter ', 'texter')).toEqual([
				'group-hover:bg-info-texter'
			])
		})

		test('rejects valid -text suffix (no -texter substring)', () => {
			expect(captures(' hover:bg-info-text ', 'texter')).toEqual([])
		})

		test('rejects suffix appearing in middle of token', () => {
			expect(captures(' hover:text-foo-text-extra ', 'texter')).toEqual([])
		})

		test('captures multiple violations on a single line', () => {
			expect(captures('"a-texter b-texter"', 'texter')).toEqual([
				'a-texter',
				'b-texter'
			])
		})

		test('captures `*-dark` with the dark suffix', () => {
			expect(captures(' hover:bg-foo-dark ', 'dark')).toEqual([
				'hover:bg-foo-dark'
			])
		})

		test('captures utility wrapped in backticks (template literals)', () => {
			expect(captures('`hover:text-foo-texter`', 'texter')).toEqual([
				'hover:text-foo-texter'
			])
		})

		test('captures utility at the very start of the input', () => {
			expect(captures('hover:text-foo-texter ', 'texter')).toEqual([
				'hover:text-foo-texter'
			])
		})

		test('captures utility at the very end of the input', () => {
			expect(captures(' hover:text-foo-texter', 'texter')).toEqual([
				'hover:text-foo-texter'
			])
		})
	})

	test('no `-texter` suffix typos in src/ (intended: `-text`)', async () => {
		const violations = await findMatches(suffixPattern('texter'))
		if (violations.length > 0) {
			throw new Error(
				`Found ${violations.length} occurrence(s) of "-texter" typo. ` +
					`The intended suffix is "-text" (see --color-*-text in ` +
					`src/app/globals.css). Tailwind silently no-ops the malformed ` +
					`class.\n${formatViolations(violations)}`
			)
		}
		expect(violations).toEqual([])
	})

	test('no broken `*-dark` utilities in src/ outside `grid-pattern-dark`', async () => {
		const matches = await findMatches(suffixPattern('dark'))
		const violations = matches.filter(v => !DARK_ALLOWLIST.has(v.match))
		if (violations.length > 0) {
			throw new Error(
				`Found ${violations.length} occurrence(s) of broken \`*-dark\` ` +
					`utility. The --color-*-dark tokens were removed in PR #183 — ` +
					`use the unsuffixed token (the .dark class redefines it for dark ` +
					`mode) or the purpose-built --color-*-text shade.\n` +
					`${formatViolations(violations)}`
			)
		}
		expect(violations).toEqual([])
	})
})
