/**
 * Time card / hours calculator.
 *
 * Each entry is a clock-in / clock-out pair ("HH:MM", 24h) plus optional
 * unpaid break minutes. Overnight shifts (clock-out earlier than
 * clock-in) roll over to the next day. Weekly hours past the overtime
 * threshold are paid at the overtime multiplier.
 */

export interface TimeEntry {
	clockIn: string
	clockOut: string
	breakMinutes?: number
	/**
	 * Opt-in for a shift that crosses midnight. Only when true does a
	 * clock-out earlier than clock-in roll over to the next day. Without
	 * it, an out-before-in entry (usually a typo) returns 0 hours rather
	 * than silently becoming a ~24h shift.
	 */
	overnight?: boolean
}

export interface TimecardInput {
	entries: readonly TimeEntry[]
	hourlyRate?: number
	/** Weekly hours before overtime kicks in. Default 40. */
	overtimeThresholdHours?: number
	/** Overtime pay multiplier. Default 1.5. */
	overtimeMultiplier?: number
}

export interface TimecardResult {
	/** Worked hours per entry (same order/length as input entries). */
	perDay: number[]
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

/** Hours worked for one entry; 0 if the times are invalid/unparseable. */
export function entryHours(entry: TimeEntry): number {
	const start = parseTime(entry.clockIn)
	const end = parseTime(entry.clockOut)
	if (start === null || end === null) {
		return 0
	}
	// Same or later clock-out: a normal same-day shift. Earlier clock-out
	// is a real overnight shift ONLY if explicitly flagged; otherwise it's
	// a transposed/typo entry and we return 0 (visibly wrong, prompts a
	// fix) rather than silently inventing a ~24h shift.
	let span: number
	if (end >= start) {
		span = end - start
	} else if (entry.overnight) {
		span = end + MINUTES_PER_DAY - start
	} else {
		return 0
	}
	const breakMin =
		Number.isFinite(entry.breakMinutes ?? 0) && (entry.breakMinutes ?? 0) > 0
			? (entry.breakMinutes as number)
			: 0
	const worked = Math.max(0, span - breakMin)
	return worked / 60
}

export function calculateTimecard(input: TimecardInput): TimecardResult {
	const perDay = input.entries.map(entryHours)
	const totalHours = perDay.reduce((sum, h) => sum + h, 0)

	const threshold = Number.isFinite(input.overtimeThresholdHours ?? 40)
		? Math.max(0, input.overtimeThresholdHours ?? 40)
		: 40
	const multiplier = Number.isFinite(input.overtimeMultiplier ?? 1.5)
		? Math.max(0, input.overtimeMultiplier ?? 1.5)
		: 1.5

	const regularHours = Math.min(totalHours, threshold)
	const overtimeHours = Math.max(0, totalHours - threshold)

	const rate = input.hourlyRate
	const hasRate = typeof rate === 'number' && Number.isFinite(rate) && rate >= 0
	const regularPay = hasRate ? regularHours * (rate as number) : null
	const overtimePay = hasRate
		? overtimeHours * (rate as number) * multiplier
		: null
	const totalPay =
		regularPay !== null && overtimePay !== null
			? regularPay + overtimePay
			: null

	return {
		perDay,
		totalHours,
		regularHours,
		overtimeHours,
		regularPay,
		overtimePay,
		totalPay
	}
}
