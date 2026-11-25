import { describe, expect, test } from 'bun:test'
import {
	calculateRoi,
	formatRoiMoney,
	formatRoiPercent,
	MAX_IMPROVEMENT,
	MAX_INVESTMENT,
	MAX_MONTHLY_TRAFFIC,
	MAX_ORDER_VALUE,
	parseRoiInput,
	type RoiRawInput
} from '@/lib/roi-calculator'

const RAW: RoiRawInput = {
	monthlyTraffic: '10000',
	conversionRate: '2',
	averageOrderValue: '150',
	improvementPercentage: '20',
	investment: ''
}

describe('parseRoiInput', () => {
	test('parses a complete input without an investment', () => {
		expect(parseRoiInput(RAW)).toEqual({
			status: 'ok',
			data: {
				monthlyTraffic: 10000,
				conversionRate: 2,
				averageOrderValue: 150,
				improvementPercentage: 20,
				investment: null
			}
		})
	})

	test('keeps decimals instead of rounding them', () => {
		const parsed = parseRoiInput({
			...RAW,
			monthlyTraffic: '1500.5',
			improvementPercentage: '12.5'
		})
		expect(parsed.status).toBe('ok')
		if (parsed.status === 'ok') {
			expect(parsed.data.monthlyTraffic).toBe(1500.5)
			expect(parsed.data.improvementPercentage).toBe(12.5)
		}
	})

	test('a blank required field is incomplete with no error', () => {
		expect(parseRoiInput({ ...RAW, averageOrderValue: '' })).toEqual({
			status: 'incomplete',
			errors: {}
		})
		expect(parseRoiInput({ ...RAW, improvementPercentage: '  ' })).toEqual({
			status: 'incomplete',
			errors: {}
		})
	})

	test('rejects out-of-range and non-numeric values', () => {
		const parsed = parseRoiInput({
			monthlyTraffic: '-5',
			conversionRate: '101',
			averageOrderValue: 'abc',
			improvementPercentage: '0',
			investment: '0'
		})
		expect(parsed.status).toBe('invalid')
		if (parsed.status === 'invalid') {
			expect(Object.keys(parsed.errors).sort()).toEqual([
				'averageOrderValue',
				'conversionRate',
				'improvementPercentage',
				'investment',
				'monthlyTraffic'
			])
		}
	})

	test('accepts a 100% conversion rate', () => {
		expect(parseRoiInput({ ...RAW, conversionRate: '100' }).status).toBe('ok')
	})

	test('parses an optional investment', () => {
		const parsed = parseRoiInput({ ...RAW, investment: '15000' })
		expect(parsed.status).toBe('ok')
		if (parsed.status === 'ok') {
			expect(parsed.data.investment).toBe(15000)
		}
	})
})

describe('calculateRoi', () => {
	const base = {
		monthlyTraffic: 10000,
		conversionRate: 2,
		averageOrderValue: 150,
		improvementPercentage: 20,
		investment: null
	}

	test('applies the improvement as a relative lift', () => {
		const r = calculateRoi(base)
		expect(r.improvedConversionRate).toBeCloseTo(2.4, 10)
		expect(r.improvedRateCapped).toBe(false)
		expect(r.currentMonthlyRevenue).toBeCloseTo(30000, 6)
		expect(r.currentAnnualRevenue).toBeCloseTo(360000, 6)
		expect(r.projectedMonthlyRevenue).toBeCloseTo(36000, 6)
		expect(r.projectedAnnualRevenue).toBeCloseTo(432000, 6)
		expect(r.monthlyIncrease).toBeCloseTo(6000, 6)
		expect(r.annualIncrease).toBeCloseTo(72000, 6)
	})

	test('no investment means no ROI or payback', () => {
		const r = calculateRoi(base)
		expect(r.roiPercentage).toBeNull()
		expect(r.paybackMonths).toBeNull()
	})

	test('ROI and payback come from the investment', () => {
		const r = calculateRoi({ ...base, investment: 15000 })
		// (72,000 - 15,000) / 15,000 = 380%
		expect(r.roiPercentage).toBeCloseTo(380, 6)
		// 15,000 / 6,000 = 2.5 months
		expect(r.paybackMonths).toBeCloseTo(2.5, 6)
	})

	test('ROI goes negative when the spend outruns a year of added revenue', () => {
		const r = calculateRoi({ ...base, investment: 144000 })
		expect(r.roiPercentage).toBeCloseTo(-50, 6)
		expect(r.paybackMonths).toBeCloseTo(24, 6)
	})

	test('caps the improved conversion rate at 100%', () => {
		const r = calculateRoi({
			monthlyTraffic: 1000,
			conversionRate: 40,
			averageOrderValue: 10,
			improvementPercentage: 300,
			investment: null
		})
		expect(r.improvedRateCapped).toBe(true)
		expect(r.improvedConversionRate).toBe(100)
		expect(r.currentMonthlyRevenue).toBeCloseTo(4000, 6)
		expect(r.projectedMonthlyRevenue).toBeCloseTo(10000, 6)
		expect(r.monthlyIncrease).toBeCloseTo(6000, 6)
		expect(r.annualIncrease).toBeCloseTo(72000, 6)
	})

	test('no payback when the rate is already 100%', () => {
		const r = calculateRoi({
			...base,
			conversionRate: 100,
			investment: 1000
		})
		expect(r.monthlyIncrease).toBe(0)
		expect(r.paybackMonths).toBeNull()
		expect(r.roiPercentage).toBe(-100)
	})
})

