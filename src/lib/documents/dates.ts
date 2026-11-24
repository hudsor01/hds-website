/**
 * Calendar-day helpers for the document generators.
 *
 * Every date the tools store is a 'YYYY-MM-DD' string (the value of an
 * <input type="date">). Defaults are built from the viewer's LOCAL calendar
 * day, because `toISOString()` returns the UTC day and turns "today" into
 * "tomorrow" every evening in US time zones. Arithmetic runs in UTC on the
 * parsed parts so daylight-saving shifts never move a day.
 */

import { formatCalendarDate } from '@/lib/utils'
import type { InvoicePaymentTerms } from '@/types/pdf-templates'

const DATE_INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

const pad = (value: number): string => value.toString().padStart(2, '0')

/** The viewer's local calendar day as 'YYYY-MM-DD'. */
export function toDateInputValue(date: Date): string {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function parseDateInput(value: string): Date | null {
	const match = DATE_INPUT_PATTERN.exec(value)
	if (!match) {
		return null
	}
	const [, year, month, day] = match
	const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
	// Reject rollovers such as 2026-02-31 or 2026-13-01.
	return date.getUTCMonth() === Number(month) - 1 &&
		date.getUTCDate() === Number(day)
		? date
		: null
}

/** True for a real calendar day in 'YYYY-MM-DD' form. */
export function isDateInputValue(value: string): boolean {
	return parseDateInput(value) !== null
}

/** Add whole days to a 'YYYY-MM-DD' value. Returns '' for an invalid date. */
export function addDaysToDateInput(value: string, days: number): string {
	const date = parseDateInput(value)
	if (!date) {
		return ''
	}
	date.setUTCDate(date.getUTCDate() + days)
	return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

/** True when both dates are valid and `later` falls before `earlier`. */
export function isDateBefore(later: string, earlier: string): boolean {
	return isDateInputValue(later) && isDateInputValue(earlier) && later < earlier
}

/** 'December 1, 2026' for a valid date, '' otherwise. Never shifts the day. */
export function formatDocumentDate(value: string): string {
	return isDateInputValue(value) ? formatCalendarDate(value, 'long') : ''
}

const PAYMENT_TERM_DAYS: Record<InvoicePaymentTerms, number> = {
	'Due on Receipt': 0,
	'Net 15': 15,
	'Net 30': 30,
	'Net 45': 45,
	'Net 60': 60
}

/** Due date implied by the payment terms: invoice date plus N days. */
export function dueDateForTerms(
	invoiceDate: string,
	terms: InvoicePaymentTerms
): string {
	return addDaysToDateInput(invoiceDate, PAYMENT_TERM_DAYS[terms])
}

/** Default invoice note that matches the chosen payment terms. */
export function defaultInvoiceNote(terms: InvoicePaymentTerms): string {
	const days = PAYMENT_TERM_DAYS[terms]
	const when =
		days === 0
			? 'Payment is due on receipt.'
			: `Payment is due within ${days} days.`
	return `${when} Please include the invoice number with your payment.`
}
