#!/usr/bin/env bun
/**
 * Generate src/lib/_generated/brand.ts from src/app/globals.css.
 *
 * Reads the @theme {} block, parses every --color-* oklch() token, converts
 * to sRGB hex via hand-rolled Bjorn Ottosson math (no runtime dependency),
 * and emits a typed BRAND constant for consumers that cannot read CSS
 * (React-PDF StyleSheets, React Email JSX inline styles, meta tags,
 * manifest.json mirrors).
 *
 * globals.css is the literal single source of truth. This script is the
 * mechanical bridge to JS-side runtimes. When globals.css changes, this
 * script runs in lefthook's pre-commit hook and the regenerated file is
 * re-staged before the commit lands.
 *
 * Run with: bun run brand:generate
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

interface OklchInput {
	l: number
	c: number
	h: number
}

const SRC = 'src/app/globals.css'
const OUT = 'src/lib/_generated/brand.ts'

export function oklchToHex({ l, c, h }: OklchInput): string {
	const aLab = c * Math.cos((h * Math.PI) / 180)
	const bLab = c * Math.sin((h * Math.PI) / 180)

	const lCubed = (l + 0.3963377774 * aLab + 0.2158037573 * bLab) ** 3
	const mCubed = (l - 0.1055613458 * aLab - 0.0638541728 * bLab) ** 3
	const sCubed = (l - 0.0894841775 * aLab - 1.291485548 * bLab) ** 3

	const rLin =
		4.0767416621 * lCubed - 3.3077115913 * mCubed + 0.2309699292 * sCubed
	const gLin =
		-1.2684380046 * lCubed + 2.6097574011 * mCubed - 0.3413193965 * sCubed
	const bLin =
		-0.0041960863 * lCubed - 0.7034186147 * mCubed + 1.707614701 * sCubed

	const toSrgb = (x: number) =>
		x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055

	const channel = (x: number) =>
		Math.round(Math.min(1, Math.max(0, toSrgb(x))) * 255)

	const r = channel(rLin)
	const g = channel(gLin)
	const b = channel(bLin)

	return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`
}

function parseOklchValue(raw: string): OklchInput {
	const parts = raw.trim().split(/\s+/)
	const [lRaw, cRaw, hRaw] = parts
	if (lRaw === undefined || cRaw === undefined || hRaw === undefined) {
		throw new Error(`Expected "L C H" oklch arguments, got: ${raw}`)
	}
	const l = lRaw.endsWith('%') ? parseFloat(lRaw) / 100 : parseFloat(lRaw)
	const c = parseFloat(cRaw)
	const h = parseFloat(hRaw)
	if (Number.isNaN(l) || Number.isNaN(c) || Number.isNaN(h)) {
		throw new Error(`Failed to parse oklch arguments: ${raw}`)
	}
	return { l, c, h }
}

function kebabToCamel(s: string): string {
	return s.replace(/-([a-z0-9])/g, (_, ch: string) => ch.toUpperCase())
}

interface ParsedToken {
	cssName: string
	jsName: string
	hex: string
}

function parseThemeBlock(
	css: string,
	blockName: '@theme' | '.dark'
): ParsedToken[] {
	const header = `${blockName} {`
	const headerStart = css.indexOf(header)
	if (headerStart === -1) {
		if (blockName === '@theme') {
			throw new Error('No @theme {} block found in globals.css')
		}
		return []
	}
	const bodyStart = headerStart + header.length
	let depth = 1
	let blockEnd = -1
	for (let i = bodyStart; i < css.length; i++) {
		const ch = css[i]
		if (ch === '{') {
			depth++
		} else if (ch === '}') {
			depth--
			if (depth === 0) {
				blockEnd = i
				break
			}
		}
	}
	if (blockEnd === -1) {
		throw new Error(`Could not find closing brace for ${blockName} block`)
	}
	const body = css.slice(bodyStart, blockEnd)

	const tokens: ParsedToken[] = []
	const tokenRegex = /^\s*(--color-[a-z0-9-]+):\s*oklch\(\s*([^)]+?)\s*\)\s*;/gm
	for (const match of body.matchAll(tokenRegex)) {
		const cssName = match[1]
		const oklchArgs = match[2]
		if (cssName === undefined || oklchArgs === undefined) {
			continue
		}
		try {
			const oklch = parseOklchValue(oklchArgs)
			const hex = oklchToHex(oklch)
			const jsName = kebabToCamel(cssName.replace(/^--color-/, ''))
			tokens.push({ cssName, jsName, hex })
		} catch (err) {
			throw new Error(`${cssName}: ${(err as Error).message}`)
		}
	}
	return tokens
}

function emit(lightTokens: ParsedToken[], darkTokens: ParsedToken[]): string {
	const ts = new Date().toISOString()
	const lines: string[] = [
		'// AUTO-GENERATED FROM src/app/globals.css — DO NOT EDIT MANUALLY.',
		'// Regenerate with: bun run brand:generate',
		'//',
		'// Source: src/app/globals.css @theme {} (light) and .dark {} (dark)',
		'// Conversion: OKLCH -> sRGB hex (Bjorn Ottosson formulas, hand-rolled, no deps)',
		`// Last generated: ${ts}`,
		'',
		'export const BRAND = {'
	]
	for (const t of lightTokens) {
		lines.push(`\t${t.jsName}: '${t.hex}', // ${t.cssName}`)
	}
	lines.push('} as const', '')

	if (darkTokens.length > 0) {
		lines.push('export const BRAND_DARK = {')
		for (const t of darkTokens) {
			lines.push(`\t${t.jsName}: '${t.hex}', // ${t.cssName} (dark)`)
		}
		lines.push('} as const', '')
	}

	lines.push(
		'export type BrandColor = keyof typeof BRAND',
		darkTokens.length > 0
			? 'export type BrandColorDark = keyof typeof BRAND_DARK'
			: '',
		''
	)
	return lines.filter(l => l !== undefined).join('\n')
}

function stripTimestamp(content: string): string {
	return content.replace(
		/^\/\/ Last generated: .+$/m,
		'// Last generated: <pinned>'
	)
}

function main(): void {
	const css = readFileSync(SRC, 'utf8')
	const lightTokens = parseThemeBlock(css, '@theme')
	const darkTokens = parseThemeBlock(css, '.dark')

	const newContent = emit(lightTokens, darkTokens)

	let existing = ''
	try {
		existing = readFileSync(OUT, 'utf8')
	} catch {
		// not yet generated; that's fine
	}

	const summary = `${lightTokens.length} light + ${darkTokens.length} dark tokens`

	if (existing && stripTimestamp(existing) === stripTimestamp(newContent)) {
		process.stdout.write(`brand.ts unchanged (${summary})\n`)
		return
	}

	mkdirSync(dirname(OUT), { recursive: true })
	writeFileSync(OUT, newContent, 'utf8')
	process.stdout.write(`Generated ${OUT} (${summary})\n`)
}

if (import.meta.main) {
	main()
}
