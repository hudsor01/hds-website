/**
 * Class hygiene: every class in a class list must generate CSS.
 *
 * Tailwind silently ignores a class it cannot build: no build error, no
 * console warning, the element just loses the style. That is how a
 * spacing codemod left `gap-x-content`, `pt-comfortable`,
 * `mt-content-block` and `sm:gap-tight.5` rendering nothing, and how
 * shadcn's `animate-in` / `fade-*` classes and a non-existent `danger`
 * color shipped for months (39.2 H1).
 *
 * The real compiler decides: globals.css is loaded into Tailwind's
 * design system and every candidate is asked for its CSS. A class also
 * counts as defined when globals.css declares it as a selector
 * (`@layer components` classes such as `.text-h1`), or when it is a
 * `group` / `peer` marker.
 *
 * Which string literals are class lists:
 *   - a `className="..."` / `className={'...'}` value: every token is
 *     checked;
 *   - any other literal with at least one token that generates CSS
 *     (cn(), cva() and variant maps): its utility-shaped tokens (with a
 *     `-` or `:`) are checked. Prose never reaches this path because a
 *     sentence has punctuation or capitals the token shape rejects.
 * Template literals with `${}` are skipped (their tokens are partial).
 */

import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { Glob } from 'bun'
import { __unstable__loadDesignSystem } from 'tailwindcss'

const GLOBALS_CSS = 'src/app/globals.css'
const TAILWIND_ENTRY = 'node_modules/tailwindcss/index.css'
const SRC_GLOB = 'src/**/*.{ts,tsx}'
const EXCLUDE_PATHS = ['_generated/']

// One class-shaped token: no spaces, does not end in `:` (inline styles).
const CLASS_TOKEN = /^[!-]?[a-z0-9@[\]():/.%_=&>~*#,'"+-]*[a-z0-9\])%/_-]$/i
const MARKER = /^(group|peer)(\/[\w-]+)?$/
const STRING_LITERAL = /(["'`])((?:(?!\1)[^\\\n]|\\.)*)\1/g
const CLASSNAME_ATTR = /className=\s*\{?\s*$/

interface UnknownClass {
	file: string
	line: number
	token: string
}

function stripComments(source: string): string {
	return source.replace(/\/\*[\s\S]*?\*\//g, '')
}

async function loadCandidateResolver(): Promise<
	(tokens: string[]) => (string | null)[]
> {
	const css = await readFile(GLOBALS_CSS, 'utf8')
	const designSystem = await __unstable__loadDesignSystem(css, {
		base: dirname(resolve(GLOBALS_CSS)),
		async loadStylesheet(id, base) {
			const path =
				id === 'tailwindcss' ? resolve(TAILWIND_ENTRY) : resolve(base, id)
			return {
				path,
				base: dirname(path),
				content: await readFile(path, 'utf8')
			}
		}
	})
	return tokens => designSystem.candidatesToCss(tokens)
}

async function ownClasses(): Promise<Set<string>> {
	const css = stripComments(await readFile(GLOBALS_CSS, 'utf8'))
	const names = new Set<string>()
	for (const m of css.matchAll(/\.(-?[a-z_][\w-]*)/gi)) {
		// biome-ignore lint/style/noNonNullAssertion: group 1 is required
		names.add(m[1]!)
	}
	return names
}

async function scan(): Promise<UnknownClass[]> {
	const toCss = await loadCandidateResolver()
	const own = await ownClasses()
	const known = (token: string, css: string | null | undefined) =>
		css != null || own.has(token) || MARKER.test(token)

	const unknown: UnknownClass[] = []
	for await (const file of new Glob(SRC_GLOB).scan()) {
		if (EXCLUDE_PATHS.some(skip => file.includes(skip))) {
			continue
		}
		const source = await readFile(file, 'utf8')
		for (const m of source.matchAll(STRING_LITERAL)) {
			// biome-ignore lint/style/noNonNullAssertion: group 2 is required
			const literal = m[2]!
			if (literal.includes('${') || literal.trim() === '') {
				continue
			}
			const tokens = literal.trim().split(/\s+/)
			if (!tokens.every(t => CLASS_TOKEN.test(t))) {
				continue
			}
			const css = toCss(tokens)
			const resolved = tokens.filter((t, i) => known(t, css[i]))
			const isAttr = CLASSNAME_ATTR.test(
				source.slice(Math.max(0, m.index - 14), m.index)
			)
			if (resolved.length === tokens.length) {
				continue
			}
			if (resolved.length === 0 && !isAttr) {
				continue
			}
			const line = source.slice(0, m.index).split('\n').length
			tokens.forEach((token, i) => {
				if (!known(token, css[i]) && (isAttr || /[-:]/.test(token))) {
					unknown.push({ file, line, token })
				}
			})
		}
	}
	return unknown
}

describe('Tailwind class lists', () => {
	test('the compiler resolves theme utilities and rejects unknown names', async () => {
		const toCss = await loadCandidateResolver()
		const [spacing, accordion, bogus] = toCss([
			'gap-x-content',
			'data-[state=open]:animate-accordion-down',
			'gap-x-bogus-role'
		])
		expect(spacing).toContain('var(--spacing-content)')
		expect(accordion).toContain('var(--animate-accordion-down)')
		expect(bogus).toBeNull()
	})

	test('every class in src generates CSS', async () => {
		const unknown = await scan()
		if (unknown.length > 0) {
			throw new Error(
				`Found ${unknown.length} class(es) that generate no CSS. Tailwind ` +
					`drops them silently. Use a theme token name (--spacing-*, ` +
					`--color-*, --animate-*) or define the utility in globals.css.\n` +
					unknown.map(u => `  ${u.file}:${u.line}  ${u.token}`).join('\n')
			)
		}
		expect(unknown).toEqual([])
	})
})
