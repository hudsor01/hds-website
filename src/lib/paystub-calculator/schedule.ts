/**
 * One row of a percentage-method withholding schedule: the tax on an amount
 * of at least `atLeast` is `baseTax` plus `rate` times the excess over
 * `atLeast`. Rows are sorted ascending and the first row starts at 0.
 */
export interface ScheduleRow {
	atLeast: number
	baseTax: number
	rate: number
}

export function row(
	atLeast: number,
	baseTax: number,
	rate: number
): ScheduleRow {
	return { atLeast, baseTax, rate }
}

export function scheduleTax(
	rows: readonly ScheduleRow[],
	amount: number
): number {
	if (amount <= 0) {
		return 0
	}
	let match: ScheduleRow | undefined
	for (const r of rows) {
		if (amount >= r.atLeast) {
			match = r
		}
	}
	if (!match) {
		return 0
	}
	return match.baseTax + match.rate * (amount - match.atLeast)
}

export function roundCents(value: number): number {
	return Math.round(value * 100) / 100
}
