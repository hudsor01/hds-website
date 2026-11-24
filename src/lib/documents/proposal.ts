/**
 * Proposal pricing and download checks, shared by the on-screen form and
 * the PDF template. One filter decides which pricing rows print and the
 * total is the sum of exactly those rows, in whole cents.
 */

import type { ProposalData, ProposalPricingItem } from '@/types/pdf-templates'
import { isDateBefore, isDateInputValue } from './dates'
import { dollarsToCents, isNonNegativeNumber } from './money'

export const UNTITLED_PRICING_ITEM = 'Untitled item'

export interface ProposalPricingRow {
	id: string
	description: string
	cents: number
}

export interface ProposalPricing {
	rows: ProposalPricingRow[]
	totalCents: number
}

/**
 * Rows with neither a description nor a price are skipped. A priced row
 * with a blank description prints as "Untitled item" so the total never
 * counts money the reader cannot see.
 */
export function computeProposalPricing(
	items: ProposalPricingItem[]
): ProposalPricing {
	const rows = items
		.map(item => ({
			id: item.id,
			rawDescription: item.description.trim(),
			cents: dollarsToCents(item.price)
		}))
		.filter(row => row.rawDescription !== '' || row.cents !== 0)
		.map(row => ({
			id: row.id,
			description: row.rawDescription || UNTITLED_PRICING_ITEM,
			cents: row.cents
		}))

	return {
		rows,
		totalCents: rows.reduce((sum, row) => sum + row.cents, 0)
	}
}

/**
 * Everything that must be fixed before the proposal can download, in form
 * order. An empty list means the proposal is ready.
 */
export function getProposalIssues(data: ProposalData): string[] {
	const issues: string[] = []

	if (!data.companyName.trim()) {
		issues.push('Enter your business name.')
	}
	if (!data.clientName.trim() && !data.clientCompany.trim()) {
		issues.push('Enter a client name or company.')
	}
	if (!data.projectName.trim()) {
		issues.push('Enter a project name.')
	}
	if (!isDateInputValue(data.projectDate)) {
		issues.push('Pick a proposal date.')
	}
	if (data.validUntil && !isDateInputValue(data.validUntil)) {
		issues.push('Pick a valid-until date or leave it blank.')
	} else if (isDateBefore(data.validUntil, data.projectDate)) {
		issues.push('The valid-until date cannot be before the proposal date.')
	}

	data.pricingItems.forEach((item, index) => {
		if (!isNonNegativeNumber(item.price)) {
			issues.push(`Pricing item ${index + 1}: price cannot be negative.`)
		}
	})

	return issues
}
