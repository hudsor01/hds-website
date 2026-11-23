import { describe, expect, test } from 'bun:test'
import {
	calculateRoi,
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
