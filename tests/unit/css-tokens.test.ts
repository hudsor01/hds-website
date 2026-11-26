/**
 * Token consolidation, radius, motion, dead CSS and the low findings
 * (39.2 M1, M2, M6, L1 to L6).
 *
 *   - One semantic colour system: the shadcn names (background, card,
 *     muted, popover ...). The surface-* and text-* duplicates, the unused
 *     sidebar ring and raw black/white utilities must not come back.
 *   - Three radius steps (md, xl, 2xl) and nothing else; component CSS and
 *     inline styles read var(--radius-*), never a literal.
 *   - Motion: three duration tokens, one easing, explicit transition
 *     properties, and hover movement only under motion-safe.
 *   - Dead CSS stays deleted, eyebrows use .text-eyebrow, prose spacing is
 *     on the spacing scale, fonts are scoped to <html>, cn() knows the
 *     spacing roles, in-text links share one underlined rule, and Sonner
 *     toasts read the tokens.
 */

import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { Glob } from 'bun'
import { cn } from '@/lib/utils'

const SRC_GLOB = 'src/**/*.{ts,tsx}'
const GLOBALS_CSS = 'src/app/globals.css'
const EXCLUDE_PATHS = ['_generated/', '.next/', 'node_modules/']
// Emails, PDFs and OG/icon images render outside the browser CSS and
// cannot read custom properties.
const NON_CSS_RUNTIMES = [
	'src/emails/',
	'src/lib/pdf/',
	'opengraph-image.tsx',
	'twitter-image.tsx',
	'apple-icon.tsx',
	'src/app/icon'
]

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

function stripComments(source: string): string {
	// Keep line numbers: replace comment bodies with the same newlines.
	return source
		.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
		.replace(/(^|[^:"'`])\/\/[^\n]*/g, (m, lead: string) =>
			(lead + ' '.repeat(m.length - lead.length)).slice(0, m.length)
		)
}

function findAll(
	files: [string, string][],
	pattern: RegExp,
	group = 0
): Violation[] {
	const out: Violation[] = []
	for (const [file, raw] of files) {
		const content = stripComments(raw)
		for (const m of content.matchAll(pattern)) {
			out.push({
				file,
				line: lineOf(content, m.index ?? 0),
				match: m[group] ?? m[0]
			})
		}
	}
	return out
}

function report(violations: Violation[]): string {
	return violations.map(v => `  ${v.file}:${v.line}  ${v.match}`).join('\n')
}

async function globalsCss(): Promise<string> {
	return stripComments(await readFile(GLOBALS_CSS, 'utf8'))
}

/** The body of the first rule whose selector text matches `selector`. */
function ruleBody(css: string, selector: RegExp): string | null {
	for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
		if (selector.test((m[1] ?? '').trim())) {
			return m[2] ?? ''
		}
	}
	return null
}

describe('one semantic colour system (M1)', () => {
	test('globals.css defines no duplicate or unused colour tokens', async () => {
		const css = await globalsCss()
		const dead = [
			...css.matchAll(
				/--color-(?:surface-[a-z]+|text-(?:primary|secondary|muted|inverted)|sidebar-ring|bg-overlay)\s*:/g
			)
		].map(m => m[0])
		expect(dead).toEqual([])
	})

	test('no class uses a surface-* token or raw black/white', async () => {
		const files = await sourceFiles()
		const offenders = findAll(
			files.filter(([f]) => !NON_CSS_RUNTIMES.some(skip => f.includes(skip))),
			/(?<![\w-])(?:[a-z0-9-]+:)*(?:bg|text|border|ring|fill|stroke|from|to|via|outline|divide|shadow)-(?:surface-[a-z]+|black|white)(?:\/\d+)?(?![\w-])/g
		)
		if (offenders.length > 0) {
			throw new Error(
				`Use the shadcn names (background, card, muted, popover, overlay), not surface-* or raw black/white:\n${report(offenders)}`
			)
		}
	})
})

describe('three radius steps (M2)', () => {
	test('the theme resets the radius scale to md, xl and 2xl', async () => {
		const css = await globalsCss()
		expect(css).toMatch(/--radius-\*:\s*initial;/)
		const steps = [...css.matchAll(/--radius-([a-z0-9]+)\s*:/g)].map(m => m[1])
		expect(steps.sort()).toEqual(['2xl', 'md', 'xl'])
		expect(css).not.toMatch(/--radius\s*:/)
	})

	test('component CSS and inline styles read radius tokens', async () => {
		const css = await globalsCss()
		const literal = [...css.matchAll(/border-radius:\s*([^;]+);/g)]
			.map(m => (m[1] ?? '').trim())
			.filter(v => !/^var\(--radius-(?:md|xl|2xl)\)$/.test(v) && v !== '50%')
		expect(literal).toEqual([])

		const files = (await sourceFiles()).filter(
			([f]) => !NON_CSS_RUNTIMES.some(skip => f.includes(skip))
		)
		const inline = findAll(files, /borderRadius:\s*([^,}\n]+)/g, 1).filter(
			v => !/^'var\(--radius-(?:md|xl|2xl)\)'$/.test(v.match.trim())
		)
		if (inline.length > 0) {
			throw new Error(
				`Inline borderRadius must be 'var(--radius-*)':\n${report(inline)}`
			)
		}
	})
})

