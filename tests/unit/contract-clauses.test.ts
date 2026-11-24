import { describe, expect, it } from 'bun:test'
import {
	buildContractClauses,
	type ContractClause,
	contractDisclaimer,
	DTSA_NOTICE,
	getContractIssues,
	parseLateInterestRate
} from '@/lib/documents/contract'
import {
	cityStateZip,
	legalStateName,
	toFileSlug
} from '@/lib/documents/format'
import type { ContractData, ContractTemplate } from '@/types/pdf-templates'

const baseContract = (overrides: Partial<ContractData> = {}): ContractData => ({
	template: 'service-agreement',
	providerName: 'Acme Studio LLC',
	providerSignerName: '',
	providerSignerTitle: '',
	providerAddress: '',
	providerCity: 'Dallas',
	providerState: 'TX',
	providerZip: '',
	providerEmail: '',
	clientName: 'Jane Client',
	clientCompany: '',
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
	lateInterestRate: '',
	venueCounty: '',
	customClauses: '',
	...overrides
})

const allText = (clauses: ContractClause[]): string =>
	clauses
		.flatMap(clause => [
			clause.title,
			...clause.blocks.flatMap(block =>
				block.kind === 'text' ? [block.text] : block.items
			)
		])
		.join('\n')

const TEMPLATES: ContractTemplate[] = [
	'service-agreement',
	'freelance-contract',
	'nda'
]

describe('buildContractClauses copy rules', () => {
	for (const template of TEMPLATES) {
		it(`${template}: no em or en dashes and no comma before "and"`, () => {
			const text = allText(buildContractClauses(baseContract({ template })))
			expect(text).not.toMatch(/[–—]/)
			expect(text).not.toMatch(/, and\b/i)
		})

		it(`${template}: includes the DTSA immunity notice`, () => {
			const text = allText(buildContractClauses(baseContract({ template })))
			expect(text).toContain(DTSA_NOTICE)
		})

		it(`${template}: spells out the governing state and a venue`, () => {
			const text = allText(buildContractClauses(baseContract({ template })))
			expect(text).toContain('governed by the laws of Texas')
			expect(text).not.toContain('State of TX')
			expect(text).toContain('the county in Texas where the')
		})
	}
})

describe('service agreement and freelance clauses', () => {
	for (const template of ['service-agreement', 'freelance-contract'] as const) {
		it(`${template}: has the standard clauses`, () => {
			const titles = buildContractClauses(baseContract({ template })).map(
				c => c.title
			)
			for (const title of [
				'Term',
				'Independent Contractor',
				'Ownership of Work',
				'Confidentiality',
				'Termination',
				'Warranties',
				'Indemnification',
				'Limitation of Liability',
				'Force Majeure',
				'Governing Law and Disputes',
				'General Terms'
			]) {
				expect(titles).toContain(title)
			}
			const text = allText(buildContractClauses(baseContract({ template })))
			for (const phrase of [
				'Entire agreement',
				'Amendments',
				'Severability',
				'Assignment',
				'Notices',
				'Counterparts and electronic signatures',
				'is or becomes public through no fault',
				'develops independently',
				'rightfully receives from a third party',
				'court order requires it',
				'hereby assigns'
			]) {
				expect(text).toContain(phrase)
			}
		})

		it(`${template}: makes the liability cap conspicuous with carve-outs`, () => {
			const cap = buildContractClauses(baseContract({ template })).find(
				c => c.id === 'limitation-of-liability'
			)
			expect(cap?.conspicuous).toBe(true)
			const text = cap ? allText([cap]) : ''
			expect(text).toContain('GROSS NEGLIGENCE OR WILLFUL MISCONDUCT')
			expect(text).toContain('CONFIDENTIALITY')
			expect(text).toContain('EACH PARTY')
		})

		it(`${template}: uses the end date in the term clause`, () => {
			const term = buildContractClauses(
				baseContract({ template, endDate: '2027-06-30' })
			).find(c => c.id === 'term')
			expect(term ? allText([term]) : '').toContain('ends on June 30, 2027')
		})

		it(`${template}: adds the late interest clause only when a rate is set`, () => {
			expect(
				allText(buildContractClauses(baseContract({ template })))
			).not.toContain('simple interest')
			expect(
				allText(
					buildContractClauses(
						baseContract({ template, lateInterestRate: '8' })
					)
				)
			).toContain('simple interest at 8% a year from the due date')
		})
	}

	it('freelance revisions reference the rate in this agreement', () => {
		const text = allText(
			buildContractClauses(baseContract({ template: 'freelance-contract' }))
		)
		expect(text).toContain('billed at the rate in this agreement')
		expect(text).not.toContain('agreed hourly rate')
	})
})

