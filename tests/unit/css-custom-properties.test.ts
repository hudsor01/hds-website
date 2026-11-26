/**
 * CSS custom property hygiene: every `var(--x)` must resolve.
 *
 * A declaration that reads an undefined custom property is invalid at
 * computed-value time and silently behaves as `unset`: no build error, no
 * console warning. That is how half-migrated names (`--primary` instead of
 * `--color-primary`) blanked the focus outline site-wide and stripped the
 * blog prose styling (39.2 C1-C3).
 *
 * Definitions come from:
 *   - every `--x:` in src/app/globals.css (`@theme` tokens, `:root`, rules)
 *   - Tailwind's own theme (node_modules/tailwindcss/theme.css)
 *   - next/font `variable` names in src/app/fonts.ts
 *   - inline `style={{ '--x': ... }}` keys and `[--x:...]` arbitrary
 *     properties in src TSX
 *
 * References come from globals.css and src TS/TSX (`var(--x` and the
 * Tailwind v4 `utility-(--x)` shorthand). A reference with a fallback,
 * `var(--x, 15%)`, is valid even when `--x` is unset, so only the
 * fallback's own `var()` (if any) is checked. Runtime-owned names
 * (`--tw-*` set by Tailwind utilities, `--radix-*` set by Radix at
 * runtime) are allowed.
 *
 * A name written in globals.css can still be missing from the stylesheet
 * the browser gets: Tailwind emits only the theme variables something
 * uses, and never emits `@theme inline` or `@theme reference` ones. So the
 * same rule is checked again on the compiled stylesheet, built by the
 * same PostCSS plugin and class scan as `next build`, which is what the
 * audit measured on the live site.
 */

import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/postcss'
import { Glob } from 'bun'
import postcss, { type Root, type Rule } from 'postcss'

const GLOBALS_CSS = 'src/app/globals.css'
const TAILWIND_THEME = 'node_modules/tailwindcss/theme.css'
const FONTS = 'src/app/fonts.ts'
const SRC_GLOB = 'src/**/*.{ts,tsx}'
const EXCLUDE_PATHS = ['_generated/']
const RUNTIME_PREFIXES = [/^--tw-/, /^--radix-/]
// In the compiled stylesheet every --tw-* name Tailwind reads is registered
// (@property) or has a fallback, so only Radix's runtime names stay exempt.
const COMPILED_RUNTIME_PREFIXES = [/^--radix-/]

interface Reference {
	file: string
	line: number
	name: string
}

// Blank out comments but keep their newlines so line numbers still match.
function stripComments(source: string): string {
	return source.replace(/\/\*[\s\S]*?\*\//g, comment =>
		comment.replace(/[^\n]/g, ' ')
	)
}

function lineOf(source: string, index: number): number {
	return source.slice(0, index).split('\n').length
}

function collectDefinitions(source: string, into: Set<string>): void {
	for (const m of source.matchAll(/(?<![\w-])(--[\w-]+)\s*:/g)) {
		// biome-ignore lint/style/noNonNullAssertion: group 1 is required
		into.add(m[1]!)
	}
}

function collectReferences(file: string, source: string): Reference[] {
	const refs: Reference[] = []
	// `var(--x)` with no fallback; `var(--x,` has one and is always valid.
	for (const m of source.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)) {
		// biome-ignore lint/style/noNonNullAssertion: group 1 is required
		refs.push({ file, line: lineOf(source, m.index), name: m[1]! })
	}
	// Tailwind v4 shorthand: `w-(--radix-select-trigger-width)`.
	for (const m of source.matchAll(/[\w\]]-\((--[\w-]+)\)/g)) {
		// biome-ignore lint/style/noNonNullAssertion: group 1 is required
		refs.push({ file, line: lineOf(source, m.index), name: m[1]! })
	}
	return refs
}

// next/font defines these on <html> from its own stylesheet.
async function fontVariables(): Promise<string[]> {
	const fonts = await readFile(FONTS, 'utf8')
	return [...fonts.matchAll(/variable:\s*'(--[\w-]+)'/g)].map(
		// biome-ignore lint/style/noNonNullAssertion: group 1 is required
		m => m[1]!
	)
}

