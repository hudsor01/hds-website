import { describe, expect, test } from 'bun:test'
import {
	calculateTimecard,
	entryHours,
	evaluateEntry,
	formatHoursMinutes,
	MAX_WORKWEEK_DAYS,
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

describe('evaluateEntry', () => {
	test('blank times are incomplete, not an error', () => {
		expect(evaluateEntry({ clockIn: '', clockOut: '' })).toEqual({
			minutes: 0,
			error: null
		})
		expect(evaluateEntry({ clockIn: '09:00', clockOut: '' })).toEqual({
			minutes: 0,
			error: null
		})
	})

	test('flags out-before-in without the overnight flag', () => {
		expect(evaluateEntry({ clockIn: '17:00', clockOut: '09:00' }).error).toBe(
			'out-before-in'
		)
	})

	test('flags identical clock-in/out (a 24h shift cannot be one row)', () => {
		expect(evaluateEntry({ clockIn: '07:00', clockOut: '07:00' }).error).toBe(
			'same-time'
		)
		expect(
			evaluateEntry({ clockIn: '07:00', clockOut: '07:00', overnight: true })
				.error
		).toBe('same-time')
	})

	test('rejects a negative break instead of ignoring it', () => {
		expect(
			evaluateEntry({ clockIn: '09:00', clockOut: '17:00', breakMinutes: -30 })
		).toEqual({ minutes: 0, error: 'negative-break' })
	})

	test('rejects a break as long as the shift or longer', () => {
		expect(
			evaluateEntry({ clockIn: '09:00', clockOut: '10:00', breakMinutes: 60 })
				.error
		).toBe('break-too-long')
		expect(
			evaluateEntry({ clockIn: '09:00', clockOut: '10:00', breakMinutes: 120 })
				.error
		).toBe('break-too-long')
	})

	test('rejects a non-numeric break', () => {
		expect(
			evaluateEntry({
				clockIn: '09:00',
				clockOut: '17:00',
				breakMinutes: Number.NaN
			}).error
		).toBe('invalid-break')
	})

	test('flags unparseable times', () => {
		expect(evaluateEntry({ clockIn: 'x', clockOut: '17:00' }).error).toBe(
			'invalid-time'
		)
	})

	test('valid shift returns whole minutes and no error', () => {
		expect(
			evaluateEntry({ clockIn: '07:00', clockOut: '17:30', breakMinutes: 30 })
		).toEqual({ minutes: 600, error: null })
	})
})

describe('formatHoursMinutes', () => {
	test('formats minutes as h:mm', () => {
		expect(formatHoursMinutes(700)).toBe('11:40')
		expect(formatHoursMinutes(600)).toBe('10:00')
		expect(formatHoursMinutes(5)).toBe('0:05')
		expect(formatHoursMinutes(3000)).toBe('50:00')
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

	test('five 10-hour days at $18.50 split 40 regular and 10 overtime', () => {
		const day = { clockIn: '07:00', clockOut: '17:30', breakMinutes: 30 }
		const r = calculateTimecard({
			entries: [day, day, day, day, day],
			hourlyRate: 18.5
		})
		expect(r.totalMinutes).toBe(3000)
		expect(r.regularHours).toBe(40)
		expect(r.overtimeHours).toBe(10)
		expect(r.regularPay).toBe(740)
		expect(r.overtimePay).toBe(277.5)
		expect(r.totalPay).toBe(1017.5)
	})

	test('pay uses exact minutes, so 11:40 at $15 is $175', () => {
		const r = calculateTimecard({
			entries: [{ clockIn: '08:00', clockOut: '19:40' }],
			hourlyRate: 15
		})
		expect(r.totalMinutes).toBe(700)
		expect(r.totalPay).toBeCloseTo(175, 10)
	})

	test('accepts one full workweek of 7 entries', () => {
		const day = { clockIn: '09:00', clockOut: '17:00' }
		const r = calculateTimecard({
			entries: Array.from({ length: MAX_WORKWEEK_DAYS }, () => day)
		})
		expect(r.totalHours).toBe(56)
		expect(r.overtimeHours).toBe(16)
	})

	test('refuses more than one workweek (no averaging across weeks)', () => {
		const day = { clockIn: '09:00', clockOut: '17:00' }
		expect(() =>
			calculateTimecard({
				entries: Array.from({ length: MAX_WORKWEEK_DAYS + 1 }, () => day)
			})
		).toThrow(RangeError)
	})

	test('rejects a threshold of 0, a negative or a non-number', () => {
		const entries = [{ clockIn: '09:00', clockOut: '17:00' }]
		expect(() =>
			calculateTimecard({ entries, overtimeThresholdHours: 0 })
		).toThrow(RangeError)
		expect(() =>
			calculateTimecard({ entries, overtimeThresholdHours: -5 })
		).toThrow(RangeError)
		expect(() =>
			calculateTimecard({ entries, overtimeThresholdHours: Number.NaN })
		).toThrow(RangeError)
	})

	test('reports entry errors and leaves those entries out of the total', () => {
		const r = calculateTimecard({
			entries: [
				{ clockIn: '09:00', clockOut: '17:00' },
				{ clockIn: '17:00', clockOut: '09:00' }
			]
		})
		expect(r.hasErrors).toBe(true)
		expect(r.entries[1]?.error).toBe('out-before-in')
		expect(r.totalHours).toBe(8)
	})
})
