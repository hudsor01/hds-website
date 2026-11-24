import { describe, expect, it } from 'bun:test'
import {
	addDaysToDateInput,
	defaultInvoiceNote,
	dueDateForTerms,
	formatDocumentDate,
	isDateBefore,
	isDateInputValue,
	toDateInputValue
} from '@/lib/documents/dates'

describe('toDateInputValue', () => {
	it('uses the local calendar day, not the UTC day', () => {
		// 9:30pm local on Nov 23 is already Nov 24 in UTC for US time zones;
		// toISOString() would return the 24th.
		const lateEvening = new Date(2026, 10, 23, 21, 30)
		expect(toDateInputValue(lateEvening)).toBe('2026-11-23')
	})

	it('pads single-digit months and days', () => {
		expect(toDateInputValue(new Date(2026, 0, 5, 8))).toBe('2026-01-05')
	})
})

describe('addDaysToDateInput', () => {
	it('adds days across month and year boundaries', () => {
		expect(addDaysToDateInput('2026-11-23', 15)).toBe('2026-12-08')
		expect(addDaysToDateInput('2026-12-20', 30)).toBe('2027-01-19')
		expect(addDaysToDateInput('2028-02-28', 1)).toBe('2028-02-29')
	})

	it('is not shifted by daylight saving changes', () => {
		// US DST ends 2026-11-01.
		expect(addDaysToDateInput('2026-10-31', 1)).toBe('2026-11-01')
		expect(addDaysToDateInput('2026-10-31', 2)).toBe('2026-11-02')
	})

	it('returns an empty string for an invalid date', () => {
		expect(addDaysToDateInput('', 5)).toBe('')
		expect(addDaysToDateInput('2026-02-31', 5)).toBe('')
	})
})

describe('isDateInputValue / isDateBefore', () => {
	it('accepts only real calendar days', () => {
		expect(isDateInputValue('2026-12-01')).toBe(true)
		expect(isDateInputValue('2026-13-01')).toBe(false)
		expect(isDateInputValue('12/01/2026')).toBe(false)
	})

	it('compares calendar days and ignores blanks', () => {
		expect(isDateBefore('2026-11-22', '2026-11-23')).toBe(true)
		expect(isDateBefore('2026-11-23', '2026-11-23')).toBe(false)
		expect(isDateBefore('', '2026-11-23')).toBe(false)
	})
})

describe('formatDocumentDate', () => {
	it('prints the picked day in every time zone (no day-early shift)', () => {
		expect(formatDocumentDate('2026-12-01')).toBe('December 1, 2026')
	})

	it('prints nothing for a blank or invalid date', () => {
		expect(formatDocumentDate('')).toBe('')
		expect(formatDocumentDate('not-a-date')).toBe('')
	})
})

describe('payment terms', () => {
	it('derives the due date from the invoice date', () => {
		expect(dueDateForTerms('2026-11-23', 'Net 15')).toBe('2026-12-08')
		expect(dueDateForTerms('2026-11-23', 'Net 30')).toBe('2026-12-23')
		expect(dueDateForTerms('2026-11-23', 'Due on Receipt')).toBe('2026-11-23')
	})

	it('writes a default note that matches the terms', () => {
		expect(defaultInvoiceNote('Net 15')).toBe(
			'Payment is due within 15 days. Please include the invoice number with your payment.'
		)
		expect(defaultInvoiceNote('Due on Receipt')).toBe(
			'Payment is due on receipt. Please include the invoice number with your payment.'
		)
	})
})
