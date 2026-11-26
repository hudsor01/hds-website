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
 * (`@layer components` classes such as `.text-eyebrow`), or when it is a
 * `group` / `peer` marker.
 *
 * String literals come from the TypeScript AST, so comments and JSX text
 * are never read, and multi-line and nested template literals are seen
 * whole. Which literals are class lists:
 *   - the value of a `className` attribute (string or template): every
 *     token is checked;
 *   - any other literal with at least one token that generates CSS
 *     (cn(), cva() and variant maps): its utility-shaped tokens (with a
 *     `-` or `:`) are checked.
 * In a template literal only the static text is read, minus any token
 * glued to a `${}` (`p-${n}` is partial); the expressions are visited as
 * literals of their own. Tagged templates (sql`...`) are a different
 * language and are skipped, as are module specifiers.
 */

import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { Glob } from 'bun'
import { __unstable__loadDesignSystem } from 'tailwindcss'
// TypeScript 7 ships no JS compiler API; the TS 6 API is installed under
// the typescript6 alias (as in gsc-doc.test.ts) for this parser.
import * as ts from 'typescript6'

const GLOBALS_CSS = 'src/app/globals.css'
const TAILWIND_ENTRY = 'node_modules/tailwindcss/index.css'
const SRC_GLOB = 'src/**/*.{ts,tsx}'
const EXCLUDE_PATHS = ['_generated/']

// One class-shaped token: no spaces, does not end in `:` (inline styles).
const CLASS_TOKEN = /^[!-]?[a-z0-9@[\]():/.%_=&>~*#,'"+-]*[a-z0-9\])%/_-]$/i
const MARKER = /^(group|peer)(\/[\w-]+)?$/

type ClassLiteral =
	| ts.StringLiteral
	| ts.NoSubstitutionTemplateLiteral
	| ts.TemplateExpression

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

function isClassLiteral(node: ts.Node): node is ClassLiteral {
	if (
		!ts.isStringLiteral(node) &&
		!ts.isNoSubstitutionTemplateLiteral(node) &&
		!ts.isTemplateExpression(node)
	) {
		return false
	}
	const parent = node.parent
	return !(
		ts.isTaggedTemplateExpression(parent) ||
		ts.isImportDeclaration(parent) ||
		ts.isExportDeclaration(parent) ||
		ts.isExternalModuleReference(parent) ||
		(ts.isCallExpression(parent) &&
			parent.expression.kind === ts.SyntaxKind.ImportKeyword)
	)
}

function isClassNameValue(node: ClassLiteral): boolean {
	const parent = ts.isJsxExpression(node.parent)
		? node.parent.parent
		: node.parent
	return ts.isJsxAttribute(parent) && parent.name.getText() === 'className'
}

/**
 * The whole tokens of a literal. In a template, a token touching a `${}`
 * (no whitespace between them) is only part of a class and is dropped.
 */
function literalTokens(node: ClassLiteral): string[] {
	if (!ts.isTemplateExpression(node)) {
		return node.text.split(/\s+/).filter(Boolean)
	}
	const chunks = [
		node.head.text,
		...node.templateSpans.map(s => s.literal.text)
	]
	return chunks.flatMap((chunk, i) => {
		const parts = chunk.split(/\s+/)
		if (i > 0 && !/^\s/.test(chunk)) {
			parts.shift()
		}
		if (i < chunks.length - 1 && !/\s$/.test(chunk)) {
			parts.pop()
		}
		return parts.filter(Boolean)
	})
}

function parse(file: string, source: string): ts.SourceFile {
	return ts.createSourceFile(
		file,
		source,
		ts.ScriptTarget.Latest,
		true,
		file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
	)
}

function classLiterals(sourceFile: ts.SourceFile): ClassLiteral[] {
	const found: ClassLiteral[] = []
	const visit = (node: ts.Node): void => {
		if (isClassLiteral(node)) {
			found.push(node)
		}
		ts.forEachChild(node, visit)
	}
	visit(sourceFile)
	return found
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
		const sourceFile = parse(file, await readFile(file, 'utf8'))
		for (const literal of classLiterals(sourceFile)) {
			const tokens = literalTokens(literal)
			if (tokens.length === 0 || !tokens.every(t => CLASS_TOKEN.test(t))) {
				continue
			}
			const css = toCss(tokens)
			const resolved = tokens.filter((t, i) => known(t, css[i]))
			const isAttr = isClassNameValue(literal)
			if (resolved.length === tokens.length) {
				continue
			}
			if (resolved.length === 0 && !isAttr) {
				continue
			}
			const { line } = sourceFile.getLineAndCharacterOfPosition(
				literal.getStart(sourceFile)
			)
			tokens.forEach((token, i) => {
				if (!known(token, css[i]) && (isAttr || /[-:]/.test(token))) {
					unknown.push({ file, line: line + 1, token })
				}
			})
		}
	}
	return unknown
}

// Fixture source writes an interpolation as #{x} so it reads as source
// text, not as a placeholder in a plain string.
function literalsIn(source: string): string[][] {
	const tsx = source.replaceAll('#{', '${')
	return classLiterals(parse('fixture.tsx', tsx)).map(literalTokens)
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

	describe('literal extraction', () => {
		test('reads template text around interpolations, not glued tokens', () => {
			const [tokens] = literalsIn('const c = `p-4 #{a} m-#{n} gap-2 w-#{w}`')
			expect(tokens).toEqual(['p-4', 'gap-2'])
		})

		test('reads multi-line templates and strings nested inside them', () => {
			const literals = literalsIn(
				"<div className={`rounded-xl border #{\n\ton ? 'bg-card' : 'bg-muted'\n}`} />"
			)
			expect(literals).toEqual([
				['rounded-xl', 'border'],
				['bg-card'],
				['bg-muted']
			])
		})

		test('skips comments, JSX text, tagged templates and module paths', () => {
			const literals = literalsIn(
				[
					"import { cn } from '@/lib/utils'",
					'// className="gap-x-bogus"',
					'const q = sql`count(*) filter (where #{x}) 0)::float8`',
					"const el = <p>Don't gap-x-bogus</p>"
				].join('\n')
			)
			expect(literals).toEqual([])
		})
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
