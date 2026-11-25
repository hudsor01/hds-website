/**
 * Containers, breakpoints and buttons (M3, M4, M5).
 *
 *   - Two page containers, `container-wide` (80rem) and `container-content`
 *     (56rem), both padded by the one responsive `--page-gutter`. A class
 *     list that carries a container must not add its own gutter, width or
 *     centring, and a <section> carries no horizontal padding: the
 *     container inside it owns the content edge.
 *   - Breakpoints come from the theme (rem). globals.css has no px media
 *     queries.
 *   - Every button and CTA goes through `buttonVariants`: one radius, one
 *     weight and the 44px minimum height on every variant and size, no
 *     icon-dependent padding, and no hand-built filled CTA class lists.
 */

import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { Glob } from 'bun'
import { buttonVariants } from '@/components/ui/button-variants'

const SRC_GLOB = 'src/**/*.{ts,tsx}'
const GLOBALS_CSS = 'src/app/globals.css'
const EXCLUDE_PATHS = ['_generated/', '.next/', 'node_modules/']

const CONTAINER = /^container-(?:wide|content)$/
// What a container already owns: horizontal padding, max width, centring.
const CONTAINER_CONFLICT =
	/^(?:[a-z0-9-]+:)*(?:px-.+|pl-.+|pr-.+|ps-.+|pe-.+|max-w-.+|mx-auto)$/
// A section opening tag whose className has horizontal padding.
const SECTION_GUTTER =
	/<section\b[^>]*?className="[^"]*?(?:^|\s)((?:[a-z0-9-]+:)*px-[^\s"]+)/g
// A solid fill plus padding in one class list on a <button>, <a> or
// <Link>: a hand-built CTA. (Badges on a <div>/<span> are not CTAs.)
const INTERACTIVE_TAG = /<(?:button|a|Link)\b/g
const FILLED_CTA =
	/(?:^|\s)bg-(?:accent|primary|destructive|success|info)(?=\s|$)/
const PADDING_X = /(?:^|\s)px-\d/
const STRING_LITERAL = /"([^"\n]*)"|'([^'\n]*)'|`([^`]*)`/g

const VARIANTS = [
	'default',
	'destructive',
	'success',
	'accent',
	'outline',
	'outline-strong',
	'secondary',
	'muted',
	'ghost',
	'link'
] as const
const SIZES = [
	'default',
	'sm',
	'lg',
	'xl',
	'icon',
	'icon-sm',
	'icon-lg'
] as const

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

/** Tokens a container class list adds on top of what the container owns. */
function containerConflicts(classList: string): string[] {
	const tokens = classList.split(/\s+/).filter(Boolean)
	if (!tokens.some(t => CONTAINER.test(t))) {
		return []
	}
	return tokens.filter(t => CONTAINER_CONFLICT.test(t))
}

function isHandBuiltCta(classList: string): boolean {
	return FILLED_CTA.test(classList) && PADDING_X.test(classList)
}

/** Opening tags of interactive elements, scanned past `{...}` and strings. */
function interactiveTags(content: string): { index: number; tag: string }[] {
	const tags: { index: number; tag: string }[] = []
	for (const m of content.matchAll(INTERACTIVE_TAG)) {
		const start = m.index ?? 0
		let depth = 0
		let quote: string | null = null
		let i = start
		for (; i < content.length; i++) {
			const c = content[i]
			if (quote) {
				if (c === quote && content[i - 1] !== '\\') {
					quote = null
				}
				continue
			}
			if (c === '"' || c === "'" || c === '`') {
				quote = c
			} else if (c === '{') {
				depth++
			} else if (c === '}') {
				depth--
			} else if (c === '>' && depth === 0) {
				break
			}
		}
		tags.push({ index: start, tag: content.slice(start, i + 1) })
	}
	return tags
}

