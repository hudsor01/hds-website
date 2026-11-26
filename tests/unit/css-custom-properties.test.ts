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
 *     and every `@property --x` there with an `initial-value`
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
 *
 * The compiled check is stricter and matches the audit's console probe
 * (39.2 audit section 7): every `var(--x` it reads, fallback or not and
 * `--tw-*` aside, must have a value at :root. That is a declaration in a
 * :root/html rule outside any condition (the @theme output, the :root
 * block), a next/font variable (set on <html>), or an `@property`
 * registration with an `initial-value`. A name set only on an element
 * (`.grid-pattern { --grid-line }`, Radix's inline styles) must be
 * registered, so it reads the same everywhere and never computes to an
 * empty value.
 */

import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/postcss'
import { Glob } from 'bun'
import postcss, { type AtRule, type Root, type Rule } from 'postcss'

const GLOBALS_CSS = 'src/app/globals.css'
const TAILWIND_THEME = 'node_modules/tailwindcss/theme.css'
const FONTS = 'src/app/fonts.ts'
const SRC_GLOB = 'src/**/*.{ts,tsx}'
const EXCLUDE_PATHS = ['_generated/']
const RUNTIME_PREFIXES = [/^--tw-/, /^--radix-/]
// Tailwind's per-utility state (--tw-*): the audit probe skips it too.
const COMPILED_EXEMPT_PREFIXES = [/^--tw-/]
// Every `var(--x`, with or without a fallback (what the audit probe reads).
const ANY_VAR_REFERENCE = /var\(\s*(--[\w-]+)/g
const ROOT_SELECTORS = new Set([':root', 'html'])

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
	// A registration with an initial-value defines the name everywhere.
	for (const m of source.matchAll(
		/@property\s+(--[\w-]+)\s*\{[^}]*\binitial-value\s*:/g
	)) {
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

const DEFAULT_ADVICE =
	'Use the --color-* (or other @theme) token name, and keep tokens that ' +
	'rules read in a plain @theme block (not inline or reference).'

function report(lines: string[], where: string, advice = DEFAULT_ADVICE): void {
	if (lines.length > 0) {
		throw new Error(
			`Found ${lines.length} var() reference(s) to a custom property ` +
				`${where}. The declaration silently computes to unset. ${advice}\n` +
				lines.map(line => `  ${line}`).join('\n')
		)
	}
}

/** A :root or html rule that applies everywhere (inside @layer at most). */
function isUnconditionalRoot(rule: Rule): boolean {
	if (!rule.selectors.some(s => ROOT_SELECTORS.has(s.trim()))) {
		return false
	}
	for (let p = rule.parent; p && p.type !== 'root'; p = p.parent) {
		if (p.type !== 'atrule' || (p as AtRule).name !== 'layer') {
			return false
		}
	}
	return true
}

/**
 * Names with a value on <html> in every state: unconditional :root/html
 * declarations and @property registrations with an initial-value.
 */
function rootDefined(root: Root): Set<string> {
	const names = new Set<string>()
	root.walkAtRules('property', rule => {
		if (
			rule.nodes?.some(
				node => node.type === 'decl' && node.prop === 'initial-value'
			)
		) {
			names.add(rule.params.trim())
		}
	})
	root.walkRules(rule => {
		if (!isUnconditionalRoot(rule)) {
			return
		}
		for (const node of rule.nodes) {
			if (node.type === 'decl' && node.prop.startsWith('--')) {
				names.add(node.prop)
			}
		}
	})
	return names
}

/** Every `var(--x` in a compiled stylesheet, fallback or not. */
function compiledReferences(root: Root): { name: string; where: string }[] {
	const refs: { name: string; where: string }[] = []
	root.walkDecls(decl => {
		const rule = decl.parent?.type === 'rule' ? (decl.parent as Rule) : null
		for (const m of decl.value.matchAll(ANY_VAR_REFERENCE)) {
			refs.push({
				// biome-ignore lint/style/noNonNullAssertion: group 1 is required
				name: m[1]!,
				where: `${rule?.selector ?? '(at-rule)'} { ${decl.prop} }`
			})
		}
	})
	return refs
}

interface Scan {
	// Includes names set on elements from TSX (style={{ '--x': v }}, [--x:v]).
	defs: Set<string>
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
		const undefinedRefs = undefinedIn(refs, defs, RUNTIME_PREFIXES)
		report(
			undefinedRefs.map(r => `${r.file}:${r.line}  ${r.name}`),
			'that is never defined'
		)
		expect(undefinedRefs).toEqual([])
	})

	test('every var() the compiled stylesheet reads has a value at :root', async () => {
		const root = await compileGlobals()
		const atRoot = rootDefined(root)
		for (const name of await fontVariables()) {
			atRoot.add(name)
		}
		const refs = compiledReferences(root)
		expect(atRoot.has('--color-primary')).toBe(true)
		expect(refs.length).toBeGreaterThan(100)

		const missing = undefinedIn(refs, atRoot, COMPILED_EXEMPT_PREFIXES)
		report(
			missing.map(r => `${r.where}  ${r.name}`),
			'with no value at :root',
			'Declare it in @theme or :root, or register it with @property ' +
				'and an initial-value that matches the unset behaviour.'
		)
		expect(missing).toEqual([])
	})

	test('the :root check accepts only unconditional root values and registrations', () => {
		const sample = postcss.parse(`
			:root, :host { --a: 1px; }
			@layer theme { :root { --b: 1px; } }
			@media (width >= 40rem) { :root { --c: 1px; } }
			@property --f { syntax: '*'; inherits: false; initial-value: 1px; }
			@property --g { syntax: '*'; inherits: false; }
			.x {
				--d: 1px;
				margin: var(--a) var(--b) var(--c) var(--d);
				padding: var(--e, 1px) var(--f) var(--g) var(--tw-h);
			}
		`)
		const missing = undefinedIn(
			compiledReferences(sample),
			rootDefined(sample),
			COMPILED_EXEMPT_PREFIXES
		).map(r => r.name)
		expect(missing).toEqual(['--c', '--d', '--e', '--g'])
	})
})
