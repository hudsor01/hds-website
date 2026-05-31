import { describe, expect, test } from 'bun:test'
import { calculateMargin, priceForMargin } from '@/lib/margin-calculator'

describe('calculateMargin', () => {
	test('basic margin and markup', () => {
		const r = calculateMargin(60, 100)
		expect(r.profit).toBe(40)
		expect(r.marginPercent).toBeCloseTo(40)
		expect(r.markupPercent).toBeCloseTo(66.6667, 3)
	})

	test('margin and markup differ (the core point of the tool)', () => {
		const r = calculateMargin(80, 100)
		expect(r.marginPercent).toBeCloseTo(20) // profit / price
		expect(r.markupPercent).toBeCloseTo(25) // profit / cost
	})

	test('selling at cost is zero margin/markup', () => {
		const r = calculateMargin(50, 50)
		expect(r.profit).toBe(0)
		expect(r.marginPercent).toBe(0)
		expect(r.markupPercent).toBe(0)
	})

	test('selling below cost is a loss (negative)', () => {
		const r = calculateMargin(100, 80)
		expect(r.profit).toBe(-20)
		expect(r.marginPercent).toBeCloseTo(-25)
		expect(r.markupPercent).toBeCloseTo(-20)
	})

	test('zero price yields null margin (undefined ratio)', () => {
		expect(calculateMargin(10, 0).marginPercent).toBeNull()
	})

	test('zero cost yields null markup (infinite ratio)', () => {
		const r = calculateMargin(0, 100)
		expect(r.markupPercent).toBeNull()
		expect(r.marginPercent).toBeCloseTo(100)
	})

	test('non-finite inputs are handled', () => {
		const r = calculateMargin(Number.NaN, 100)
		expect(r.marginPercent).toBeNull()
		expect(r.markupPercent).toBeNull()
	})
})

describe('priceForMargin', () => {
	test('price needed for a target margin', () => {
		// 40% margin on $60 cost -> $100 price
		expect(priceForMargin(60, 40)).toBeCloseTo(100)
	})

	test('unreachable margin (>=100%) returns null', () => {
		expect(priceForMargin(60, 100)).toBeNull()
		expect(priceForMargin(60, 150)).toBeNull()
	})

	test('negative target margin returns null (no sell-below-cost price)', () => {
		expect(priceForMargin(60, -50)).toBeNull()
		expect(priceForMargin(60, -1)).toBeNull()
	})

	test('valid positive target still works after the guard', () => {
		expect(priceForMargin(60, 25)).toBeCloseTo(80)
	})
})
