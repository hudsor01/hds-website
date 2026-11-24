import { describe, expect, test } from 'bun:test'
import { calculateMargin, priceForMargin } from '@/lib/margin-calculator'

describe('calculateMargin', () => {
	test('basic margin and markup', () => {
		const r = calculateMargin(60, 100)
		expect(r.profit).toBe(40)
		expect(r.marginPercent).toBeCloseTo(40)
		expect(r.markupPercent).toBe(66.67)
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

	test('percent rounds a true half up (197.99 -> 200 is 1.005%)', () => {
		const r = calculateMargin(197.99, 200)
		expect(r.profit).toBe(2.01)
		expect(r.marginPercent).toBe(1.01)
		// 2.01 / 197.99 = 1.01520...%
		expect(r.markupPercent).toBe(1.02)
	})

	test('negative halves round away from zero', () => {
		// profit -2.01 on price 200 is -1.005%
		const r = calculateMargin(202.01, 200)
		expect(r.profit).toBe(-2.01)
		expect(r.marginPercent).toBe(-1.01)
	})

	test('profit is rounded to the cent', () => {
		expect(calculateMargin(0.1, 0.3).profit).toBe(0.2)
		expect(calculateMargin(10.004, 20).profit).toBe(10)
	})

	test('a sub-cent loss is zero, never negative zero', () => {
		const r = calculateMargin(100.001, 100)
		expect(Object.is(r.profit, 0)).toBe(true)
		expect(Object.is(r.marginPercent, 0)).toBe(true)
		expect(Object.is(r.markupPercent, 0)).toBe(true)
	})

	test('sub-cent unit costs still produce a margin', () => {
		// $0.125 cost sold at $0.25 is a 50% margin and 100% markup
		const r = calculateMargin(0.125, 0.25)
		expect(r.marginPercent).toBe(50)
		expect(r.markupPercent).toBe(100)
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

	test('rounds UP to the cent so the margin is never below target', () => {
		// 10 / 0.65 = 15.3846...; $15.38 would be a 34.98% margin
		expect(priceForMargin(10, 35)).toBe(15.39)
		const margin = calculateMargin(10, 15.39).marginPercent ?? 0
		expect(margin).toBeGreaterThanOrEqual(35)
	})

	test('exact results are not bumped a cent by float noise', () => {
		expect(priceForMargin(60, 40)).toBe(100)
		expect(priceForMargin(70, 30)).toBe(100)
		expect(priceForMargin(10, 0)).toBe(10)
	})

	test('cost must be above 0', () => {
		expect(priceForMargin(0, 40)).toBeNull()
		expect(priceForMargin(-60, 40)).toBeNull()
	})

	test('non-finite inputs return null', () => {
		expect(priceForMargin(Number.NaN, 40)).toBeNull()
		expect(priceForMargin(60, Number.NaN)).toBeNull()
	})
})
