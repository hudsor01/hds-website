/**
 * Contrast and form-field guards (39.2 H3, H4).
 *
 * Token pairs: the light palette in src/app/globals.css must keep every
 * text pair at WCAG 1.4.3 AA (4.5:1) and the field boundary at WCAG 1.4.11
 * (3:1). Ratios use the repo's own oklch -> sRGB conversion
 * (scripts/generate-brand-tokens.ts), the same values brand.ts ships.
 *
 * Colour utilities that must never colour text:
 *   - `--color-accent` is 2.49:1 on background, under even the 3:1 large
 *     text floor. Accent-coloured text uses `text-accent-text` (6.03:1);
 *     `text-accent` stays on fills, borders and decorative icons.
 *   - `--color-warning` is 1.81:1. Warning text uses `text-warning-text`.
 *
 * Selected-state indicators (WCAG 1.4.11, 3:1 against adjacent colours):
 * the border, ring or outline that marks a selected or current item (tab
 * underline, chip edge, table-of-contents bar, picked card) uses
 * `accent-text`, never the bright `accent` (2.49:1 on background, 2.27:1
 * next to an `accent/10` tint). A selected branch of a ternary
 * (`selected ? '...' : '...'`) with a bare `border-accent`, `ring-accent`
 * or `outline-accent` is a violation unless the same literal is a solid
 * `bg-accent` fill (the border is then the fill's own edge). Fills and
 * decorative accents keep `accent`.
 * Checks:
 *   1. a state variant (`hover:`, `group-hover:`, `focus:` ...) on
 *      `text-accent` only ever recolours text, so it is always a violation;
 *   2. `text-warning` (base token, any variant or opacity) is never text;
 *   3. a text-bearing JSX element (p, span, div, h1-h6, a, Link, strong,
 *      dd, li, label, button ...) whose static className holds
 *      `text-accent` or `text-accent/N` is a violation unless the element
 *      is `aria-hidden="true"` (a decorative ordinal or icon chip).
 *      Lucide icons are PascalCase components and inline `<svg>` is not
 *      in the tag list, so decorative icons keep `text-accent`.
 *
 * Form fields: every native text `<input>`, `<select>` and `<textarea>`
 * outside the ui primitives uses the shared `.field` class (directly or
 * through a same-file class constant), and every native checkbox uses
 * `accent-primary`. The primitives themselves are covered by
 * components.test.tsx.
 */

import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { Glob } from 'bun'
import { oklchToHex } from '../../scripts/generate-brand-tokens'

const GLOBALS_CSS = 'src/app/globals.css'
const SRC_GLOB = 'src/**/*.{ts,tsx}'
const TSX_GLOB = 'src/**/*.tsx'
const EXCLUDE_PATHS = ['_generated/']
const PRIMITIVES_DIR = 'src/components/ui/'
const BUTTON_VARIANTS = 'src/components/ui/button-variants.ts'

const CLASS_START = '(?:^|[\\s"\'`{])'
const CLASS_END = '(?=$|[\\s"\'`}])'
const VARIANTS = '(?:[a-z0-9@_\\[\\]=&>*.-]+:)*'

