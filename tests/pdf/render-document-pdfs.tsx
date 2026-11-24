/**
 * Renders one PDF per document-generator template and prints a JSON
 * summary. Run by tests/unit/document-pdfs.test.ts in a separate bun
 * process: the unit-test preload registers happy-dom and a fetch mock,
 * which break yoga-layout's WebAssembly loader inside @react-pdf/renderer.
 *
 * Usage: bun tests/pdf/render-document-pdfs.tsx [output-dir]
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { type DocumentProps, renderToBuffer } from '@react-pdf/renderer'
import type { ReactElement } from 'react'
import { ContractDocument } from '@/lib/pdf/contract-template'
import { InvoiceDocument } from '@/lib/pdf/invoice-template'
import { ProposalDocument } from '@/lib/pdf/proposal-template'
import type {
	ContractData,
	ContractTemplate,
	InvoiceData,
	ProposalData
} from '@/types/pdf-templates'

const INVOICE: InvoiceData = {
	companyName: 'Acme Plumbing',
	companyAddress: '',
	companyCity: 'Dallas',
	companyState: '',
	companyZip: '',
	companyEmail: 'billing@example.com',
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
	lineItems: [
		{ id: 'a', description: 'Labor', quantity: 1.5, rate: 10.01 },
		{ id: 'b', description: '', quantity: 1, rate: 0 }
	],
	taxRate: 8.25,
	notes: 'Payment is due within 15 days.'
}

const PROPOSAL: ProposalData = {
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
	overview: 'A new site.',
	scopeItems: ['Design', ''],
	milestones: [
		{ id: 'm1', phase: 'Phase 1', description: 'Design', duration: '2 weeks' }
	],
	pricingItems: [
		{ id: 'p1', description: 'Design', price: 1000 },
		{ id: 'p2', description: '', price: 500 }
	],
	paymentTerms: '50% deposit',
	terms: 'Standard terms.'
}

const contract = (template: ContractTemplate): ContractData => ({
	template,
	providerName: 'Acme Studio LLC',
	providerSignerName: 'Pat Owner',
	providerSignerTitle: 'Managing Member',
	providerAddress: '',
	providerCity: 'Dallas',
	providerState: 'TX',
	providerZip: '',
	providerEmail: '',
	clientName: 'Jane Client',
	clientCompany: 'Client Co',
	clientSignerTitle: '',
	clientAddress: '',
	clientCity: '',
	clientState: '',
	clientZip: '',
	clientEmail: '',
	effectiveDate: '2026-12-01',
	endDate: '',
	scopeOfWork: 'Build a website',
	paymentTerms: 'Net 15',
	paymentAmount: '$5,000',
	timeline: '',
	lateInterestRate: '8',
	venueCounty: 'Dallas',
	customClauses: 'Client provides all photos.\nNo weekend work.'
})

const DOCUMENTS: Record<string, ReactElement<DocumentProps>> = {
	invoice: <InvoiceDocument data={INVOICE} />,
	proposal: <ProposalDocument data={PROPOSAL} />,
	'proposal-no-pricing': (
		<ProposalDocument
			data={{
				...PROPOSAL,
				pricingItems: [{ id: 'p1', description: '', price: 0 }]
			}}
		/>
	),
	'contract-service-agreement': (
		<ContractDocument data={contract('service-agreement')} />
	),
	'contract-freelance-contract': (
		<ContractDocument data={contract('freelance-contract')} />
	),
	'contract-nda': <ContractDocument data={contract('nda')} />
}

const outputDir = process.argv[2]
if (outputDir) {
	mkdirSync(outputDir, { recursive: true })
}

const results: {
	name: string
	bytes: number
	pages: number
	isPdf: boolean
}[] = []
for (const [name, element] of Object.entries(DOCUMENTS)) {
	const buffer = await renderToBuffer(element)
	const raw = buffer.toString('latin1')
	results.push({
		name,
		bytes: buffer.length,
		pages: raw.match(/\/Type \/Page\b/g)?.length ?? 0,
		isPdf: raw.startsWith('%PDF-')
	})
	if (outputDir) {
		writeFileSync(join(outputDir, `${name}.pdf`), buffer)
	}
}

process.stdout.write(`${JSON.stringify(results)}\n`)