describe('upper bounds (QA-14)', () => {
	function errorsFor(overrides: Partial<RoiRawInput>) {
		const parsed = parseRoiInput({ ...RAW, ...overrides })
		return parsed.status === 'invalid' ? parsed.errors : {}
	}

	test('rejects 1e12 visitors and one visitor over the maximum', () => {
		for (const monthlyTraffic of ['1e12', '100000001']) {
			expect(errorsFor({ monthlyTraffic })).toEqual({
				monthlyTraffic: 'Enter 100,000,000 visitors or fewer.'
			})
		}
	})

	test('rejects an order value, lift or investment over its maximum', () => {
		expect(errorsFor({ averageOrderValue: '1000001' })).toEqual({
			averageOrderValue: 'Enter a value of $1,000,000 or less.'
		})
		expect(errorsFor({ improvementPercentage: '1001' })).toEqual({
			improvementPercentage: 'Enter a lift of 1,000% or less.'
		})
		expect(errorsFor({ investment: '100000001' })).toEqual({
			investment: 'Enter an amount of $100,000,000 or less, or leave it blank.'
		})
	})

	test('accepts every field at exactly its maximum', () => {
		const parsed = parseRoiInput({
			monthlyTraffic: String(MAX_MONTHLY_TRAFFIC),
			conversionRate: '100',
			averageOrderValue: String(MAX_ORDER_VALUE),
			improvementPercentage: String(MAX_IMPROVEMENT),
			investment: String(MAX_INVESTMENT)
		})
		expect(parsed.status).toBe('ok')
	})

	test('results stay finite at the maximum bounds', () => {
		const result = calculateRoi({
			monthlyTraffic: MAX_MONTHLY_TRAFFIC,
			conversionRate: 50,
			averageOrderValue: MAX_ORDER_VALUE,
			improvementPercentage: MAX_IMPROVEMENT,
			investment: MAX_INVESTMENT
		})
		for (const value of [
			result.projectedAnnualRevenue,
			result.annualIncrease,
			result.roiPercentage ?? 0,
			result.paybackMonths ?? 0
		]) {
			expect(Number.isFinite(value)).toBe(true)
		}
	})
})

describe('formatRoiMoney', () => {
	test('shows dollars and cents below $1,000,000', () => {
		expect(formatRoiMoney(999999.99)).toBe('$999,999.99')
		expect(formatRoiMoney(0)).toBe('$0.00')
	})

	test('switches to compact notation from $1,000,000', () => {
		expect(formatRoiMoney(1_000_000)).toBe('$1M')
		expect(formatRoiMoney(1_250_000)).toBe('$1.25M')
		expect(formatRoiMoney(24e12)).toBe('$24T')
	})
})

describe('formatRoiPercent', () => {
	test('one decimal below 1,000,000%', () => {
		expect(formatRoiPercent(1234.56)).toBe('1,234.6%')
		expect(formatRoiPercent(-50)).toBe('-50%')
	})

	test('compact from 1,000,000%', () => {
		expect(formatRoiPercent(1_500_000)).toBe('1.5M%')
	})
})