const ACCENT_STATE_TEXT = new RegExp(
	`${CLASS_START}(${VARIANTS}(?:hover|group-hover|peer-hover|focus|focus-visible|focus-within|active):${VARIANTS}text-accent(?:/\\d+)?)${CLASS_END}`,
	'g'
)
const WARNING_TEXT = new RegExp(
	`${CLASS_START}(${VARIANTS}text-warning(?:/\\d+)?)${CLASS_END}`,
	'g'
)
const ACCENT_TOKEN = new RegExp(
	`${CLASS_START}(text-accent(?:/\\d+)?)${CLASS_END}`
)
// The selected branch of a ternary: `? '...'` (any quote style).
const STATE_BRANCH = /\?\s*(["'`])([^"'`\n]*)\1/g
// The bright accent as a border, ring or outline colour, no opacity.
const BRIGHT_INDICATOR = new RegExp(
	`${CLASS_START}((?:border(?:-[lrtbxyse])?|ring|outline)-accent)${CLASS_END}`
)
const SOLID_ACCENT_FILL = new RegExp(`${CLASS_START}bg-accent${CLASS_END}`)

const TEXT_TAGS = new Set([
	'a',
	'b',
	'button',
	'dd',
	'div',
	'dt',
	'em',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'label',
	'li',
	'Link',
	'p',
	'span',
	'strong',
	'td',
	'th'
])
// An opening JSX tag: quoted strings and arrow functions may contain `>`.
const OPENING_TAG = /<([A-Za-z][\w.]*)\b((?:"[^"]*"|=>|[^>"])*)>/g
const STATIC_CLASS = /className="([^"]*)"/
const FIELD_TOKEN = /(?:^|[\s"'`])field(?=$|[\s"'`])/
const NON_TEXT_INPUT_TYPES = new Set(['hidden', 'checkbox', 'radio', 'file'])
const CLASS_CONSTANT = /^(?:[A-Z][A-Z0-9_]+|[a-z]\w*(?:Class|Classes|Cls))$/

// [foreground token, background token, minimum ratio]
const TOKEN_PAIRS: [string, string, number][] = [
	['accent-text', 'background', 4.5],
	['accent-text', 'card', 4.5],
	['accent-text', 'muted', 4.5],
	['warning-text', 'background', 4.5],
	['info-text', 'background', 4.5],
	['success-text', 'background', 4.5],
	['success-foreground', 'success', 4.5],
	['destructive-foreground', 'destructive', 4.5],
	['primary-foreground', 'primary', 4.5],
	['input', 'background', 3],
	['input', 'card', 3],
	['input', 'muted', 3]
]

interface Violation {
	file: string
	line: number
	match: string
}

async function sourceFiles(pattern: string): Promise<[string, string][]> {
	const files: [string, string][] = []
	for await (const file of new Glob(pattern).scan()) {
		if (EXCLUDE_PATHS.some(skip => file.includes(skip))) {
			continue
		}
		files.push([file, blankComments(await readFile(file, 'utf8'))])
	}
	return files
}

async function findUtility(pattern: RegExp): Promise<Violation[]> {
	const violations: Violation[] = []
	for (const [file, content] of await sourceFiles(SRC_GLOB)) {
		content.split('\n').forEach((line, i) => {
			for (const m of line.matchAll(pattern)) {
				// biome-ignore lint/style/noNonNullAssertion: group 1 is structural
				violations.push({ file, line: i + 1, match: m[1]! })
			}
		})
	}
	return violations
}

/**
 * Blank block comments and whole-line `//` comments (keeping newlines, so
 * line numbers hold) so prose such as "the file <input" is never scanned.
 */
function blankComments(content: string): string {
	return content.replace(/\/\*[\s\S]*?\*\/|^[ \t]*\/\/[^\n]*/gm, comment =>
		comment.replace(/[^\n]/g, ' ')
	)
}

function lineOf(content: string, index: number): number {
	return content.slice(0, index).split('\n').length
}

function format(violations: Violation[]): string {
	return violations.map(v => `  ${v.file}:${v.line}  ${v.match}`).join('\n')
}

function luminance(hex: string): number {
	const channel = (i: number) => {
		const v = Number.parseInt(hex.slice(i, i + 2), 16) / 255
		return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
	}
	return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5)
}

/** `top` at `alpha` over the opaque `under`, composited in sRGB. */
function blend(top: string, under: string, alpha: number): string {
	const channel = (hex: string, i: number) =>
		Number.parseInt(hex.slice(i, i + 2), 16)
	let out = '#'
	for (const i of [1, 3, 5]) {
		const v = Math.round(
			channel(top, i) * alpha + channel(under, i) * (1 - alpha)
		)
		out += v.toString(16).padStart(2, '0')
	}
	return out
}

function contrast(a: string, b: string): number {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
	return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05)
}

/** Light `--color-*` tokens in globals.css as hex, keyed by name. */
async function themeColors(): Promise<Map<string, string>> {
	const css = await readFile(GLOBALS_CSS, 'utf8')
	const colors = new Map<string, string>()
	for (const m of css.matchAll(
		/--color-([a-z-]+):\s*oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)\s*;/g
	)) {
		const [, name, l, c, h] = m
		if (name && !colors.has(name)) {
			colors.set(name, oklchToHex({ l: Number(l), c: Number(c), h: Number(h) }))
		}
	}
	return colors
}

