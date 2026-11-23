import { describe, expect, test } from 'bun:test'
import {
	calculateTip,
	isValidTipPercent,
	tipCentsFor,
	toCents
} from '@/lib/tip-calculator'

describe('tipCentsFor', () => {
	test('rounds a true half cent up ($47.30 at 15% = $7.095)', () => {
		expect(tipCentsFor(4730, 15)).toBe(710)
	})

	test('rounds a true half cent up ($33.50 at 15% = $5.025)', () => {
		expect(tipCentsFor(3350, 15)).toBe(503)
	})

	test('decimal percent', () => {
		// $80.00 at 17.5% = $14.00
		expect(tipCentsFor(8000, 17.5)).toBe(1400)
		// $10.00 at 12.345% -> 12.35% (hundredths of a percent) = $1.235 -> $1.24
		expect(tipCentsFor(1000, 12.345)).toBe(124)
	})

	test('0% and 100%', () => {
		expect(tipCentsFor(4730, 0)).toBe(0)
		expect(tipCentsFor(4730, 100)).toBe(4730)
	})
})

describe('toCents', () => {
	test('converts float dollars to whole cents', () => {
		expect(toCents(47.3)).toBe(4730)
		expect(toCents(0.1 + 0.2)).toBe(30)
	})
})

describe('isValidTipPercent', () => {
	test('accepts 0 to 100 with decimals', () => {
		expect(isValidTipPercent(0)).toBe(true)
		expect(isValidTipPercent(17.5)).toBe(true)
		expect(isValidTipPercent(100)).toBe(true)
	})

	test('rejects negative, over 100 and non-finite', () => {
		expect(isValidTipPercent(-1)).toBe(false)
		expect(isValidTipPercent(-0.01)).toBe(false)
		expect(isValidTipPercent(100.01)).toBe(false)
		expect(isValidTipPercent(150)).toBe(false)
		expect(isValidTipPercent(Number.NaN)).toBe(false)
		expect(isValidTipPercent(Number.POSITIVE_INFINITY)).toBe(false)
	})
})

describe('calculateTip', () => {
	test('total equals bill plus the rounded tip ($47.30 at 15%)', () => {
		const r = calculateTip({ billAmount: 47.3, tipPercent: 15, splitCount: 1 })
		expect(r?.tipCents).toBe(710)
		expect(r?.totalCents).toBe(5440)
	})

	test('$33.50 at 15%', () => {
		const r = calculateTip({ billAmount: 33.5, tipPercent: 15, splitCount: 1 })
		expect(r?.tipCents).toBe(503)
		expect(r?.totalCents).toBe(3853)
	})

	test('even split has no remainder ($47.30 at 15%, 2 people)', () => {
		const r = calculateTip({ billAmount: 47.3, tipPercent: 15, splitCount: 2 })
		expect(r?.perPersonTotalCents).toBe(2720)
		expect(r?.perPersonTipCents).toBe(355)
		expect(r?.perPersonBillCents).toBe(2365)
		expect(r?.remainderCents).toBe(0)
	})

	test('uneven split reports the remainder ($100 at 18%, 3 people)', () => {
		const r = calculateTip({ billAmount: 100, tipPercent: 18, splitCount: 3 })
		expect(r?.totalCents).toBe(11800)
		expect(r?.perPersonTotalCents).toBe(3933)
		expect(r?.perPersonTipCents).toBe(600)
		expect(r?.perPersonBillCents).toBe(3333)
		expect(r?.remainderCents).toBe(1)
	})

	test('shares always reconcile with the total', () => {
		for (const billAmount of [0.01, 9.99, 47.3, 100, 123.45, 999.99]) {
			for (const tipPercent of [0, 15, 18, 20, 22.5]) {
				for (let splitCount = 1; splitCount <= 20; splitCount++) {
					const r = calculateTip({ billAmount, tipPercent, splitCount })
					if (!r) {
						throw new Error('expected a result')
					}
					expect(r.remainderCents).toBeGreaterThanOrEqual(0)
					expect(r.remainderCents).toBeLessThan(splitCount)
					expect(r.perPersonTotalCents * splitCount + r.remainderCents).toBe(
						r.totalCents
					)
					expect(r.perPersonBillCents + r.perPersonTipCents).toBe(
						r.perPersonTotalCents
					)
				}
			}
		}
	})

	test('rejects out-of-range inputs', () => {
		expect(
			calculateTip({ billAmount: -1, tipPercent: 15, splitCount: 1 })
		).toBeNull()
		expect(
			calculateTip({ billAmount: Number.NaN, tipPercent: 15, splitCount: 1 })
		).toBeNull()
		expect(
			calculateTip({ billAmount: 50, tipPercent: -5, splitCount: 1 })
		).toBeNull()
		expect(
			calculateTip({ billAmount: 50, tipPercent: 101, splitCount: 1 })
		).toBeNull()
		expect(
			calculateTip({ billAmount: 50, tipPercent: 15, splitCount: 0 })
		).toBeNull()
		expect(
			calculateTip({ billAmount: 50, tipPercent: 15, splitCount: 21 })
		).toBeNull()
		expect(
			calculateTip({ billAmount: 50, tipPercent: 15, splitCount: 2.5 })
		).toBeNull()
	})
})