describe('NDA clauses', () => {
	it('binds both parties and gives remedies to either party', () => {
		const text = allText(
			buildContractClauses(baseContract({ template: 'nda' }))
		)
		expect(text).toContain('This agreement is mutual')
		expect(text).toContain('When a party receives the other party')
		expect(text).toContain('Either party may seek an injunction')
		expect(text).toContain('for as long as it remains a trade secret')
	})
})

describe('venue and state names', () => {
	it('uses the county the user enters without doubling "County"', () => {
		const text = allText(
			buildContractClauses(baseContract({ venueCounty: 'Tarrant County' }))
		)
		expect(text).toContain('courts located in Tarrant County, Texas')
	})

	it('maps abbreviations and names to the full state name', () => {
		expect(legalStateName('TX')).toBe('Texas')
		expect(legalStateName('ok')).toBe('Oklahoma')
		expect(legalStateName('new york')).toBe('New York')
		expect(legalStateName('')).toBe('Texas')
	})

	it('adjusts the disclaimer to the provider state', () => {
		expect(contractDisclaimer('')).toBe(
			'This template is not legal advice. Have a Texas attorney review it before you sign.'
		)
		expect(contractDisclaimer('CA')).toContain('Have a California attorney')
	})
})

describe('getContractIssues', () => {
	it('is empty for a complete contract', () => {
		expect(getContractIssues(baseContract())).toEqual([])
	})

	it('requires the provider name and a client name or company', () => {
		const issues = getContractIssues(
			baseContract({ providerName: '', clientName: '', clientCompany: '' })
		)
		expect(issues).toContain('Enter your business or legal name.')
		expect(issues).toContain('Enter the other party’s name or company.')
	})

	it('rejects an end date before the effective date', () => {
		expect(
			getContractIssues(baseContract({ endDate: '2026-11-30' }))
		).toContain('The end date cannot be before the effective date.')
	})

	it('caps late interest at 10% for Texas but not elsewhere', () => {
		expect(
			getContractIssues(baseContract({ lateInterestRate: '12' }))
		).toHaveLength(1)
		expect(
			getContractIssues(
				baseContract({ lateInterestRate: '12', providerState: 'CA' })
			)
		).toEqual([])
		expect(
			getContractIssues(baseContract({ lateInterestRate: '-1' }))
		).toHaveLength(1)
		expect(parseLateInterestRate('7.5%')).toBe(7.5)
		expect(parseLateInterestRate('')).toBeNull()
	})
})

describe('format helpers', () => {
	it('never leaves a stray comma when address parts are blank', () => {
		expect(cityStateZip('', '', '')).toBe('')
		expect(cityStateZip('Dallas', '', '')).toBe('Dallas')
		expect(cityStateZip('', 'TX', '75201')).toBe('TX 75201')
		expect(cityStateZip('Dallas', 'TX', '75201')).toBe('Dallas, TX 75201')
	})

	it('builds safe file names', () => {
		expect(toFileSlug('Acme Co. #4', 'client')).toBe('acme_co_4')
		expect(toFileSlug('  ', 'client')).toBe('client')
	})
})