/**
 * The `className={...}` or `className="..."` source text of a JSX tag's
 * attributes, braces balanced. Null when the tag has no className.
 */
function classNameExpr(attrs: string): string | null {
	const start = attrs.search(/\bclassName=/)
	if (start === -1) {
		return null
	}
	let i = start + 'className='.length
	if (attrs[i] === '"') {
		return attrs.slice(i, attrs.indexOf('"', i + 1) + 1)
	}
	let depth = 0
	const from = i
	for (; i < attrs.length; i++) {
		if (attrs[i] === '{') {
			depth++
		} else if (attrs[i] === '}' && --depth === 0) {
			return attrs.slice(from, i + 1)
		}
	}
	return null
}

/**
 * Expand same-file `const NAME = ...` class constants used in a className
 * expression, so `className={INPUT_CLS}` and `` `${ROW_CLASS} text-right` ``
 * resolve to the literal class text.
 */
function resolveClasses(expr: string, content: string, depth = 0): string {
	if (depth > 3) {
		return expr
	}
	return expr.replace(/\b([A-Za-z_][\w]*)\b/g, (name: string) => {
		// Only class-constant names, so words inside class strings
		// (`field`, `text-right`) are never expanded.
		if (!CLASS_CONSTANT.test(name)) {
			return name
		}
		const decl = content.match(
			new RegExp(`const ${name}\\s*=\\s*([\\s\\S]*?)(?:\\n\\s*\\n|\\n(?=\\S))`)
		)
		return decl?.[1] ? resolveClasses(decl[1], content, depth + 1) : name
	})
}

describe('contrast-safe palette', () => {
	test('text and field-boundary token pairs meet WCAG AA', async () => {
		const colors = await themeColors()
		const failures: string[] = []
		for (const [fg, bg, min] of TOKEN_PAIRS) {
			const a = colors.get(fg)
			const b = colors.get(bg)
			if (!(a && b)) {
				failures.push(`--color-${fg} or --color-${bg} is not an oklch token`)
				continue
			}
			const ratio = contrast(a, b)
			if (ratio < min) {
				failures.push(
					`--color-${fg} on --color-${bg}: ${ratio.toFixed(2)} < ${min}`
				)
			}
		}
		expect(failures).toEqual([])
	})

	test('selected-state indicators reach 3:1 on every adjacent surface', async () => {
		// accent-text marks the selected tab, chip, card and TOC item. The
		// chip and card also take an accent/10 tint inside the border, so
		// the edge must clear 3:1 against the tint as well as the surface.
		const colors = await themeColors()
		const indicator = colors.get('accent-text')
		const accent = colors.get('accent')
		expect(indicator).toBeDefined()
		expect(accent).toBeDefined()
		if (!(indicator && accent)) {
			return
		}
		const failures: string[] = []
		for (const surface of ['background', 'card', 'muted']) {
			const under = colors.get(surface)
			if (!under) {
				failures.push(`--color-${surface} is not an oklch token`)
				continue
			}
			const adjacent: [string, string][] = [
				[surface, under],
				[`accent/10 on ${surface}`, blend(accent, under, 0.1)]
			]
			for (const [name, hex] of adjacent) {
				const ratio = contrast(indicator, hex)
				if (ratio < 3) {
					failures.push(`accent-text next to ${name}: ${ratio.toFixed(2)} < 3`)
				}
			}
		}
		expect(failures).toEqual([])
	})

	test('filled buttons keep 4.5:1 when hovered and pressed', async () => {
		const colors = await themeColors()
		const source = await readFile(BUTTON_VARIANTS, 'utf8')
		const failures: string[] = []
		let checked = 0
		// A variant whose label is its fill's -foreground pair, e.g.
		// 'bg-success text-success-foreground ... hover:bg-success/90'.
		for (const m of source.matchAll(
			/'bg-([a-z]+) text-\1-foreground([^']*)'/g
		)) {
			const [, fill, rest] = m
			const fg = colors.get(`${fill}-foreground`)
			const bg = colors.get(`${fill}`)
			if (!(fill && rest && fg && bg)) {
				continue
			}
			for (const state of rest.matchAll(
				new RegExp(`\\b(hover|active):bg-${fill}/(\\d+)\\b`, 'g')
			)) {
				for (const surface of ['background', 'card']) {
					const under = colors.get(surface)
					if (!under) {
						continue
					}
					checked++
					const ratio = contrast(fg, blend(bg, under, Number(state[2]) / 100))
					if (ratio < 4.5) {
						failures.push(
							`${state[1]}:bg-${fill}/${state[2]} on ${surface}: ${ratio.toFixed(2)} < 4.5`
						)
					}
				}
			}
		}
		expect(checked).toBeGreaterThan(0)
		expect(failures).toEqual([])
	})
})

