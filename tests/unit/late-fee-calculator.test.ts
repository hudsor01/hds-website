import { describe, expect, test } from 'bun:test'
import { calculateLateFee } from '@/lib/late-fee-calculator'

describe('calculateLateFee', () => {
	test('flat fee once overdue', () => {
		const r = calculateLateFee({
			amount: 1000,
			mode: 'flat',
			flatFee: 25,
			daysOverdue: 10
		})
		expect(r.lateFee).toBe(25)
		expect(r.total).toBe(1025)
		expect(r.effectiveDays).toBe(10)
	})

	test('percent: 1.5% per month, one month overdue', () => {
		const r = calculateLateFee({
			amount: 1000,
			mode: 'percent',
			percentRate: 1.5,
			period: 'month',
			daysOverdue: 30
		})
		expect(r.periods).toBeCloseTo(1)
		expect(r.lateFee).toBeCloseTo(15)
		expect(r.total).toBeCloseTo(1015)
	})

	test('percent prorates fractional periods', () => {
		const r = calculateLateFee({
			amount: 1000,
			mode: 'percent',
			percentRate: 1.5,
			period: 'month',
			daysOverdue: 45
		})
		expect(r.periods).toBeCloseTo(1.5)
		expect(r.lateFee).toBeCloseTo(22.5)
	})

	test('percent daily rate', () => {
		const r = calculateLateFee({
			amount: 500,
			mode: 'percent',
			percentRate: 0.1,
			period: 'day',
			daysOverdue: 10
		})
		expect(r.periods).toBeCloseTo(10)
		expect(r.lateFee).toBeCloseTo(5)
	})

	test('grace period suppresses the fee until passed', () => {
		const within = calculateLateFee({
			amount: 1000,
			mode: 'flat',
			flatFee: 25,
			daysOverdue: 5,
			gracePeriodDays: 7
		})
		expect(within.lateFee).toBe(0)
		expect(within.total).toBe(1000)

		const past = calculateLateFee({
			amount: 1000,
			mode: 'flat',
			flatFee: 25,
			daysOverdue: 10,
			gracePeriodDays: 7
		})
		expect(past.effectiveDays).toBe(3)
		expect(past.lateFee).toBe(25)
	})

	test('not overdue: no fee, total is the amount', () => {
		const r = calculateLateFee({
			amount: 1000,
			mode: 'percent',
			percentRate: 5,
			daysOverdue: 0
		})
		expect(r.lateFee).toBe(0)
		expect(r.total).toBe(1000)
	})

	test('negative / invalid inputs do not produce negative fees', () => {
		const r = calculateLateFee({
			amount: 1000,
			mode: 'flat',
			flatFee: -50,
			daysOverdue: 10
		})
		expect(r.lateFee).toBe(0)

		const neg = calculateLateFee({
			amount: -100,
			mode: 'percent',
			percentRate: 5,
			daysOverdue: 30
		})
		expect(neg.lateFee).toBe(0)
		expect(neg.total).toBe(0)
	})
})
