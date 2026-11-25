import { describe, expect, test } from 'bun:test'
import {
	DEFAULT_LIFT_PERCENT,
	formatLabValue,
	indefiniteArticle,
	isGoodLabValue,
	LAB_METRICS,
	revenueScenario,
	scoreBand
} from '@/lib/performance-calculator'

describe('scoreBand (Lighthouse performance bands)', () => {
	test('0 to 49 is Poor, 50 to 89 Needs Improvement, 90 to 100 Good', () => {
		expect(scoreBand(0)).toBe('Poor')
		expect(scoreBand(49)).toBe('Poor')
		expect(scoreBand(50)).toBe('Needs Improvement')
		expect(scoreBand(89)).toBe('Needs Improvement')
		expect(scoreBand(90)).toBe('Good')
		expect(scoreBand(100)).toBe('Good')
	})
})

describe('lab metric thresholds', () => {
	const guide = (key: string) => {
		const found = LAB_METRICS.find(m => m.key === key)
		if (!found) {
			throw new Error(`missing ${key}`)
		}
		return found
	}

	test('LCP 2.5 s, CLS 0.1 and FCP 1.8 s are inclusive', () => {
		expect(isGoodLabValue(guide('lcp'), 2500)).toBe(true)
		expect(isGoodLabValue(guide('lcp'), 2501)).toBe(false)
		expect(isGoodLabValue(guide('cls'), 0.1)).toBe(true)
		expect(isGoodLabValue(guide('fcp'), 1800)).toBe(true)
	})

	test('TBT must be under 200 ms', () => {
		expect(isGoodLabValue(guide('tbt'), 199)).toBe(true)
		expect(isGoodLabValue(guide('tbt'), 200)).toBe(false)
	})

	test('a missing value is unknown, not a pass or fail', () => {
		expect(isGoodLabValue(guide('lcp'), null)).toBeNull()
	})
})

describe('formatLabValue (QA-15: the shown value matches the verdict)', () => {
	const guide = (key: string) => {
		const found = LAB_METRICS.find(m => m.key === key)
		if (!found) {
			throw new Error(`missing ${key}`)
		}
		return found
	}
	// displayValue is Lighthouse's own rounded text (TBT to 10 ms)
	const show = (key: string, numericValue: number | null, displayValue = '') =>
		formatLabValue(guide(key), { numericValue, displayValue })

	test('TBT 196 ms shows 196 ms and is met (Lighthouse showed 200 ms)', () => {
		expect(show('tbt', 196, '200 ms')).toBe('196 ms')
		expect(isGoodLabValue(guide('tbt'), 196)).toBe(true)
	})

	test('TBT rounds down, so the 200 ms threshold never flips', () => {
		expect(show('tbt', 199.6)).toBe('199 ms')
		expect(isGoodLabValue(guide('tbt'), 199.6)).toBe(true)
		expect(show('tbt', 200)).toBe('200 ms')
		expect(isGoodLabValue(guide('tbt'), 200)).toBe(false)
		expect(show('tbt', 208, '210 ms')).toBe('208 ms')
		expect(isGoodLabValue(guide('tbt'), 208)).toBe(false)
		expect(show('tbt', 1234.5)).toBe('1,234 ms')
	})

	test('LCP and FCP round up to 0.01 s', () => {
		expect(show('lcp', 2500)).toBe('2.50 s')
		expect(isGoodLabValue(guide('lcp'), 2500)).toBe(true)
		expect(show('lcp', 2501)).toBe('2.51 s')
		expect(isGoodLabValue(guide('lcp'), 2501)).toBe(false)
		expect(show('lcp', 2549, '2.5 s')).toBe('2.55 s')
		expect(show('fcp', 1800)).toBe('1.80 s')
		expect(isGoodLabValue(guide('fcp'), 1800)).toBe(true)
		expect(show('fcp', 1801)).toBe('1.81 s')
		expect(isGoodLabValue(guide('fcp'), 1801)).toBe(false)
	})

	test('a value a hair past the threshold still shows past it', () => {
		expect(show('lcp', 2500.0000001)).toBe('2.51 s')
		expect(show('tbt', 199.99999999999)).toBe('199 ms')
	})

	test('CLS rounds up to 3 decimals without float noise', () => {
		expect(show('cls', 0.1)).toBe('0.1')
		expect(isGoodLabValue(guide('cls'), 0.1)).toBe(true)
		expect(show('cls', 0.1004)).toBe('0.101')
		expect(isGoodLabValue(guide('cls'), 0.1004)).toBe(false)
		expect(show('cls', 0.07)).toBe('0.07')
		expect(show('cls', 0)).toBe('0')
	})

	test('falls back to displayValue without a numericValue', () => {
		expect(show('tbt', null, '210 ms')).toBe('210 ms')
	})
})

describe('revenueScenario', () => {
	test('10,000 visitors, 2%, $150 at the default lift', () => {
		expect(DEFAULT_LIFT_PERCENT).toBe(8.4)
		const s = revenueScenario({
			monthlyVisitors: 10_000,
			conversionRatePercent: 2,
			averageOrderValue: 150,
			liftPercent: DEFAULT_LIFT_PERCENT
		})
		expect(s.monthlyRevenue).toBeCloseTo(30_000, 6)
		expect(s.scenarioConversionRatePercent).toBeCloseTo(2.168, 6)
		expect(s.monthlyGain).toBeCloseTo(2520, 6)
		expect(s.annualGain).toBeCloseTo(30_240, 6)
		expect(s.capped).toBe(false)
	})

	test('caps the lifted conversion rate at 100%', () => {
		const s = revenueScenario({
			monthlyVisitors: 100,
			conversionRatePercent: 95,
			averageOrderValue: 10,
			liftPercent: 50
		})
		expect(s.scenarioConversionRatePercent).toBe(100)
		expect(s.monthlyRevenue).toBeCloseTo(950, 6)
		expect(s.monthlyGain).toBeCloseTo(50, 6)
		expect(s.capped).toBe(true)
	})

	test('a zero conversion rate has nothing to lift', () => {
		const s = revenueScenario({
			monthlyVisitors: 5000,
			conversionRatePercent: 0,
			averageOrderValue: 100,
			liftPercent: 10
		})
		expect(s.monthlyRevenue).toBe(0)
		expect(s.monthlyGain).toBe(0)
	})
})

describe('indefiniteArticle', () => {
	test('reads the number aloud: an 8.4%, an 11%, an 18%, an 80%, a 20%', () => {
		expect(indefiniteArticle(8.4)).toBe('an')
		expect(indefiniteArticle(11)).toBe('an')
		expect(indefiniteArticle(18)).toBe('an')
		expect(indefiniteArticle(80)).toBe('an')
		expect(indefiniteArticle(20)).toBe('a')
		expect(indefiniteArticle(1.8)).toBe('a')
		expect(indefiniteArticle(0)).toBe('a')
	})
})