describe('motion tokens (M6)', () => {
	test('the theme has three durations, one easing and one lift', async () => {
		const css = await globalsCss()
		for (const token of [
			'--transition-duration-fast: 150ms',
			'--transition-duration-base: 300ms',
			'--transition-duration-slow: 500ms',
			'--default-transition-duration: var(--transition-duration-fast)',
			'--default-transition-timing-function: var(--ease-in-out)',
			'--lift-offset:'
		]) {
			expect(css).toContain(token)
		}
	})

	test('globals.css never transitions all and has no literal timing', async () => {
		const css = await globalsCss()
		expect(css).not.toMatch(/transition:\s*all\b/)
		expect(css).not.toMatch(/transition-property:\s*all\b/)
		expect(css).not.toMatch(/cubic-bezier\(/)
		// Literal durations: only the token definitions and the 0.01ms
		// reduced-motion squash are allowed.
		const literals = [...css.matchAll(/(?<![\w.-])(\d*\.?\d+)m?s\b/g)]
			.map(m => m[0])
			.filter(v => !['150ms', '300ms', '500ms', '0.01ms'].includes(v))
		expect(literals).toEqual([])
	})

	test('class lists use the motion tokens, not ad-hoc values', async () => {
		const files = await sourceFiles()
		const offenders = findAll(
			files,
			/(?<![\w-])(?:[a-z0-9-]+:)*(transition-all|duration-\d+|ease-(?:in|out|linear)|will-change-[a-z]+|transform-gpu)(?![\w-])/g
		)
		if (offenders.length > 0) {
			throw new Error(
				`Use transition-colors/-transform/-smooth with duration-fast/-base/-slow:\n${report(offenders)}`
			)
		}
	})

	test('hover movement and JS scrolling respect reduced motion', async () => {
		const files = await sourceFiles()
		// A hover class that moves away from rest (scale other than 100,
		// translate other than 0). The rest values themselves, such as the
		// footer underline's group-hover:scale-x-100 reveal, are not movement.
		const movement = findAll(
			files,
			/(?<![\w-])((?:[a-z0-9-]+:)*(?:hover|group-hover):-?(?:scale-(?!(?:[xy]-)?100(?![\w.]))|translate-[xy]-(?!0(?![\w.])))[^\s"'`]*)/g,
			1
		).filter(v => !v.match.startsWith('motion-safe:'))
		const smooth = findAll(files, /behavior:\s*['"]smooth['"]/g)
		const offenders = [...movement, ...smooth]
		if (offenders.length > 0) {
			throw new Error(
				`Prefix hover movement with motion-safe: and let scrolls follow the CSS scroll-behavior:\n${report(offenders)}`
			)
		}
	})
})

describe('dead CSS stays deleted (L1, L4)', () => {
	test('globals.css defines none of the removed classes', async () => {
		const css = await globalsCss()
		const removed = [
			'animate-blob',
			'animation-delay-2000',
			'animate-blink',
			'section-spacing',
			'z-sticky',
			'z-fixed',
			'z-nav',
			'p-button',
			'surface-overlay',
			'flex-center',
			'flex-between',
			'link-accent'
		]
		const found = removed.filter(name =>
			new RegExp(`(?:\\.|@utility\\s+)${name}(?![\\w-])`).test(css)
		)
		expect(found).toEqual([])
		expect(css).not.toMatch(/@keyframes\s+(?:blob|blink)\b/)
	})

	test('no unlayered .sr-only copy (it beat focus:not-sr-only)', async () => {
		const css = await globalsCss()
		expect(css).not.toMatch(/(^|\n)\.sr-only\s*\{/)
	})

	test('eyebrows use .text-eyebrow, which carries accent-text', async () => {
		const css = await globalsCss()
		const body = ruleBody(css, /^\.text-eyebrow$/)
		expect(body).toContain('color: var(--color-accent-text)')

		const offenders = findAll(
			await sourceFiles(),
			/text-xs font-semibold uppercase tracking-widest/g
		)
		if (offenders.length > 0) {
			throw new Error(
				`Use text-eyebrow instead of the hand-built recipe:\n${report(offenders)}`
			)
		}
	})
})

describe('hardcoded values (L2)', () => {
	test('no white borders, relative colour syntax or arbitrary aspect ratios', async () => {
		const files = await sourceFiles()
		const offenders = findAll(
			files,
			/border-white|oklch\(from|aspect-\[\d+\/\d+\]|bg-\[radial-gradient/g
		)
		const css = await globalsCss()
		if (/oklch\(from/.test(css)) {
			offenders.push({ file: GLOBALS_CSS, line: 0, match: 'oklch(from' })
		}
		if (offenders.length > 0) {
			throw new Error(
				`Use tokens (border-border, color-mix, aspect-video/16/10, hero-spotlight):\n${report(offenders)}`
			)
		}
	})

	test('prose spacing is on the spacing scale', async () => {
		const css = await globalsCss()
		const start = css.indexOf('.typography {')
		expect(start).toBeGreaterThan(-1)
		const prose = css.slice(start)
		const rem = [...prose.matchAll(/(?<![\w.(-])\d*\.?\d+rem\b/g)].map(
			m => m[0]
		)
		expect(rem).toEqual([])
	})
})

describe('font variables on <html> (L3)', () => {
	test('every root document puts fontVariables on <html>, not <body>', async () => {
		for (const file of [
			'src/app/layout.tsx',
			'src/app/global-not-found.tsx',
			'src/app/global-error.tsx'
		]) {
			const source = await readFile(file, 'utf8')
			const html = source.match(/<html\b[^>]*>/)?.[0] ?? ''
			const body = source.match(/<body\b[^>]*>/)?.[0] ?? ''
			expect({ file, onHtml: html.includes('fontVariables') }).toEqual({
				file,
				onHtml: true
			})
			expect({ file, onBody: body.includes('fontVariables') }).toEqual({
				file,
				onBody: false
			})
		}
	})

	test('font tokens are plain @theme, so they are emitted on :root', async () => {
		const css = await globalsCss()
		expect(css).not.toContain('@theme inline')
		expect(css).toMatch(/--font-sans:\s*var\(--font-hanken-grotesk\)/)
	})
})

describe('cn() knows the spacing roles (L4)', () => {
	test('a later spacing class replaces a role class on the same axis', () => {
		expect(cn('gap-tight', 'gap-4')).toBe('gap-4')
		expect(cn('mt-content-block', 'mt-2')).toBe('mt-2')
		expect(cn('px-4', 'px-content')).toBe('px-content')
		expect(cn('space-y-tight', 'space-y-4')).toBe('space-y-4')
	})

	test('spacing and type roles never drop an unrelated class', () => {
		expect(cn('gap-tight', 'text-h1', 'text-foreground')).toBe(
			'gap-tight text-h1 text-foreground'
		)
	})
})

describe('one in-text link style (L5)', () => {
	test('.link-primary and .typography a share one underlined rule', async () => {
		const css = await globalsCss()
		const body = ruleBody(css, /^\.link-primary,\s*\.typography a$/)
		expect(body).not.toBeNull()
		expect(body).toContain('text-decoration-line: underline')
		expect(body).toContain('color: var(--color-primary)')
		const hover = ruleBody(
			css,
			/^\.link-primary:hover,\s*\.typography a:hover$/
		)
		expect(hover).toContain('color: var(--color-accent-text)')
	})

	test('no link is styled with a bare underline in the surrounding colour', async () => {
		const offenders = findAll(
			await sourceFiles(),
			/<(?:a|Link)\b[^>]*className="underline"/g
		)
		if (offenders.length > 0) {
			throw new Error(`In-text links use link-primary:\n${report(offenders)}`)
		}
	})
})

describe('Sonner toasts read the tokens (L6)', () => {
	test('the Toaster keeps the default light theme', async () => {
		const layout = await readFile('src/app/layout.tsx', 'utf8')
		const toaster = layout.match(/<Toaster\b[^>]*\/>/)?.[0] ?? ''
		expect(toaster).not.toBe('')
		expect(toaster).not.toContain('theme=')
	})

	test('every Sonner colour variable maps to a token', async () => {
		const css = await globalsCss()
		const body = ruleBody(
			css,
			/^:root \[data-sonner-toaster\]\[data-sonner-theme='light'\]$/
		)
		expect(body).not.toBeNull()
		for (const kind of ['normal', 'success', 'info', 'warning', 'error']) {
			for (const part of ['bg', 'border', 'text']) {
				expect(body).toMatch(
					new RegExp(`--${kind}-${part}:\\s*var\\(--color-[a-z-]+\\);`)
				)
			}
		}
		expect(body).toContain('--border-radius: var(--radius-xl)')
		expect(body).toContain('font-family: var(--font-sans)')
	})
})
