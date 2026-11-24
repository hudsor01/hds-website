/**
 * PDF Template Types
 * Types for the contract, invoice and proposal generators. Money values the
 * user types are plain numbers in dollars; every total is computed in
 * integer cents by src/lib/documents/* so the screen and the PDF agree.
 */

// ==========================================
// Contract Types
// ==========================================

export const CONTRACT_TEMPLATES = [
	'service-agreement',
	'nda',
	'freelance-contract'
] as const

export type ContractTemplate = (typeof CONTRACT_TEMPLATES)[number]

export interface ContractData {
	// Template
	template: ContractTemplate
	// Provider/Company Info
	providerName: string
	providerSignerName: string
	providerSignerTitle: string
	providerAddress: string
	providerCity: string
	providerState: string
	providerZip: string
	providerEmail: string
	// Client Info
	clientName: string
	clientCompany: string
	clientSignerTitle: string
	clientAddress: string
	clientCity: string
	clientState: string
	clientZip: string
	clientEmail: string
	// Contract Details (YYYY-MM-DD)
	effectiveDate: string
	endDate: string
	// Terms
	scopeOfWork: string
	paymentTerms: string
	paymentAmount: string
	timeline: string
	/** Optional annual late-payment interest rate, as typed (blank = none). */
	lateInterestRate: string
	/** Optional county for the venue clause (blank = provider's county). */
	venueCounty: string
	// Custom
	customClauses: string
}

// ==========================================
// Invoice Types
// ==========================================

export const INVOICE_PAYMENT_TERMS = [
	'Due on Receipt',
	'Net 15',
	'Net 30',
	'Net 45',
	'Net 60'
] as const

export type InvoicePaymentTerms = (typeof INVOICE_PAYMENT_TERMS)[number]

export interface InvoiceLineItem {
	id: string
	description: string
	quantity: number
	/** Rate in dollars, as typed. */
	rate: number
}

export interface InvoiceData {
	// Company Info
	companyName: string
	companyAddress: string
	companyCity: string
	companyState: string
	companyZip: string
	companyEmail: string
	companyPhone: string
	// Client Info
	clientName: string
	clientCompany: string
	clientAddress: string
	clientCity: string
	clientState: string
	clientZip: string
	clientEmail: string
	// Invoice Details (dates are YYYY-MM-DD)
	invoiceNumber: string
	invoiceDate: string
	dueDate: string
	paymentTerms: InvoicePaymentTerms
	// Line Items
	lineItems: InvoiceLineItem[]
	/** Percent, 0 to 100. */
	taxRate: number
	// Additional
	notes: string
}

// ==========================================
// Proposal Types
// ==========================================

export interface ProposalPricingItem {
	id: string
	description: string
	/** Price in dollars, as typed. */
	price: number
}

export interface ProposalMilestone {
	id: string
	phase: string
	description: string
	duration: string
}

export interface ProposalData {
	// Company Info
	companyName: string
	companyAddress: string
	companyCity: string
	companyState: string
	companyZip: string
	companyEmail: string
	companyPhone: string
	companyDescription: string
	// Client Info
	clientName: string
	clientCompany: string
	clientEmail: string
	// Project Info (dates are YYYY-MM-DD)
	projectName: string
	projectDate: string
	validUntil: string
	// Content
	overview: string
	scopeItems: string[]
	milestones: ProposalMilestone[]
	pricingItems: ProposalPricingItem[]
	paymentTerms: string
	// Terms
	terms: string
}