describe('contrast-safe colour utilities', () => {
	describe('pattern behaviour', () => {
		test('state variants on text-accent match, text-accent-text does not', () => {
			const hits = (s: string) =>
				[...s.matchAll(ACCENT_STATE_TEXT)].map(m => m[1])
			expect(hits('"hover:text-accent"')).toEqual(['hover:text-accent'])
			expect(hits("'group-hover:text-accent/80'")).toEqual([
				'group-hover:text-accent/80'
			])
			expect(hits('"hover:text-accent-text"')).toEqual([])
			expect(hits('"hover:text-accent-foreground"')).toEqual([])
			expect(hits('"text-accent"')).toEqual([])
		})

		test('text-warning matches, text-warning-text does not', () => {
			const hits = (s: string) => [...s.matchAll(WARNING_TEXT)].map(m => m[1])
			expect(hits('"text-warning"')).toEqual(['text-warning'])
			expect(hits('"hover:text-warning/80"')).toEqual(['hover:text-warning/80'])
			expect(hits('"text-warning-text"')).toEqual([])
		})

		test('selected branches flag a bright accent edge, not a fill edge', () => {
			const hits = (s: string) =>
				[...s.matchAll(STATE_BRANCH)]
					.map(m => m[2] ?? '')
					.filter(cls => !SOLID_ACCENT_FILL.test(cls))
					.map(cls => cls.match(BRIGHT_INDICATOR)?.[1])
					.filter(Boolean)
			expect(hits("selected ? 'border-accent text-accent-text' : 'x'")).toEqual(
				['border-accent']
			)
			expect(hits("on ? 'border-l-accent font-medium' : 'x'")).toEqual([
				'border-l-accent'
			])
			expect(hits("on ? 'ring-2 ring-accent' : 'x'")).toEqual(['ring-accent'])
			expect(hits("on ? 'border-accent-text bg-accent/10' : 'x'")).toEqual([])
			expect(hits("on ? 'border-accent/20 bg-accent/10' : 'x'")).toEqual([])
			expect(hits("on ? 'bg-accent border-accent' : 'x'")).toEqual([])
			expect(hits("on ? 'x' : 'hover:border-accent'")).toEqual([])
		})

		test('opening-tag scan reads className past `>` in arbitrary variants', () => {
			const tag = '<div className="[&>span]:block text-accent">'
			const m = [...tag.matchAll(OPENING_TAG)][0]
			expect(m?.[1]).toBe('div')
			expect(m?.[2]).toContain('text-accent')
		})

		test('class constants resolve through aliases and template literals', () => {
			const content =
				"const BASE = 'field'\nconst ALIAS = BASE\n\nfunction X() {}\n"
			// The className source text of {`${ALIAS} text-right`}
			const expr = ['{`$', '{ALIAS} text-right`}'].join('')
			expect(resolveClasses(expr, content)).toContain("'field'")
		})
	})

	test('no state variant recolours text with text-accent', async () => {
		const violations = await findUtility(ACCENT_STATE_TEXT)
		if (violations.length > 0) {
			throw new Error(
				`${violations.length} hover/focus text-accent utility(ies). ` +
					'--color-accent is 2.49:1 on background; use ' +
					'`hover:text-accent-text` or `hover:underline`.\n' +
					format(violations)
			)
		}
		expect(violations).toEqual([])
	})

	test('no selected state is marked with a bright accent edge', async () => {
		const violations: Violation[] = []
		for (const [file, content] of await sourceFiles(SRC_GLOB)) {
			for (const m of content.matchAll(STATE_BRANCH)) {
				const cls = m[2] ?? ''
				if (SOLID_ACCENT_FILL.test(cls)) {
					continue
				}
				const token = cls.match(BRIGHT_INDICATOR)?.[1]
				if (token) {
					violations.push({
						file,
						line: lineOf(content, m.index),
						match: `'${cls.trim()}'`
					})
				}
			}
		}
		if (violations.length > 0) {
			throw new Error(
				`${violations.length} selected state(s) use the bright accent ` +
					'as the indicator (2.49:1, WCAG 1.4.11 needs 3:1). Use ' +
					'`border-accent-text` (or `ring-accent-text`).\n' +
					format(violations)
			)
		}
		expect(violations).toEqual([])
	})

	test('no text-warning text (1.81:1)', async () => {
		const violations = await findUtility(WARNING_TEXT)
		if (violations.length > 0) {
			throw new Error(
				`${violations.length} text-warning utility(ies). Use ` +
					'`text-warning-text`.\n' +
					format(violations)
			)
		}
		expect(violations).toEqual([])
	})

	test('no text element is coloured text-accent', async () => {
		const violations: Violation[] = []
		for (const [file, content] of await sourceFiles(TSX_GLOB)) {
			for (const m of content.matchAll(OPENING_TAG)) {
				const [, tag, attrs] = m
				if (!(tag && attrs && TEXT_TAGS.has(tag))) {
					continue
				}
				if (/aria-hidden="true"/.test(attrs)) {
					continue
				}
				const cls = attrs.match(STATIC_CLASS)?.[1]
				const token = cls?.match(ACCENT_TOKEN)?.[1]
				if (token) {
					violations.push({
						file,
						line: lineOf(content, m.index),
						match: `<${tag}> ${token}`
					})
				}
			}
		}
		if (violations.length > 0) {
			throw new Error(
				`${violations.length} text element(s) coloured text-accent ` +
					'(2.49:1). Use `text-accent-text`, or mark a decorative ' +
					'element aria-hidden="true".\n' +
					format(violations)
			)
		}
		expect(violations).toEqual([])
	})
})

