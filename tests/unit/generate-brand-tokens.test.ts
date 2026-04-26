/**
 * Unit tests for the OKLCH -> sRGB conversion in scripts/generate-brand-tokens.ts.
 *
 * Reference values were computed once with culori (the canonical sRGB
 * converter) for the actual tokens in src/app/globals.css. If the
 * hand-rolled math drifts from culori, these assertions fail.
 *
 * To regenerate references: `bun run scripts/_compute-references.ts`
 */
import { describe, expect, test } from 'bun:test'
import { oklchToHex } from '../../scripts/generate-brand-tokens'

describe('oklchToHex (Bjorn Ottosson formulas)', () => {
	test('--color-primary: oklch(0.38 0.12 255) -> #064180', () => {
		expect(oklchToHex({ l: 0.38, c: 0.12, h: 255 })).toBe('#064180')
	})

	test('--color-accent: oklch(0.72 0.16 55) -> #ef852e', () => {
		expect(oklchToHex({ l: 0.72, c: 0.16, h: 55 })).toBe('#ef852e')
	})

	test('--color-foreground: oklch(0.145 0.015 260) -> #070a10', () => {
		expect(oklchToHex({ l: 0.145, c: 0.015, h: 260 })).toBe('#070a10')
	})

	test('--color-muted-foreground: oklch(0.45 0.02 255) -> #4e5661', () => {
		expect(oklchToHex({ l: 0.45, c: 0.02, h: 255 })).toBe('#4e5661')
	})

	test('--color-border: oklch(0.88 0.015 255) -> #d1d8e1', () => {
		expect(oklchToHex({ l: 0.88, c: 0.015, h: 255 })).toBe('#d1d8e1')
	})

	test('--color-muted: oklch(0.955 0.008 90) -> #f2f0ea', () => {
		expect(oklchToHex({ l: 0.955, c: 0.008, h: 90 })).toBe('#f2f0ea')
	})

	test('--color-background: oklch(0.985 0.002 90) -> #fafaf9', () => {
		expect(oklchToHex({ l: 0.985, c: 0.002, h: 90 })).toBe('#fafaf9')
	})

	test('--color-card: oklch(0.995 0.001 90) -> #fefdfd', () => {
		expect(oklchToHex({ l: 0.995, c: 0.001, h: 90 })).toBe('#fefdfd')
	})

	test('--color-secondary: oklch(0.94 0.01 255) -> #e7ecf2', () => {
		expect(oklchToHex({ l: 0.94, c: 0.01, h: 255 })).toBe('#e7ecf2')
	})

	test('--color-ring: oklch(0.55 0.15 255) -> #2971c6', () => {
		expect(oklchToHex({ l: 0.55, c: 0.15, h: 255 })).toBe('#2971c6')
	})
})
