import { describe, expect, it } from 'bun:test'
import {
	computeInvoiceTotals,
	getInvoiceIssues,
	lineAmountCents
} from '@/lib/documents/invoice'
import { formatCents, roundHalfUp } from '@/lib/documents/money'
import type { InvoiceData, InvoiceLineItem } from '@/types/pdf-templates'

const line = (
	id: string,
	description: string,
	quantity: number,
	rate: number
): InvoiceLineItem => ({ id, description, quantity, rate })

const baseInvoice = (overrides: Partial<InvoiceData> = {}): InvoiceData => ({
	companyName: 'Acme Plumbing',
	companyAddress: '',
	companyCity: '',
	companyState: '',
	companyZip: '',
	companyEmail: '',
	companyPhone: '',
	clientName: 'Jane Client',
	clientCompany: '',
	clientAddress: '',
	clientCity: '',
	clientState: '',
	clientZip: '',
	clientEmail: '',
	invoiceNumber: 'INV-2611-001',
	invoiceDate: '2026-11-23',
	dueDate: '2026-12-08',
	paymentTerms: 'Net 15',
	lineItems: [line('a', 'Service call', 1, 100)],
	taxRate: 0,
	notes: '',
	...overrides
})

describe('roundHalfUp', () => {
	it('rounds halves up even when the float is stored just below', () => {
		expect(roundHalfUp(123.915)).toBe(124)
		expect(roundHalfUp(4999.5)).toBe(5000)
		expect(roundHalfUp(-4999.5)).toBe(-5000)
		expect(roundHalfUp(Number.NaN)).toBe(0)
	})
})

describe('computeInvoiceTotals', () => {
	it('rounds each line so the rows add up to the subtotal (2 x 1.5 x $33.33)', () => {
		const totals = computeInvoiceTotals({
			lineItems: [
				line('a', 'Design', 1.5, 33.33),
				line('b', 'Build', 1.5, 33.33)
			],
			taxRate: 0
		})
		expect(totals.lines.map(l => formatCents(l.amountCents))).toEqual([
			'$50.00',
			'$50.00'
		])
		expect(formatCents(totals.subtotalCents)).toBe('$100.00')
		expect(formatCents(totals.totalCents)).toBe('$100.00')
	})

	it('rounds tax once on the subtotal (1.5 x $10.01 at 8.25%)', () => {
		const totals = computeInvoiceTotals({
			lineItems: [line('a', 'Labor', 1.5, 10.01)],
			taxRate: 8.25
		})
		expect(formatCents(totals.subtotalCents)).toBe('$15.02')
		expect(formatCents(totals.taxCents)).toBe('$1.24')
		expect(formatCents(totals.totalCents)).toBe('$16.26')
		expect(totals.totalCents).toBe(totals.subtotalCents + totals.taxCents)
	})

	it('skips blank rows and labels priced rows that have no description', () => {
		const totals = computeInvoiceTotals({
			lineItems: [
				line('a', 'Install', 1, 200),
				line('b', '', 1, 0),
				line('c', '  ', 2, 25)
			],
			taxRate: 0
		})
		expect(totals.lines.map(l => l.id)).toEqual(['a', 'c'])
		expect(totals.lines[1]?.description).toBe('Untitled item')
		expect(totals.subtotalCents).toBe(25_000)
	})

	it('treats non-finite numbers as zero', () => {
		expect(lineAmountCents({ quantity: Number.NaN, rate: 10 })).toBe(0)
		expect(
			lineAmountCents({ quantity: 2, rate: Number.POSITIVE_INFINITY })
		).toBe(0)
	})
})

describe('getInvoiceIssues', () => {
	it('is empty for a complete invoice', () => {
		expect(getInvoiceIssues(baseInvoice())).toEqual([])
	})

	it('requires the business name, client and a billable line', () => {
		const issues = getInvoiceIssues(
			baseInvoice({
				companyName: ' ',
				clientName: '',
				lineItems: [line('a', '', 1, 0)]
			})
		)
		expect(issues).toContain('Enter your business name.')
		expect(issues).toContain('Enter the client name.')
		expect(issues).toContain(
			'Add at least one line item with a description and an amount.'
		)
	})

	it('rejects negative numbers and a tax rate over 100%', () => {
		const issues = getInvoiceIssues(
			baseInvoice({
				lineItems: [line('a', 'Refund', -1, 50), line('b', 'Fee', 1, -5)],
				taxRate: 101
			})
		)
		expect(issues).toContain('Line 1: quantity cannot be negative.')
		expect(issues).toContain('Line 2: rate cannot be negative.')
		expect(issues).toContain('The tax rate must be between 0% and 100%.')
	})

	it('rejects a due date before the invoice date', () => {
		expect(getInvoiceIssues(baseInvoice({ dueDate: '2026-11-22' }))).toContain(
			'The due date cannot be before the invoice date.'
		)
	})

	it('asks for a description on a priced line', () => {
		expect(
			getInvoiceIssues(
				baseInvoice({
					lineItems: [line('a', 'Service call', 1, 100), line('b', '', 1, 40)]
				})
			)
		).toContain('Line 2: add a description.')
	})
})