describe('one form field treatment', () => {
	test('native text inputs, selects and textareas use .field; checkboxes use accent-primary', async () => {
		const violations: Violation[] = []
		for (const [file, content] of await sourceFiles(TSX_GLOB)) {
			if (file.startsWith(PRIMITIVES_DIR)) {
				continue
			}
			for (const m of content.matchAll(OPENING_TAG)) {
				const [, tag, attrs] = m
				if (!(tag && attrs && ['input', 'select', 'textarea'].includes(tag))) {
					continue
				}
				const type = attrs.match(/\btype="([^"]+)"/)?.[1] ?? ''
				const expr = classNameExpr(attrs) ?? ''
				const classes = resolveClasses(expr, content)
				const line = lineOf(content, m.index)
				// Visually hidden controls (styled through their label) are exempt.
				if (/\bsr-only\b/.test(classes)) {
					continue
				}
				if (type === 'checkbox') {
					if (!/\baccent-primary\b/.test(classes)) {
						violations.push({
							file,
							line,
							match: '<input checkbox> needs accent-primary'
						})
					}
					continue
				}
				if (NON_TEXT_INPUT_TYPES.has(type)) {
					continue
				}
				if (!FIELD_TOKEN.test(classes)) {
					violations.push({
						file,
						line,
						match: `<${tag}> ${expr || '(no className)'}`
					})
				}
			}
		}
		if (violations.length > 0) {
			throw new Error(
				`${violations.length} form control(s) off the shared treatment. ` +
					'Use the `.field` class (globals.css) plus layout utilities ' +
					'only; native checkboxes use `size-4 accent-primary`.\n' +
					format(violations)
			)
		}
		expect(violations).toEqual([])
	})
})
