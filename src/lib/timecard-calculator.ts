/**
 * Time card / hours calculator for ONE workweek.
 *
 * Each entry is a clock-in / clock-out pair ("HH:MM", 24h) plus optional
 * unpaid meal-break minutes. Overnight shifts (clock-out earlier than
 * clock-in) roll over to the next day only when flagged. Hours past the
 * weekly overtime threshold are paid at the overtime multiplier.
 *
 * The FLSA counts overtime per fixed workweek and forbids averaging hours
 * over two or more weeks (DOL Fact Sheet #23), so the calculator accepts
 * at most 7 entries. Summing a longer span and splitting overtime on the
 * grand total would understate overtime (50h + 30h is 10h OT, not 40h).
 *
 * Work is done in whole minutes so the displayed h:mm and the pay agree.
 */

export const MAX_WORKWEEK_DAYS = 7
export const DEFAULT_OVERTIME_THRESHOLD_HOURS = 40
export const DEFAULT_OVERTIME_MULTIPLIER = 1.5

export interface TimeEntry {
	clockIn: string
	clockOut: string
	/** Unpaid meal-break minutes. Omit for none. */
	breakMinutes?: number
	/**
	 * Opt-in for a shift that crosses midnight. Only when true does a
	 * clock-out earlier than clock-in roll over to the next day.
	 */
	overnight?: boolean
}

export type EntryError =
	| 'invalid-time'
	| 'out-before-in'
	| 'same-time'
	| 'invalid-break'
	| 'negative-break'
	| 'break-too-long'

export interface EntryResult {
	/** Paid minutes for the entry; 0 when incomplete or in error. */
	minutes: number
	/** Why the entry cannot be counted, or null when it is fine/incomplete. */
	error: EntryError | null
}

export interface TimecardInput {
	entries: readonly TimeEntry[]
	hourlyRate?: number
	/** Weekly hours before overtime kicks in. Default 40. Must be > 0. */
	overtimeThresholdHours?: number
	/** Overtime pay multiplier. Default 1.5. Must be >= 1. */
	overtimeMultiplier?: number
}

export interface TimecardResult {
	/** Per-entry results (same order/length as input entries). */
	entries: EntryResult[]
	/** Worked hours per entry (same order/length as input entries). */
	perDay: number[]
	hasErrors: boolean
	totalMinutes: number
	regularMinutes: number
	overtimeMinutes: number
	totalHours: number
	regularHours: number
	overtimeHours: number
	regularPay: number | null
	overtimePay: number | null
	totalPay: number | null
}

const MINUTES_PER_DAY = 24 * 60

/** Parse "HH:MM" (24h) into minutes since midnight, or null if invalid. */
export function parseTime(value: string | undefined): number | null {
	if (typeof value !== 'string') {
		return null
	}
	const match = value.trim().match(/^(\d{1,2}):(\d{2})$/)
	if (!match) {
		return null
	}
	const hours = Number(match[1])
	const minutes = Number(match[2])
	if (hours > 23 || minutes > 59) {
		return null
	}
	return hours * 60 + minutes
}

/**
 * Evaluate one entry. A row with a blank clock-in or clock-out is
 * incomplete (0 minutes, no error). Every other unusable row returns an
 * error instead of silently counting 0 hours.
 */
export function evaluateEntry(entry: TimeEntry): EntryResult {
	const inBlank = entry.clockIn.trim() === ''
	const outBlank = entry.clockOut.trim() === ''
	if (inBlank || outBlank) {
		return { minutes: 0, error: null }
	}

	const start = parseTime(entry.clockIn)
	const end = parseTime(entry.clockOut)
	if (start === null || end === null) {
		return { minutes: 0, error: 'invalid-time' }
	}

	let span: number
	if (end > start) {
		span = end - start
	} else if (end === start) {
		return { minutes: 0, error: 'same-time' }
	} else if (entry.overnight) {
		span = end + MINUTES_PER_DAY - start
	} else {
		return { minutes: 0, error: 'out-before-in' }
	}

	const breakMinutes = entry.breakMinutes ?? 0
	if (!Number.isFinite(breakMinutes)) {
		return { minutes: 0, error: 'invalid-break' }
	}
	if (breakMinutes < 0) {
		return { minutes: 0, error: 'negative-break' }
	}
	if (breakMinutes >= span) {
		return { minutes: 0, error: 'break-too-long' }
	}

	return { minutes: Math.round(span - breakMinutes), error: null }
}

/** Hours worked for one entry; 0 when incomplete or in error. */
export function entryHours(entry: TimeEntry): number {
	return evaluateEntry(entry).minutes / 60
}

/** Format minutes as h:mm, e.g. 700 -> "11:40". */
export function formatHoursMinutes(totalMinutes: number): string {
	const whole = Math.round(totalMinutes)
	const hours = Math.floor(whole / 60)
	const minutes = whole % 60
	return `${hours}:${String(minutes).padStart(2, '0')}`
}

export function calculateTimecard(input: TimecardInput): TimecardResult {
	if (input.entries.length > MAX_WORKWEEK_DAYS) {
		throw new RangeError(
			`A time card covers one workweek: at most ${MAX_WORKWEEK_DAYS} entries, got ${input.entries.length}`
		)
	}
	const threshold =
		input.overtimeThresholdHours ?? DEFAULT_OVERTIME_THRESHOLD_HOURS
	if (!Number.isFinite(threshold) || threshold <= 0) {
		throw new RangeError(
			`overtimeThresholdHours must be a number above 0, got ${threshold}`
		)
	}
	const multiplier = input.overtimeMultiplier ?? DEFAULT_OVERTIME_MULTIPLIER
	if (!Number.isFinite(multiplier) || multiplier < 1) {
		throw new RangeError(
			`overtimeMultiplier must be a number of at least 1, got ${multiplier}`
		)
	}

	const entries = input.entries.map(evaluateEntry)
	const hasErrors = entries.some(e => e.error !== null)
	const totalMinutes = entries.reduce((sum, e) => sum + e.minutes, 0)
	const thresholdMinutes = threshold * 60
	const regularMinutes = Math.min(totalMinutes, thresholdMinutes)
	const overtimeMinutes = Math.max(0, totalMinutes - thresholdMinutes)

	const rate = input.hourlyRate
	const hasRate = typeof rate === 'number' && Number.isFinite(rate) && rate >= 0
	const regularPay = hasRate ? (regularMinutes / 60) * rate : null
	const overtimePay = hasRate
		? (overtimeMinutes / 60) * rate * multiplier
		: null
	const totalPay =
		regularPay !== null && overtimePay !== null
			? regularPay + overtimePay
			: null

	return {
		entries,
		perDay: entries.map(e => e.minutes / 60),
		hasErrors,
		totalMinutes,
		regularMinutes,
		overtimeMinutes,
		totalHours: totalMinutes / 60,
		regularHours: regularMinutes / 60,
		overtimeHours: overtimeMinutes / 60,
		regularPay,
		overtimePay,
		totalPay
	}
}