// globals.css through the PostCSS plugin next build uses, with the same
// `source('..')` class scan.
async function compileGlobals(): Promise<Root> {
	const from = resolve(GLOBALS_CSS)
	const result = await postcss([tailwindcss()]).process(
		await readFile(from, 'utf8'),
		{ from }
	)
	return result.root
}

function undefinedIn<T extends { name: string }>(
	refs: T[],
	defs: Set<string>,
	exempt: RegExp[]
): T[] {
	return refs.filter(
		r => !defs.has(r.name) && !exempt.some(p => p.test(r.name))
	)
}

function report(lines: string[], where: string): void {
	if (lines.length > 0) {
		throw new Error(
			`Found ${lines.length} var() reference(s) to a custom property ` +
				`${where}. The declaration silently computes to unset. Use the ` +
				`--color-* (or other @theme) token name, and keep tokens that ` +
				`rules read in a plain @theme block (not inline or reference).\n` +
				lines.map(line => `  ${line}`).join('\n')
		)
	}
}

interface Scan {
	defs: Set<string>
	// Names set on elements from TSX (style={{ '--x': v }}, [--x:v]).
	inline: Set<string>
	refs: Reference[]
}

async function scan(): Promise<Scan> {
	const defs = new Set<string>()
	const inline = new Set<string>()
	const refs: Reference[] = []

	const globals = stripComments(await readFile(GLOBALS_CSS, 'utf8'))
	collectDefinitions(globals, defs)
	refs.push(...collectReferences(GLOBALS_CSS, globals))

	collectDefinitions(
		stripComments(await readFile(TAILWIND_THEME, 'utf8')),
		defs
	)

	for (const name of await fontVariables()) {
		defs.add(name)
	}

	for await (const file of new Glob(SRC_GLOB).scan()) {
		if (EXCLUDE_PATHS.some(skip => file.includes(skip))) {
			continue
		}
		const source = await readFile(file, 'utf8')
		for (const m of source.matchAll(/(?:\[|['"])(--[\w-]+)['"]?\s*:/g)) {
			// biome-ignore lint/style/noNonNullAssertion: group 1 is required
			inline.add(m[1]!)
		}
		refs.push(...collectReferences(file, source))
	}

	for (const name of inline) {
		defs.add(name)
	}
	return { defs, inline, refs }
}

describe('CSS custom properties', () => {
	test('scan finds the theme tokens and their consumers', async () => {
		const { defs, refs } = await scan()
		expect(defs.has('--color-primary')).toBe(true)
		expect(defs.has('--font-hanken-grotesk')).toBe(true)
		expect(defs.has('--spacing')).toBe(true)
		expect(refs.some(r => r.name === '--color-foreground')).toBe(true)
	})

	test('every var() reference without a fallback is defined', async () => {
		const { defs, refs } = await scan()
		const undefinedRefs = undefinedIn(refs, defs, RUNTIME_PREFIXES)
		report(
			undefinedRefs.map(r => `${r.file}:${r.line}  ${r.name}`),
			'that is never defined'
		)
		expect(undefinedRefs).toEqual([])
	})

	test('the compiled stylesheet defines every var() it reads', async () => {
		const root = await compileGlobals()
		const defs = new Set([...(await fontVariables()), ...(await scan()).inline])
		const refs: { name: string; where: string }[] = []
		root.walkAtRules('property', rule => {
			defs.add(rule.params.trim())
		})
		root.walkDecls(decl => {
			if (decl.prop.startsWith('--')) {
				defs.add(decl.prop)
			}
			const rule = decl.parent?.type === 'rule' ? (decl.parent as Rule) : null
			for (const ref of collectReferences('', decl.value)) {
				refs.push({
					name: ref.name,
					where: `${rule?.selector ?? '(at-rule)'} { ${decl.prop} }`
				})
			}
		})
		expect(defs.has('--color-primary')).toBe(true)
		expect(refs.length).toBeGreaterThan(100)

		const undefinedRefs = undefinedIn(refs, defs, COMPILED_RUNTIME_PREFIXES)
		report(
			undefinedRefs.map(r => `${r.where}  ${r.name}`),
			'that the compiled stylesheet never emits'
		)
		expect(undefinedRefs).toEqual([])
	})
})
