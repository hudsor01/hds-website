import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { act, cleanup, render, screen } from '@testing-library/react'
import ContractGeneratorClient from '@/app/(public)/tools/contract-generator/ContractGeneratorClient'
import InvoiceGeneratorClient from '@/app/(public)/tools/invoice-generator/InvoiceGeneratorClient'
import ProposalGeneratorClient from '@/app/(public)/tools/proposal-generator/ProposalGeneratorClient'
import { createLocalStorageDraft } from '@/hooks/use-local-storage-draft'
import {
	contractDraftSchema,
	type InvoiceFormState,
	invoiceDraftSchema,
	proposalDraftSchema
} from '@/lib/schemas/documents'
import type { ContractData, ProposalData } from '@/types/pdf-templates'

const INVOICE_DRAFT: InvoiceFormState = {
	companyName: 'Draft Plumbing Co',
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
	invoiceNumber: 'INV-2611-042',
	invoiceDate: '2026-11-23',
	dueDate: '2026-12-08',
	paymentTerms: 'Net 15',
	lineItems: [{ id: 'l1', description: 'Repair', quantity: 1.5, rate: 33.33 }],
	taxRate: 0,
	notes: '',
	dueDateEdited: false,
	notesEdited: false
}

const PROPOSAL_DRAFT: ProposalData = {
	companyName: 'Draft Design Studio',
	companyAddress: '',
	companyCity: '',
	companyState: '',
	companyZip: '',
	companyEmail: '',
	companyPhone: '',
	companyDescription: '',
	clientName: 'Jane',
	clientCompany: '',
	clientEmail: '',
	projectName: 'Website refresh',
	projectDate: '2026-11-23',
	validUntil: '2026-12-23',
	overview: '',
	scopeItems: ['Design'],
	milestones: [{ id: 'm1', phase: 'Phase 1', description: '', duration: '' }],
	pricingItems: [{ id: 'p1', description: 'Design', price: 1000 }],
	paymentTerms: '',
	terms: ''
}

const CONTRACT_DRAFT: ContractData = {
	template: 'nda',
	providerName: 'Draft Consulting LLC',
	providerSignerName: '',
	providerSignerTitle: '',
	providerAddress: '',
	providerCity: '',
	providerState: 'TX',
	providerZip: '',
	providerEmail: '',
	clientName: 'Jane',
	clientCompany: '',
	clientSignerTitle: '',
	clientAddress: '',
	clientCity: '',
	clientState: '',
	clientZip: '',
	clientEmail: '',
	effectiveDate: '2026-12-01',
	endDate: '',
	scopeOfWork: '',
	paymentTerms: '',
	paymentAmount: '',
	timeline: '',
	lateInterestRate: '',
	venueCounty: '',
	customClauses: ''
}

beforeEach(() => {
	window.localStorage.clear()
})

afterEach(() => {
	cleanup()
	window.localStorage.clear()
})

describe('createLocalStorageDraft', () => {
	it('returns the same object while the stored string is unchanged', () => {
		const store = createLocalStorageDraft(
			'test-invoice-draft',
			invoiceDraftSchema,
			'test'
		)
		expect(store.write(INVOICE_DRAFT)).toBe(true)
		const first = store.getSnapshot()
		const second = store.getSnapshot()
		expect(first).not.toBeNull()
		expect(second).toBe(first)

		store.write({ ...INVOICE_DRAFT, companyName: 'Changed' })
		const third = store.getSnapshot()
		expect(third).not.toBe(first)
		expect(third?.companyName).toBe('Changed')
		expect(store.getSnapshot()).toBe(third)
	})

	it('has a stable null server snapshot', () => {
		const store = createLocalStorageDraft(
			'test-key',
			invoiceDraftSchema,
			'test'
		)
		expect(store.getServerSnapshot()).toBeNull()
		expect(store.getServerSnapshot()).toBe(store.getServerSnapshot())
	})

	it('discards malformed JSON and drafts that fail the schema', () => {
		const store = createLocalStorageDraft(
			'test-bad',
			invoiceDraftSchema,
			'test'
		)
		window.localStorage.setItem('test-bad', '{not json')
		expect(store.getSnapshot()).toBeNull()

		// An old-format draft: amount on each line, no edit flags.
		window.localStorage.setItem(
			'test-bad',
			JSON.stringify({
				...INVOICE_DRAFT,
				dueDateEdited: undefined,
				lineItems: [
					{ id: 'x', description: 'a', quantity: 1, rate: 1, amount: 1 }
				]
			})
		)
		expect(store.getSnapshot()).toBeNull()

		window.localStorage.setItem(
			'test-bad',
			JSON.stringify({ ...INVOICE_DRAFT, taxRate: 'ten' })
		)
		expect(store.getSnapshot()).toBeNull()
	})

	it('notifies subscribers on write and clear', () => {
		const store = createLocalStorageDraft(
			'test-notify',
			proposalDraftSchema,
			'test'
		)
		let calls = 0
		const unsubscribe = store.subscribe(() => {
			calls += 1
		})
		store.write(PROPOSAL_DRAFT)
		store.clear()
		unsubscribe()
		store.write(PROPOSAL_DRAFT)
		expect(calls).toBe(2)
		expect(contractDraftSchema.safeParse(CONTRACT_DRAFT).success).toBe(true)
	})
})

