/**
 * Invoice math and download checks, shared by the on-screen form and the
 * PDF template so both always print the same numbers.
 *
 * Rules: each line is rounded to the cent, the subtotal is the sum of the
 * rounded lines, tax is rounded once on the subtotal and the total is
 * subtotal plus tax.
 */

import type { InvoiceData, InvoiceLineItem } from '@/types/pdf-templates'
import { isDateBefore, isDateInputValue } from './dates'
import { dollarsToCents, isNonNegativeNumber, roundHalfUp } from './money'

export const UNTITLED_ITEM = 'Untitled item'

export interface InvoiceLineTotal {
	id: string
	description: string
	quantity: number
	rateCents: number
	amountCents: number
}

export interface InvoiceTotals {
	/** Lines that print: blank rows (no description, no amount) are skipped. */
	lines: InvoiceLineTotal[]
	subtotalCents: number
	taxCents: number
	totalCents: number
}

/** Quantity times rate, rounded to the cent. */
export function lineAmountCents(
	item: Pick<InvoiceLineItem, 'quantity' | 'rate'>
): number {
	const quantity = Number.isFinite(item.quantity) ? item.quantity : 0
	return roundHalfUp(quantity * dollarsToCents(item.rate))
}

export function computeInvoiceTotals(
	data: Pick<InvoiceData, 'lineItems' | 'taxRate'>
): InvoiceTotals {
	const lines = data.lineItems
		.map(item => ({
			id: item.id,
			description: item.description.trim() || UNTITLED_ITEM,
			hasDescription: item.description.trim() !== '',
			quantity: item.quantity,
			rateCents: dollarsToCents(item.rate),
			amountCents: lineAmountCents(item)
		}))
		.filter(line => line.hasDescription || line.amountCents !== 0)
		.map(({ hasDescription: _hasDescription, ...line }) => line)

	const subtotalCents = lines.reduce((sum, line) => sum + line.amountCents, 0)
	const taxRate = Number.isFinite(data.taxRate) ? data.taxRate : 0
	const taxCents = roundHalfUp((subtotalCents * taxRate) / 100)

	return {
		lines,
		subtotalCents,
		taxCents,
		totalCents: subtotalCents + taxCents
	}
}

/**
 * Everything that must be fixed before the invoice can download, in form
 * order. An empty list means the invoice is ready.
 */
export function getInvoiceIssues(data: InvoiceData): string[] {
	const issues: string[] = []

	if (!data.companyName.trim()) {
		issues.push('Enter your business name.')
	}
	if (!data.clientName.trim()) {
		issues.push('Enter the client name.')
	}
	if (!data.invoiceNumber.trim()) {
		issues.push('Enter an invoice number.')
	}
	if (!isDateInputValue(data.invoiceDate)) {
		issues.push('Pick an invoice date.')
	}
	if (!isDateInputValue(data.dueDate)) {
		issues.push('Pick a due date.')
	} else if (isDateBefore(data.dueDate, data.invoiceDate)) {
		issues.push('The due date cannot be before the invoice date.')
	}

	data.lineItems.forEach((item, index) => {
		const line = index + 1
		if (!isNonNegativeNumber(item.quantity)) {
			issues.push(`Line ${line}: quantity cannot be negative.`)
		}
		if (!isNonNegativeNumber(item.rate)) {
			issues.push(`Line ${line}: rate cannot be negative.`)
		}
		if (!item.description.trim() && lineAmountCents(item) !== 0) {
			issues.push(`Line ${line}: add a description.`)
		}
	})

	const hasBillableLine = data.lineItems.some(
		item => item.description.trim() !== '' && lineAmountCents(item) > 0
	)
	if (!hasBillableLine) {
		issues.push('Add at least one line item with a description and an amount.')
	}

	if (!isNonNegativeNumber(data.taxRate) || data.taxRate > 100) {
		issues.push('The tax rate must be between 0% and 100%.')
	}

	return issues
}
