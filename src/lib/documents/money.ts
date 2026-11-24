/**
 * Integer-cent money helpers for the invoice and proposal generators.
 *
 * Totals are summed from amounts that were already rounded to the cent, so
 * every row a client sees adds up to the total printed under it.
 */

import { formatCurrency } from '@/lib/utils'

/**
 * Round half away from zero to a whole number. `toPrecision(12)` strips
 * binary noise first, so 123.915 (stored as 123.91499999...) rounds to 124
 * the way a person doing it on paper would.
 */
export function roundHalfUp(value: number): number {
	if (!Number.isFinite(value)) {
		return 0
	}
	const cleaned = Number(Math.abs(value).toPrecision(12))
	return Math.sign(value) * Math.round(cleaned)
}

/** Dollars as typed (12.345) to whole cents (1235). Non-finite becomes 0. */
export function dollarsToCents(dollars: number): number {
	return roundHalfUp(dollars * 100)
}

/** Whole cents to '$1,234.56' (negatives print as '-$1,234.56'). */
export function formatCents(cents: number): string {
	return formatCurrency(cents / 100)
}

/** True for a finite number that is zero or more. */
export function isNonNegativeNumber(value: number): boolean {
	return Number.isFinite(value) && value >= 0
}

/** Parse a number input's value. Blank or unparseable input becomes 0. */
export function parseNumberInput(value: string): number {
	if (value.trim() === '') {
		return 0
	}
	const parsed = Number(value)
	return Number.isFinite(parsed) ? parsed : 0
}
