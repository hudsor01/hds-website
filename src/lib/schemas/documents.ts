/**
 * Draft schemas for the invoice, proposal and contract generators.
 *
 * Drafts live in the viewer's localStorage, which any extension, old
 * version of the page or hand edit can change, so every read is
 * validated here. A draft that fails (including one saved by an older
 * version of the tool) is discarded, never cast.
 *
 * Numbers use z.number(), which rejects NaN and Infinity. Negative
 * amounts are allowed in a draft so a half-finished form still saves;
 * the per-tool download checks in src/lib/documents/* reject them.
 */

import { z } from 'zod'
import type {
	ContractData,
	InvoiceData,
	ProposalData
} from '@/types/pdf-templates'
import {
	CONTRACT_TEMPLATES,
	INVOICE_PAYMENT_TERMS
} from '@/types/pdf-templates'

const text = z.string().max(20_000)
const id = z.string().min(1).max(100)

// ---------------------------------------------------------------------------
// Invoice
// ---------------------------------------------------------------------------

export interface InvoiceFormState extends InvoiceData {
	/** True once the user picks a due date by hand; terms stop changing it. */
	dueDateEdited: boolean
	/** True once the user edits the note; terms stop rewriting it. */
	notesEdited: boolean
}

export const invoiceDraftSchema: z.ZodType<InvoiceFormState> = z.object({
	companyName: text,
	companyAddress: text,
	companyCity: text,
	companyState: text,
	companyZip: text,
	companyEmail: text,
	companyPhone: text,
	clientName: text,
	clientCompany: text,
	clientAddress: text,
	clientCity: text,
	clientState: text,
	clientZip: text,
	clientEmail: text,
	invoiceNumber: text,
	invoiceDate: text,
	dueDate: text,
	paymentTerms: z.enum(INVOICE_PAYMENT_TERMS),
	lineItems: z
		.array(
			z.object({
				id,
				description: text,
				quantity: z.number(),
				rate: z.number()
			})
		)
		.min(1)
		.max(200),
	taxRate: z.number(),
	notes: text,
	dueDateEdited: z.boolean(),
	notesEdited: z.boolean()
})

// ---------------------------------------------------------------------------
// Proposal
// ---------------------------------------------------------------------------

export const proposalDraftSchema: z.ZodType<ProposalData> = z.object({
	companyName: text,
	companyAddress: text,
	companyCity: text,
	companyState: text,
	companyZip: text,
	companyEmail: text,
	companyPhone: text,
	companyDescription: text,
	clientName: text,
	clientCompany: text,
	clientEmail: text,
	projectName: text,
	projectDate: text,
	validUntil: text,
	overview: text,
	scopeItems: z.array(text).min(1).max(200),
	milestones: z
		.array(
			z.object({
				id,
				phase: text,
				description: text,
				duration: text
			})
		)
		.min(1)
		.max(200),
	pricingItems: z
		.array(z.object({ id, description: text, price: z.number() }))
		.min(1)
		.max(200),
	paymentTerms: text,
	terms: text
})

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------

export const contractDraftSchema: z.ZodType<ContractData> = z.object({
	template: z.enum(CONTRACT_TEMPLATES),
	providerName: text,
	providerSignerName: text,
	providerSignerTitle: text,
	providerAddress: text,
	providerCity: text,
	providerState: text,
	providerZip: text,
	providerEmail: text,
	clientName: text,
	clientCompany: text,
	clientSignerTitle: text,
	clientAddress: text,
	clientCity: text,
	clientState: text,
	clientZip: text,
	clientEmail: text,
	effectiveDate: text,
	endDate: text,
	scopeOfWork: text,
	paymentTerms: text,
	paymentAmount: text,
	timeline: text,
	lateInterestRate: text,
	venueCounty: text,
	customClauses: text
})
