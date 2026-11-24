import { describe, expect, it } from 'bun:test'
import { formatCents } from '@/lib/documents/money'
import {
	computeProposalPricing,
	getProposalIssues
} from '@/lib/documents/proposal'
import type { ProposalData, ProposalPricingItem } from '@/types/pdf-templates'

const item = (
	id: string,
	description: string,
	price: number
): ProposalPricingItem => ({ id, description, price })

const baseProposal = (overrides: Partial<ProposalData> = {}): ProposalData => ({
	companyName: 'Acme Design',
	companyAddress: '',
	companyCity: '',
	companyState: '',
	companyZip: '',
	companyEmail: '',
	companyPhone: '',
	companyDescription: '',
	clientName: '',
	clientCompany: 'Client Co',
	clientEmail: '',
	projectName: 'New website',
	projectDate: '2026-11-23',
	validUntil: '2026-12-23',
	overview: '',
	scopeItems: [''],
	milestones: [{ id: 'm1', phase: 'Phase 1', description: '', duration: '' }],
	pricingItems: [item('p1', 'Design', 1000)],
	paymentTerms: '',
	terms: '',
	...overrides
})

describe('computeProposalPricing', () => {
	it('prints a priced row with no description so the total matches (Design 1000 + blank 500)', () => {
		const pricing = computeProposalPricing([
			item('a', 'Design', 1000),
			item('b', '', 500)
		])
		expect(
			pricing.rows.map(r => [r.description, formatCents(r.cents)])
		).toEqual([
			['Design', '$1,000.00'],
			['Untitled item', '$500.00']
		])
		expect(formatCents(pricing.totalCents)).toBe('$1,500.00')
	})

	it('sums rounded cents so three rows of 33.333 agree with the total', () => {
		const pricing = computeProposalPricing([
			item('a', 'One', 33.333),
			item('b', 'Two', 33.333),
			item('c', 'Three', 33.333)
		])
		expect(pricing.rows.map(r => formatCents(r.cents))).toEqual([
			'$33.33',
			'$33.33',
			'$33.33'
		])
		expect(formatCents(pricing.totalCents)).toBe('$99.99')
	})

	it('skips rows with neither a description nor a price', () => {
		const pricing = computeProposalPricing([
			item('a', '', 0),
			item('b', 'Hosting', 0)
		])
		expect(pricing.rows.map(r => r.id)).toEqual(['b'])
		expect(pricing.totalCents).toBe(0)
	})
})

describe('getProposalIssues', () => {
	it('is empty for a complete proposal', () => {
		expect(getProposalIssues(baseProposal())).toEqual([])
	})

	it('accepts a client name or a client company', () => {
		expect(
			getProposalIssues(baseProposal({ clientCompany: '', clientName: 'Jane' }))
		).toEqual([])
		expect(
			getProposalIssues(baseProposal({ clientCompany: '', clientName: '' }))
		).toContain('Enter a client name or company.')
	})

	it('requires the business name and rejects negative prices and bad dates', () => {
		const issues = getProposalIssues(
			baseProposal({
				companyName: '',
				pricingItems: [item('a', 'Discount', -50)],
				validUntil: '2026-11-01'
			})
		)
		expect(issues).toContain('Enter your business name.')
		expect(issues).toContain('Pricing item 1: price cannot be negative.')
		expect(issues).toContain(
			'The valid-until date cannot be before the proposal date.'
		)
	})
})