describe('page containers', () => {
	describe('containerConflicts()', () => {
		test('flags gutter, width and centring next to a container', () => {
			expect(containerConflicts('container-wide px-4 sm:px-6 pt-28')).toEqual([
				'px-4',
				'sm:px-6'
			])
			expect(containerConflicts('container-wide max-w-4xl mx-auto')).toEqual([
				'max-w-4xl',
				'mx-auto'
			])
		})

		test('allows vertical spacing and layout', () => {
			expect(
				containerConflicts('relative z-10 container-content pt-28 pb-16')
			).toEqual([])
			expect(containerConflicts('mx-auto max-w-5xl px-4')).toEqual([])
		})
	})

	test('globals.css defines both containers on the one gutter', async () => {
		const css = await readFile(GLOBALS_CSS, 'utf8')
		for (const name of ['container-wide', 'container-content']) {
			const block = css.match(new RegExp(`@utility ${name} \\{([^}]*)\\}`))?.[1]
			expect(block).toBeDefined()
			expect(block).toContain('padding-inline: var(--page-gutter)')
		}
		expect(css).toMatch(/--page-gutter:/)
		expect(css).not.toMatch(
			/\.(?:container-narrow|page-padding-x|grid-3|grid-4)\b/
		)
	})

	test('no container class list adds its own gutter, width or centring', async () => {
		const violations: Violation[] = []
		for (const [file, content] of await sourceFiles()) {
			for (const m of content.matchAll(STRING_LITERAL)) {
				const literal = m[1] ?? m[2] ?? m[3] ?? ''
				const extra = containerConflicts(literal)
				if (extra.length > 0) {
					violations.push({
						file,
						line: lineOf(content, m.index ?? 0),
						match: extra.join(' ')
					})
				}
			}
		}
		if (violations.length > 0) {
			throw new Error(
				`A container owns its gutter, width and centring; drop:\n${format(violations)}`
			)
		}
		expect(violations).toEqual([])
	})

	test('no <section> carries horizontal padding', async () => {
		const violations: Violation[] = []
		for (const [file, content] of await sourceFiles()) {
			for (const m of content.matchAll(SECTION_GUTTER)) {
				violations.push({
					file,
					line: lineOf(content, m.index ?? 0),
					// biome-ignore lint/style/noNonNullAssertion: group 1 is structural
					match: m[1]!
				})
			}
		}
		if (violations.length > 0) {
			throw new Error(
				`Sections take their gutter from the container inside them:\n${format(violations)}`
			)
		}
		expect(violations).toEqual([])
	})
})

describe('breakpoints', () => {
	test('globals.css has no px media queries (use the theme breakpoints)', async () => {
		const css = await readFile(GLOBALS_CSS, 'utf8')
		const offenders: string[] = []
		css.split('\n').forEach((line, i) => {
			if (/@media[^{]*\d+px/.test(line)) {
				offenders.push(`  ${GLOBALS_CSS}:${i + 1}  ${line.trim()}`)
			}
		})
		if (offenders.length > 0) {
			throw new Error(
				`px media queries in globals.css:\n${offenders.join('\n')}`
			)
		}
		expect(offenders).toEqual([])
	})
})

describe('one button API', () => {
	test('every variant and size shares radius, weight and minimum height', () => {
		for (const variant of VARIANTS) {
			for (const size of SIZES) {
				const tokens = buttonVariants({ variant, size }).split(/\s+/)
				const radius = tokens.filter(t => /^rounded(?:-|$)/.test(t))
				const weight = tokens.filter(t =>
					/^font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/.test(
						t
					)
				)
				expect({ variant, size, radius, weight }).toEqual({
					variant,
					size,
					radius: ['rounded-md'],
					weight: ['font-semibold']
				})
				expect(tokens).toContain('min-h-11')
			}
		}
	})

	test('padding does not depend on an icon, and nothing promotes a layer', () => {
		const all = VARIANTS.flatMap(variant =>
			SIZES.map(size => buttonVariants({ variant, size }))
		).join(' ')
		expect(all).not.toMatch(/has-\[>svg\]|will-change|outline-hidden|ring-/)
	})

	test('xl CTAs pair with the same padding', () => {
		expect(buttonVariants({ variant: 'accent', size: 'xl' })).toContain('px-8')
		expect(buttonVariants({ variant: 'outline-strong', size: 'xl' })).toContain(
			'px-8'
		)
	})

	test('isHandBuiltCta() needs both a solid fill and horizontal padding', () => {
		expect(
			isHandBuiltCta('px-6 py-3 rounded-lg bg-accent text-accent-foreground')
		).toBe(true)
		expect(isHandBuiltCta('bg-accent/10 px-3 text-accent-text')).toBe(false)
		expect(isHandBuiltCta('bg-accent text-accent-foreground')).toBe(false)
	})

	test('no hand-built filled CTA class lists (use Button or buttonVariants)', async () => {
		const violations: Violation[] = []
		for (const [file, content] of await sourceFiles()) {
			if (file.endsWith('button-variants.ts')) {
				continue
			}
			for (const { index, tag } of interactiveTags(content)) {
				for (const m of tag.matchAll(STRING_LITERAL)) {
					const literal = m[1] ?? m[2] ?? m[3] ?? ''
					if (isHandBuiltCta(literal)) {
						violations.push({
							file,
							line: lineOf(content, index),
							match: literal.trim().slice(0, 80)
						})
					}
				}
			}
		}
		if (violations.length > 0) {
			throw new Error(`Hand-built CTAs in src/:\n${format(violations)}`)
		}
		expect(violations).toEqual([])
	})

	test('the secondary CTA border lives only in the outline-strong variant', async () => {
		const violations: Violation[] = []
		for (const [file, content] of await sourceFiles()) {
			if (file.endsWith('button-variants.ts')) {
				continue
			}
			for (const m of content.matchAll(/border-2 border-foreground\/25/g)) {
				violations.push({
					file,
					line: lineOf(content, m.index ?? 0),
					match: m[0]
				})
			}
		}
		if (violations.length > 0) {
			throw new Error(
				`Use variant="outline-strong" instead of the override:\n${format(violations)}`
			)
		}
		expect(violations).toEqual([])
	})
})
