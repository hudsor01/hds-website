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

	test('fee is rounded half up once and the total reconciles ($549)', () => {
		// 549 * 1.5% * 10 / 30 = 2.745 exactly
		const r = calculateLateFee({
			amount: 549,
			mode: 'percent',
			percentRate: 1.5,
			period: 'month',
			daysOverdue: 10
		})
		expect(r.lateFee).toBe(2.75)
		expect(r.total).toBe(551.75)
	})

	test('half cent rounds up where the float would round down ($138)', () => {
		// 138 * 1.5% * 45 / 30 = 3.105 exactly (float gives 3.10499...)
		const r = calculateLateFee({
			amount: 138,
			mode: 'percent',
			percentRate: 1.5,
			period: 'month',
			daysOverdue: 45
		})
		expect(r.lateFee).toBe(3.11)
		expect(r.total).toBe(141.11)
	})

	test('weekly rate with a grace period', () => {
		// 20 days, 6 grace -> 14 chargeable days = 2 weeks at 2%
		const r = calculateLateFee({
			amount: 2500,
			mode: 'percent',
			percentRate: 2,
			period: 'week',
			daysOverdue: 20,
			gracePeriodDays: 6
		})
		expect(r.effectiveDays).toBe(14)
		expect(r.periods).toBe(2)
		expect(r.lateFee).toBe(100)
		expect(r.total).toBe(2600)
	})

	test('percent with grace prorates only the days after grace', () => {
		// 40 days, 10 grace -> 30 days = 1 month at 1.5% on $1,000
		const r = calculateLateFee({
			amount: 1000,
			mode: 'percent',
			percentRate: 1.5,
			period: 'month',
			daysOverdue: 40,
			gracePeriodDays: 10
		})
		expect(r.effectiveDays).toBe(30)
		expect(r.lateFee).toBe(15)
		expect(r.total).toBe(1015)
	})

	test('days equal to grace is still within grace', () => {
		const r = calculateLateFee({
			amount: 1000,
			mode: 'percent',
			percentRate: 1.5,
			daysOverdue: 7,
			gracePeriodDays: 7
		})
		expect(r.effectiveDays).toBe(0)
		expect(r.lateFee).toBe(0)
		expect(r.total).toBe(1000)

		const oneDayPast = calculateLateFee({
			amount: 1000,
			mode: 'flat',
			flatFee: 25,
			daysOverdue: 8,
			gracePeriodDays: 7
		})
		expect(oneDayPast.effectiveDays).toBe(1)
		expect(oneDayPast.lateFee).toBe(25)
	})

	test('NaN rate is treated as no fee', () => {
		const r = calculateLateFee({
			amount: 1000,
			mode: 'percent',
			percentRate: Number.NaN,
			daysOverdue: 30
		})
		expect(r.lateFee).toBe(0)
		expect(r.total).toBe(1000)
	})

	test('fractional and negative days are whole, non-negative days', () => {
		const fractional = calculateLateFee({
			amount: 1000,
			mode: 'percent',
			percentRate: 3,
			period: 'month',
			daysOverdue: 10.9,
			gracePeriodDays: 0.5
		})
		expect(fractional.effectiveDays).toBe(10)
		expect(fractional.lateFee).toBe(10)

		const negativeGrace = calculateLateFee({
			amount: 1000,
			mode: 'flat',
			flatFee: 25,
			daysOverdue: 5,
			gracePeriodDays: -10
		})
		expect(negativeGrace.effectiveDays).toBe(5)

		const negativeDays = calculateLateFee({
			amount: 1000,
			mode: 'flat',
			flatFee: 25,
			daysOverdue: -5
		})
		expect(negativeDays.lateFee).toBe(0)
		expect(negativeDays.total).toBe(1000)
	})

	test('a month is 30 days, so 1.5% a month over 365 days is 18.25%', () => {
		const r = calculateLateFee({
			amount: 1000,
			mode: 'percent',
			percentRate: 1.5,
			period: 'month',
			daysOverdue: 365
		})
		expect(r.lateFee).toBe(182.5)
	})

	test('flat fee is rounded to the cent', () => {
		const r = calculateLateFee({
			amount: 100.1,
			mode: 'flat',
			flatFee: 0.2,
			daysOverdue: 1
		})
		expect(r.lateFee).toBe(0.2)
		expect(r.total).toBe(100.3)
	})
})
