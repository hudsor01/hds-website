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
 */

import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { Glob } from 'bun'

const GLOBALS_CSS = 'src/app/globals.css'
const TAILWIND_THEME = 'node_modules/tailwindcss/theme.css'
const FONTS = 'src/app/fonts.ts'
const SRC_GLOB = 'src/**/*.{ts,tsx}'
const EXCLUDE_PATHS = ['_generated/']
const RUNTIME_PREFIXES = [/^--tw-/, /^--radix-/]

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

async function scan(): Promise<{ defs: Set<string>; refs: Reference[] }> {
	const defs = new Set<string>()
	const refs: Reference[] = []

	const globals = stripComments(await readFile(GLOBALS_CSS, 'utf8'))
	collectDefinitions(globals, defs)
	refs.push(...collectReferences(GLOBALS_CSS, globals))

	collectDefinitions(
		stripComments(await readFile(TAILWIND_THEME, 'utf8')),
		defs
	)

	const fonts = await readFile(FONTS, 'utf8')
	for (const m of fonts.matchAll(/variable:\s*'(--[\w-]+)'/g)) {
		// biome-ignore lint/style/noNonNullAssertion: group 1 is required
		defs.add(m[1]!)
	}

	for await (const file of new Glob(SRC_GLOB).scan()) {
		if (EXCLUDE_PATHS.some(skip => file.includes(skip))) {
			continue
		}
		const source = await readFile(file, 'utf8')
		for (const m of source.matchAll(/(?:\[|['"])(--[\w-]+)['"]?\s*:/g)) {
			// biome-ignore lint/style/noNonNullAssertion: group 1 is required
			defs.add(m[1]!)
		}
		refs.push(...collectReferences(file, source))
	}

	return { defs, refs }
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
		const undefinedRefs = refs.filter(
			r => !defs.has(r.name) && !RUNTIME_PREFIXES.some(p => p.test(r.name))
		)
		if (undefinedRefs.length > 0) {
			throw new Error(
				`Found ${undefinedRefs.length} var() reference(s) to an undefined ` +
					`custom property. The declaration silently computes to unset. ` +
					`Use the --color-* (or other @theme) token name.\n` +
					undefinedRefs.map(r => `  ${r.file}:${r.line}  ${r.name}`).join('\n')
			)
		}
		expect(undefinedRefs).toEqual([])
	})
})