describe('document generators render with a saved draft (no update loop)', () => {
	it('invoice', () => {
		window.localStorage.setItem(
			'hds-invoice-draft',
			JSON.stringify(INVOICE_DRAFT)
		)
		render(<InvoiceGeneratorClient />)
		expect(screen.getByDisplayValue('Draft Plumbing Co')).toBeInTheDocument()
		expect(screen.getByDisplayValue('INV-2611-042')).toBeInTheDocument()
		expect(
			screen.getByRole('button', { name: 'Clear Draft' })
		).toBeInTheDocument()
		expect(
			screen.getByText('Your invoice is ready to download.')
		).toBeInTheDocument()
		// 1.5 x $33.33 rounds to $50.00 on the line.
		expect(screen.getAllByText('$50.00').length).toBeGreaterThan(0)
	})

	it('proposal', () => {
		window.localStorage.setItem(
			'hds-proposal-draft',
			JSON.stringify(PROPOSAL_DRAFT)
		)
		render(<ProposalGeneratorClient />)
		expect(screen.getByDisplayValue('Draft Design Studio')).toBeInTheDocument()
		expect(
			screen.getByRole('button', { name: 'Clear Draft' })
		).toBeInTheDocument()
	})

	it('contract', () => {
		window.localStorage.setItem(
			'hds-contract-draft',
			JSON.stringify(CONTRACT_DRAFT)
		)
		render(<ContractGeneratorClient />)
		expect(screen.getByDisplayValue('Draft Consulting LLC')).toBeInTheDocument()
		expect(
			screen.getByRole('button', { name: /Mutual Non-Disclosure Agreement/ })
		).toHaveAttribute('aria-pressed', 'true')
	})

	it('ignores an invalid draft and starts empty', () => {
		window.localStorage.setItem(
			'hds-invoice-draft',
			JSON.stringify({ companyName: 'Hudson Digital Solutions' })
		)
		render(<InvoiceGeneratorClient />)
		expect(screen.queryByDisplayValue('Hudson Digital Solutions')).toBeNull()
		expect(screen.queryByRole('button', { name: 'Clear Draft' })).toBeNull()
		expect(screen.getByText('Enter your business name.')).toBeInTheDocument()
	})

	it('saving a draft re-renders once without looping', () => {
		render(<InvoiceGeneratorClient />)
		act(() => {
			screen.getByRole('button', { name: 'Save Draft' }).click()
		})
		expect(
			screen.getByRole('button', { name: 'Clear Draft' })
		).toBeInTheDocument()
		expect(window.localStorage.getItem('hds-invoice-draft')).not.toBeNull()
	})

	it('starts with empty business fields (no prefilled company)', () => {
		render(<ContractGeneratorClient />)
		expect(screen.getByLabelText('Business or Legal Name')).toHaveValue('')
		expect(
			screen.getByText(
				'This template is not legal advice. Have a Texas attorney review it before you sign.'
			)
		).toBeInTheDocument()
	})
})
