/**
 * One type scale and one heading API (H5, H6, M7).
 *
 *   - globals.css has a single scale: Tailwind's --text-* steps plus the
 *     role steps (--text-page-title, --text-h1 .. --text-h4, --text-lead,
 *     --text-prose, --text-prose-lead), each owning its line-height. The old
 *     parallel --font-size-* / --line-height-* families and the hand-written
 *     .text-h* component rules must not come back.
 *   - A heading class owns size, line-height, tracking and weight, so no
 *     class list pairs one with a leading-*, tracking-* or font-weight
 *     utility (a stray leading-tight made the page-title line-height dead).
 *   - No arbitrary font sizes (text-[10px]): every size is a scale step,
 *     and nothing renders under the 12px text-xs floor.
 *   - Every fluid step is clamp(min, a rem + b vw, max): the rem part makes
 *     the size follow browser zoom and the user's font size (WCAG 1.4.4),
 *     and the middle term is the line through min at a 390px viewport and
 *     max at 1280px, so the endpoints the design was drawn at hold.
 */

import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { Glob } from 'bun'
import { cn } from '@/lib/utils'

const SRC_GLOB = 'src/**/*.{ts,tsx}'
const GLOBALS_CSS = 'src/app/globals.css'
const EXCLUDE_PATHS = ['_generated/', '.next/', 'node_modules/']

const ROLE_STEPS = [
	'page-title',
	'h1',
	'h2',
	'h3',
	'h4',
	'lead',
	'prose',
	'prose-lead'
] as const

// Fluid steps and the viewports their clamp endpoints are pinned to.
const FLUID_STEPS = ['page-title', 'h1', 'h2', 'h3', 'h4', 'lead'] as const
const MIN_VIEWPORT = 390
const MAX_VIEWPORT = 1280
const ROOT_PX = 16
// clamp(2.5rem, 1.8424rem + 2.697vw, 4rem)
const FLUID_CLAMP =
	/^clamp\(\s*([\d.]+)rem\s*,\s*([\d.]+)rem\s*\+\s*([\d.]+)vw\s*,\s*([\d.]+)rem\s*\)$/

// Classes that own size, line-height, tracking and weight.
const HEADING_CLASS = /^text-(?:page-title|h[1-4]|lead|eyebrow)$/
// Utilities that would override one of those (through --tw-leading,
// --tw-tracking or --tw-font-weight). Font family (font-sans, font-mono,
// font-display) is not owned by the step and stays allowed.
const CONFLICTING_UTILITY =
	/^(?:leading-.+|tracking-.+|font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black))$/
// An arbitrary font size: text-[10px], text-[0.65rem], text-[1.2em].
const ARBITRARY_FONT_SIZE = /(?:^|[\s"'`:])(text-\[[\d.]+(?:px|rem|em)\])/g
// String literals on one line (class lists in className, cn(), cva()).
const STRING_LITERAL = /"([^"\n]*)"|'([^'\n]*)'|`([^`]*)`/g

interface Violation {
	file: string
	line: number
	match: string
}

async function sourceFiles(): Promise<[string, string][]> {
	const files: [string, string][] = []
	for await (const file of new Glob(SRC_GLOB).scan()) {
		if (EXCLUDE_PATHS.some(skip => file.includes(skip))) {
			continue
		}
		files.push([file, await readFile(file, 'utf8')])
	}
	return files
}

function lineOf(content: string, index: number): number {
	return content.slice(0, index).split('\n').length
}

function format(violations: Violation[]): string {
	return violations.map(v => `  ${v.file}:${v.line}  ${v.match}`).join('\n')
}

/** The utility without its variant chain: `md:leading-tight` -> `leading-tight`. */
function baseUtility(token: string): string {
	return token.slice(token.lastIndexOf(':') + 1)
}

/** Class-list conflicts in one string literal, as `heading + utility` pairs. */
function headingConflicts(classList: string): string[] {
	const tokens = classList.split(/\s+/).filter(Boolean)
	const headings = tokens.filter(t => HEADING_CLASS.test(baseUtility(t)))
	if (headings.length === 0) {
		return []
	}
	return tokens
		.filter(t => CONFLICTING_UTILITY.test(baseUtility(t)))
		.map(t => `${headings.join(' ')} + ${t}`)
}

