import { describe, expect, test } from 'bun:test'
import {
	calculateTimecard,
	entryHours,
	parseTime
} from '@/lib/timecard-calculator'

describe('parseTime', () => {
	test('parses HH:MM', () => {
		expect(parseTime('09:00')).toBe(540)
		expect(parseTime('17:30')).toBe(1050)
		expect(parseTime('00:00')).toBe(0)
		expect(parseTime('23:59')).toBe(1439)
	})

	test('rejects invalid', () => {
		expect(parseTime('24:00')).toBeNull()
		expect(parseTime('12:60')).toBeNull()
		expect(parseTime('abc')).toBeNull()
		expect(parseTime('')).toBeNull()
		expect(parseTime('9')).toBeNull()
	})
})

describe('entryHours', () => {
	test('basic shift minus break', () => {
		expect(entryHours({ clockIn: '09:00', clockOut: '17:00' })).toBe(8)
		expect(
			entryHours({ clockIn: '09:00', clockOut: '17:00', breakMinutes: 30 })
		).toBe(7.5)
	})

	test('overnight shift rolls over only when flagged', () => {
		expect(
			entryHours({ clockIn: '22:00', clockOut: '06:00', overnight: true })
		).toBe(8)
	})

	test('out-before-in without the overnight flag returns 0 (likely a typo)', () => {
		expect(entryHours({ clockIn: '22:00', clockOut: '06:00' })).toBe(0)
		expect(entryHours({ clockIn: '09:00', clockOut: '08:59' })).toBe(0)
	})

	test('identical clock-in/out still returns 0 (safe payroll default)', () => {
		expect(entryHours({ clockIn: '09:00', clockOut: '09:00' })).toBe(0)
	})

	test('invalid times yield 0', () => {
		expect(entryHours({ clockIn: 'x', clockOut: '17:00' })).toBe(0)
	})

	test('break longer than the shift clamps to 0', () => {
		expect(
			entryHours({ clockIn: '09:00', clockOut: '10:00', breakMinutes: 120 })
		).toBe(0)
	})
})

describe('calculateTimecard', () => {
	test('sums hours across entries', () => {
		const r = calculateTimecard({
			entries: [
				{ clockIn: '09:00', clockOut: '17:00' },
				{ clockIn: '09:00', clockOut: '12:00' }
			]
		})
		expect(r.totalHours).toBe(11)
		expect(r.perDay).toEqual([8, 3])
	})

	test('splits regular vs overtime past the weekly threshold', () => {
		const r = calculateTimecard({
			entries: [
				{ clockIn: '08:00', clockOut: '18:00' }, // 10
				{ clockIn: '08:00', clockOut: '18:00' }, // 10
				{ clockIn: '08:00', clockOut: '18:00' }, // 10
				{ clockIn: '08:00', clockOut: '18:00' }, // 10
				{ clockIn: '08:00', clockOut: '13:00' } // 5 -> total 45
			],
			hourlyRate: 20
		})
		expect(r.totalHours).toBe(45)
		expect(r.regularHours).toBe(40)
		expect(r.overtimeHours).toBe(5)
		expect(r.regularPay).toBe(800)
		expect(r.overtimePay).toBe(150) // 5 * 20 * 1.5
		expect(r.totalPay).toBe(950)
	})

	test('pay is null without a rate', () => {
		const r = calculateTimecard({
			entries: [{ clockIn: '09:00', clockOut: '17:00' }]
		})
		expect(r.totalPay).toBeNull()
		expect(r.regularPay).toBeNull()
	})

	test('custom overtime threshold and multiplier', () => {
		const r = calculateTimecard({
			entries: [{ clockIn: '00:00', clockOut: '10:00' }], // 10h
			hourlyRate: 10,
			overtimeThresholdHours: 8,
			overtimeMultiplier: 2
		})
		expect(r.regularHours).toBe(8)
		expect(r.overtimeHours).toBe(2)
		expect(r.totalPay).toBe(8 * 10 + 2 * 10 * 2) // 80 + 40 = 120
	})

	test('empty entries produce zeroes', () => {
		const r = calculateTimecard({ entries: [] })
		expect(r.totalHours).toBe(0)
		expect(r.perDay).toEqual([])
	})
})