describe('one type scale', () => {
	test('globals.css defines every role step with its line-height', async () => {
		const css = await readFile(GLOBALS_CSS, 'utf8')
		const missing = ROLE_STEPS.flatMap(step =>
			[`--text-${step}:`, `--text-${step}--line-height:`].filter(
				decl => !css.includes(decl)
			)
		)
		expect(missing).toEqual([])
	})

	test('no heading step is lighter than semibold', async () => {
		// A text-h4 section heading sits over text-lg font-semibold item
		// h3s (and .typography h3 reads text-h4), so a medium step made the
		// parent heading lighter than its children.
		const css = await readFile(GLOBALS_CSS, 'utf8')
		const weights = [
			...css.matchAll(/--text-(page-title|h[1-4])--font-weight:\s*([^;]+);/g)
		]
		expect(weights).toHaveLength(5)
		const light = weights
			.filter(
				m =>
					!/var\(--font-weight-(?:semibold|bold|extrabold|black)\)/.test(
						m[2] ?? ''
					)
			)
			.map(m => `--text-${m[1]}: ${m[2]}`)
		expect(light).toEqual([])
	})

	test('fluid steps scale with zoom and hit min at 390px, max at 1280px', async () => {
		const css = await readFile(GLOBALS_CSS, 'utf8')
		const failures: string[] = []
		for (const step of FLUID_STEPS) {
			const decl = css.match(new RegExp(`--text-${step}:\\s*([^;]+);`))?.[1]
			const m = decl?.trim().match(FLUID_CLAMP)
			if (!m) {
				failures.push(
					`--text-${step}: ${decl ?? '(missing)'} is not clamp(min, a rem + b vw, max)`
				)
				continue
			}
			const [min, rem, vw, max] = m.slice(1).map(v => Number(v) * ROOT_PX)
			const preferred = (width: number) =>
				(rem ?? 0) + ((vw ?? 0) / ROOT_PX) * (width / 100)
			const size = (width: number) =>
				Math.min(max ?? 0, Math.max(min ?? 0, preferred(width)))
			// On the line (within 0.01px) and clamped to the exact endpoint.
			const atMin = preferred(MIN_VIEWPORT)
			const atMax = preferred(MAX_VIEWPORT)
			if (Math.abs(atMin - (min ?? 0)) > 0.01 || size(MIN_VIEWPORT) !== min) {
				failures.push(
					`--text-${step} at ${MIN_VIEWPORT}px: ${atMin.toFixed(3)}px, want ${min}px`
				)
			}
			if (Math.abs(atMax - (max ?? 0)) > 0.01 || size(MAX_VIEWPORT) !== max) {
				failures.push(
					`--text-${step} at ${MAX_VIEWPORT}px: ${atMax.toFixed(3)}px, want ${max}px`
				)
			}
		}
		expect(failures).toEqual([])
	})

	test('globals.css has no parallel scale or hand-written heading rules', async () => {
		const css = await readFile(GLOBALS_CSS, 'utf8')
		const banned = [
			/--font-size-[a-z0-9]+\s*:/,
			/--line-height-[a-z]+\s*:/,
			/--tracking-heading\s*:/,
			/--font-weight-heading\s*:/,
			/\.text-(?:page-title|section-title|h[1-4]|lead|caption|hero-subtitle|responsive-[a-z0-9]+)\s*\{/,
			/var\(--(?:font-size|line-height)-/
		]
		const offenders: string[] = []
		css.split('\n').forEach((line, i) => {
			if (banned.some(rule => rule.test(line))) {
				offenders.push(`  ${GLOBALS_CSS}:${i + 1}  ${line.trim()}`)
			}
		})
		if (offenders.length > 0) {
			throw new Error(
				`globals.css re-adds a parallel type scale (use the --text-* steps):\n${offenders.join('\n')}`
			)
		}
		expect(offenders).toEqual([])
	})
})

describe('one heading API', () => {
	describe('headingConflicts()', () => {
		test('flags leading, tracking and weight next to a heading class', () => {
			expect(
				headingConflicts('text-page-title text-foreground leading-tight')
			).toEqual(['text-page-title + leading-tight'])
			expect(headingConflicts('text-h3 md:tracking-wide')).toEqual([
				'text-h3 + md:tracking-wide'
			])
			expect(headingConflicts('text-eyebrow font-bold')).toEqual([
				'text-eyebrow + font-bold'
			])
		})

		test('allows layout, colour and family utilities', () => {
			expect(
				headingConflicts('mb-3 text-h4 font-display text-foreground')
			).toEqual([])
			expect(headingConflicts('text-lg font-semibold leading-none')).toEqual([])
		})
	})

	test('no heading class is paired with leading, tracking or weight', async () => {
		const violations: Violation[] = []
		for (const [file, content] of await sourceFiles()) {
			for (const m of content.matchAll(STRING_LITERAL)) {
				const literal = m[1] ?? m[2] ?? m[3] ?? ''
				for (const conflict of headingConflicts(literal)) {
					violations.push({
						file,
						line: lineOf(content, m.index ?? 0),
						match: conflict
					})
				}
			}
		}
		if (violations.length > 0) {
			throw new Error(
				`A heading class owns line-height, tracking and weight; drop the utility:\n${format(violations)}`
			)
		}
		expect(violations).toEqual([])
	})

	test('no arbitrary font sizes (use a --text-* step, 12px minimum)', async () => {
		const violations: Violation[] = []
		for (const [file, content] of await sourceFiles()) {
			for (const m of content.matchAll(ARBITRARY_FONT_SIZE)) {
				violations.push({
					file,
					line: lineOf(content, m.index ?? 0),
					// biome-ignore lint/style/noNonNullAssertion: group 1 is structural
					match: m[1]!
				})
			}
		}
		if (violations.length > 0) {
			throw new Error(`Arbitrary font sizes in src/:\n${format(violations)}`)
		}
		expect(violations).toEqual([])
	})

	test('cn() keeps heading classes next to a text colour', () => {
		expect(cn('text-h4 text-foreground')).toBe('text-h4 text-foreground')
		expect(cn('text-page-title', 'text-muted-foreground')).toBe(
			'text-page-title text-muted-foreground'
		)
		expect(cn('text-eyebrow text-accent-text')).toBe(
			'text-eyebrow text-accent-text'
		)
	})

	test('cn() treats heading classes as font sizes', () => {
		expect(cn('text-h1', 'text-sm')).toBe('text-sm')
		expect(cn('text-lg font-semibold', 'text-h4')).toBe('font-semibold text-h4')
	})
})
