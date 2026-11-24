/**
 * Contract clause text and download checks.
 *
 * buildContractClauses() is the single source of every clause: the PDF
 * template renders it and the contract page shows the same list on screen
 * before download, so nothing in the signed document is a surprise.
 *
 * The templates are plain-English starting points with Texas as the
 * default governing law. They are not legal advice.
 */

import type { ContractData, ContractTemplate } from '@/types/pdf-templates'
import { formatDocumentDate, isDateBefore, isDateInputValue } from './dates'
import { isTexas, legalStateName } from './format'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ClauseBlock =
	| { kind: 'text'; text: string; conspicuous?: boolean }
	| { kind: 'bullets'; items: string[] }

export interface ContractClause {
	id: string
	/** Heading without its number, e.g. 'Confidentiality'. */
	title: string
	blocks: ClauseBlock[]
	/** Print the heading and every block in bold (Texas fair-notice rule). */
	conspicuous?: boolean
}

interface Roles {
	provider: string
	client: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const TEXAS_INTEREST_CAP = 10

/**
 * Notice of immunity required by 18 U.S.C. 1833(b)(3) in any agreement that
 * governs trade secrets or other confidential information. 1833(b)(4) makes
 * it apply to contractors and consultants. Wording tracks 1833(b)(1) and
 * (b)(2) (verified against the govinfo.gov text of 18 U.S.C. 1833).
 */
export const DTSA_NOTICE =
	'Notice under the Defend Trade Secrets Act (18 U.S.C. 1833(b)): An individual shall not be held criminally or civilly liable under any federal or state trade secret law for the disclosure of a trade secret that is made (a) in confidence to a federal, state or local government official, either directly or indirectly, or to an attorney, solely for the purpose of reporting or investigating a suspected violation of law; or (b) in a complaint or other document filed in a lawsuit or other proceeding, if such filing is made under seal. An individual who files a lawsuit for retaliation for reporting a suspected violation of law may disclose the trade secret to the individual’s attorney and use the trade secret information in the court proceeding, if the individual files any document containing the trade secret under seal and does not disclose the trade secret except under court order.'

export const CONTRACT_TEMPLATE_TITLES: Record<ContractTemplate, string> = {
	'service-agreement': 'Service Agreement',
	nda: 'Mutual Non-Disclosure Agreement',
	'freelance-contract': 'Freelance Contract'
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const text = (value: string, conspicuous?: boolean): ClauseBlock =>
	conspicuous
		? { kind: 'text', text: value, conspicuous }
		: { kind: 'text', text: value }

const bullets = (items: string[]): ClauseBlock => ({ kind: 'bullets', items })

function rolesFor(template: ContractTemplate): Roles {
	switch (template) {
		case 'nda':
			return { provider: 'Party A', client: 'Party B' }
		case 'freelance-contract':
			return { provider: 'Contractor', client: 'Client' }
		default:
			return { provider: 'Service Provider', client: 'Client' }
	}
}

/** The legal name shown for each party: the client company wins over the contact. */
export function contractPartyNames(data: ContractData): Roles {
	return {
		provider: data.providerName.trim(),
		client: data.clientCompany.trim() || data.clientName.trim()
	}
}

/** Party labels for headings and signature blocks. */
export function contractRoles(template: ContractTemplate): Roles {
	return rolesFor(template)
}

/** Parse the optional late interest rate. Blank is null; junk is NaN. */
export function parseLateInterestRate(value: string): number | null {
	const trimmed = value.trim().replace(/%$/, '')
	if (!trimmed) {
		return null
	}
	const parsed = Number(trimmed)
	return Number.isFinite(parsed) ? parsed : Number.NaN
}

function formatRate(rate: number): string {
	return Number.isInteger(rate)
		? rate.toString()
		: rate.toFixed(2).replace(/0+$/, '')
}

/** 'Dallas County, Texas' (a trailing 'County' the user typed is not doubled). */
function venueText(data: ContractData, roles: Roles): string {
	const state = legalStateName(data.providerState)
	const county = data.venueCounty.trim().replace(/\s+county$/i, '')
	if (county) {
		return `${county} County, ${state}`
	}
	return `the county in ${state} where the ${roles.provider} has its principal place of business`
}

// ---------------------------------------------------------------------------
// Shared clauses
// ---------------------------------------------------------------------------

function confidentialityExclusions(): ClauseBlock {
	return text(
		'Confidential Information does not include information that: (a) is or becomes public through no fault of the receiving party; (b) the receiving party already knew, without a duty of confidentiality, before receiving it; (c) the receiving party develops independently without using the other party’s Confidential Information; or (d) the receiving party rightfully receives from a third party without a duty of confidentiality.'
	)
}

function compelledDisclosure(): ClauseBlock {
	return text(
		'A party may disclose Confidential Information when a law, regulation or court order requires it, but only to the extent required. Where the law allows, that party will first give the other party prompt written notice so the other party can seek a protective order.'
	)
}

function confidentialityClause(roles: Roles): ContractClause {
	return {
		id: 'confidentiality',
		title: 'Confidentiality',
		blocks: [
			text(
				`Each party will keep confidential all non-public business, technical or financial information the other party shares under this agreement that is marked confidential or that a reasonable person would understand to be confidential ("Confidential Information"). Each party will use the other party’s Confidential Information only to perform this agreement. It will not disclose that information to anyone except its own employees, contractors and advisors who need to know it for this agreement and are bound to keep it confidential.`
			),
			confidentialityExclusions(),
			compelledDisclosure(),
			text(
				`These obligations continue for 3 years after this agreement ends. For any Confidential Information that is a trade secret, they continue for as long as it remains a trade secret under applicable law. Nothing in this section limits the ${roles.provider}’s right to use general skills and know-how it already had or learns while performing this agreement.`
			),
			text(DTSA_NOTICE)
		]
	}
}

function lateInterestBlock(data: ContractData, roles: Roles): ClauseBlock[] {
	const rate = parseLateInterestRate(data.lateInterestRate)
	if (rate === null || !Number.isFinite(rate) || rate <= 0) {
		return []
	}
	return [
		text(
			`Late payment: Any amount the ${roles.client} does not pay by its due date accrues simple interest at ${formatRate(rate)}% a year from the due date until it is paid, but never more than the highest rate the law allows.`
		)
	]
}

function termClause(data: ContractData, ending: string): ContractClause {
	const endDate = formatDocumentDate(data.endDate)
	const term = endDate
		? `This agreement starts on the Effective Date and ends on ${endDate}, unless a party ends it sooner under the Termination section.`
		: `This agreement starts on the Effective Date and continues until ${ending}, unless a party ends it sooner under the Termination section.`
	return { id: 'term', title: 'Term', blocks: [text(term)] }
}

function independentContractorClause(roles: Roles): ContractClause {
	return {
		id: 'independent-contractor',
		title: 'Independent Contractor',
		blocks: [
			text(
				`The ${roles.provider} is an independent contractor, not an employee, partner or agent of the ${roles.client}. The ${roles.provider} controls the manner and means of performing the work, provides its own tools and is responsible for its own taxes, insurance and benefits. Neither party can bind the other to any agreement with a third party.`
			)
		]
	}
}

function ipClause(roles: Roles): ContractClause {
	return {
		id: 'intellectual-property',
		title: 'Ownership of Work',
		blocks: [
			text(
				`Effective upon the ${roles.client}’s full payment of all amounts due under this agreement, the ${roles.provider} hereby assigns to the ${roles.client} all right, title and interest in the deliverables created specifically for the ${roles.client} under this agreement.`
			),
			text(
				`The ${roles.provider} keeps ownership of any tools, code, templates, designs, know-how or other materials it owned before this agreement or develops independently of it ("Pre-Existing Materials"). If any Pre-Existing Materials are included in the deliverables, the ${roles.provider} grants the ${roles.client} a non-exclusive, perpetual, royalty-free, worldwide license to use, copy and modify them as part of the deliverables, effective upon full payment.`
			)
		]
	}
}

function terminationClause(roles: Roles, noticeDays: number): ContractClause {
	return {
		id: 'termination',
		title: 'Termination',
		blocks: [
			text(
				`Either party may end this agreement for any reason with ${noticeDays} days’ written notice to the other party. Either party may end it immediately by written notice if the other party materially breaches it and does not fix the breach within 10 days after receiving written notice of it.`
			),
			text(
				`If this agreement ends early, the ${roles.client} will pay for all work performed and approved expenses incurred through the termination date. The sections on payment owed, ownership of work, confidentiality, warranties, indemnification, limitation of liability, disputes and general terms survive the end of this agreement.`
			)
		]
	}
}

function warrantyClause(roles: Roles): ContractClause {
	return {
		id: 'warranties',
		title: 'Warranties',
		blocks: [
			text(
				`The ${roles.provider} will perform the work in a professional and workmanlike manner consistent with generally accepted industry standards. Each party represents that it has the authority to enter into this agreement. The ${roles.client} represents that any materials it provides for the work do not infringe anyone else’s rights.`
			),
			text(
				`EXCEPT AS STATED IN THIS SECTION, THE ${roles.provider.toUpperCase()} MAKES NO OTHER WARRANTIES, EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.`,
				true
			)
		]
	}
}

function indemnityClause(): ContractClause {
	return {
		id: 'indemnification',
		title: 'Indemnification',
		blocks: [
			text(
				'Each party will defend, indemnify and hold harmless the other party from third-party claims, losses and expenses (including reasonable attorneys’ fees) to the extent caused by its own breach of this agreement, gross negligence or willful misconduct. The party seeking protection must promptly notify the other party of the claim and reasonably cooperate in the defense.'
			)
		]
	}
}

function liabilityClause(roles: Roles): ContractClause {
	return {
		id: 'limitation-of-liability',
		title: 'Limitation of Liability',
		conspicuous: true,
		blocks: [
			text(
				`EXCEPT FOR (1) A PARTY’S GROSS NEGLIGENCE OR WILLFUL MISCONDUCT, (2) A BREACH OF THE CONFIDENTIALITY SECTION, (3) A PARTY’S INDEMNIFICATION OBLIGATIONS OR (4) THE ${roles.client.toUpperCase()}’S OBLIGATION TO PAY AMOUNTS OWED:`,
				true
			),
			text(
				`EACH PARTY’S TOTAL LIABILITY ARISING OUT OF THIS AGREEMENT WILL NOT EXCEED THE TOTAL FEES PAID OR PAYABLE BY THE ${roles.client.toUpperCase()} UNDER THIS AGREEMENT.`,
				true
			),
			text(
				'NEITHER PARTY WILL BE LIABLE TO THE OTHER FOR ANY INDIRECT, INCIDENTAL, SPECIAL OR CONSEQUENTIAL DAMAGES OR LOST PROFITS, EVEN IF IT WAS TOLD THEY WERE POSSIBLE.',
				true
			)
		]
	}
}

function forceMajeureClause(): ContractClause {
	return {
		id: 'force-majeure',
		title: 'Force Majeure',
		blocks: [
			text(
				'Neither party is liable for a delay or failure to perform, other than an obligation to pay money, caused by events beyond its reasonable control, such as natural disasters, epidemics, war, government action, utility or internet outages or labor disputes. The affected party will promptly notify the other party and resume performance as soon as it reasonably can.'
			)
		]
	}
}

function additionalTermsClause(data: ContractData): ContractClause[] {
	const custom = data.customClauses.trim()
	if (!custom) {
		return []
	}
	return [
		{
			id: 'additional-terms',
			title: 'Additional Terms',
			blocks: [text(custom)]
		}
	]
}

function disputesClause(data: ContractData, roles: Roles): ContractClause {
	const state = legalStateName(data.providerState)
	return {
		id: 'disputes',
		title: 'Governing Law and Disputes',
		blocks: [
			text(
				`This agreement is governed by the laws of ${state}, without regard to its conflict of law rules. Any lawsuit arising out of this agreement must be brought in the state or federal courts located in ${venueText(data, roles)}. Each party consents to the jurisdiction of those courts.`
			)
		]
	}
}

function generalTermsClause(includeNoAgency: boolean): ContractClause {
	const items = [
		'Entire agreement: This agreement is the entire agreement between the parties about its subject. It replaces all earlier proposals, discussions or agreements about that subject.',
		'Amendments: Any change to this agreement must be in writing and signed by both parties.',
		'Severability: If a court finds any part of this agreement unenforceable, the rest of the agreement stays in effect. The unenforceable part will be enforced to the maximum extent the law allows.',
		'Assignment: Neither party may assign this agreement without the other party’s written consent, which will not be unreasonably withheld. Either party may assign it without consent to a successor to all or substantially all of its business. This agreement binds the parties and their permitted successors.',
		'Notices: Notices under this agreement must be in writing and delivered by hand, by mail or by email to the addresses listed above, or to a new address a party provides by notice. A notice is effective when received.',
		'No waiver: A party’s failure to enforce any part of this agreement is not a waiver of its right to enforce it later.',
		'Counterparts and electronic signatures: This agreement may be signed in counterparts, including by electronic signature. Each signed copy counts as an original. Electronic signatures have the same effect as handwritten signatures.'
	]
	if (includeNoAgency) {
		items.splice(
			5,
			0,
			'No partnership: Nothing in this agreement creates a partnership, joint venture, agency or employment relationship between the parties.'
		)
	}
	return {
		id: 'general-terms',
		title: 'General Terms',
		blocks: [bullets(items)]
	}
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

function serviceAgreementClauses(data: ContractData): ContractClause[] {
	const roles = rolesFor('service-agreement')
	return [
		{
			id: 'services',
			title: 'Services',
			blocks: [
				text(
					`The ${roles.provider} will provide the following services to the ${roles.client} (the "Services"):`
				),
				text(data.scopeOfWork.trim() || '[Describe the services]')
			]
		},
		termClause(data, 'the Services are complete'),
		{
			id: 'compensation',
			title: 'Compensation',
			blocks: [
				text(
					`In exchange for the Services, the ${roles.client} will pay the ${roles.provider}:`
				),
				text(`Amount: ${data.paymentAmount.trim() || '[Amount]'}`),
				text(`Payment terms: ${data.paymentTerms.trim() || '[Payment terms]'}`),
				...lateInterestBlock(data, roles)
			]
		},
		{
			id: 'timeline',
			title: 'Timeline',
			blocks: [
				text(
					data.timeline.trim() ||
						`The ${roles.provider} will deliver the Services on a schedule the parties agree to in writing.`
				)
			]
		},
		independentContractorClause(roles),
		ipClause(roles),
		confidentialityClause(roles),
		terminationClause(roles, 30),
		warrantyClause(roles),
		indemnityClause(),
		liabilityClause(roles),
		forceMajeureClause(),
		...additionalTermsClause(data),
		disputesClause(data, roles),
		generalTermsClause(false)
	]
}

function freelanceClauses(data: ContractData): ContractClause[] {
	const roles = rolesFor('freelance-contract')
	return [
		{
			id: 'engagement',
			title: 'Engagement',
			blocks: [
				text(
					`The ${roles.client} engages the ${roles.provider} as an independent contractor to perform the services below. The ${roles.provider} accepts this engagement.`
				),
				text(data.scopeOfWork.trim() || '[Describe the services]')
			]
		},
		termClause(data, 'the services are complete'),
		{
			id: 'compensation',
			title: 'Compensation',
			blocks: [
				text(`Fee: ${data.paymentAmount.trim() || '[Amount]'}`),
				text(
					`Payment schedule: ${data.paymentTerms.trim() || '[Payment terms]'}`
				),
				...lateInterestBlock(data, roles)
			]
		},
		{
			id: 'timeline',
			title: 'Timeline and Deliverables',
			blocks: [
				text(
					data.timeline.trim() ||
						`The ${roles.provider} will complete the work on a schedule the parties agree to in writing.`
				)
			]
		},
		{
			id: 'revisions',
			title: 'Revisions',
			blocks: [
				text(
					`The fee includes up to two (2) rounds of revisions. Additional revisions are billed at the rate in this agreement. If this agreement sets only a fixed fee, additional revisions require a written change order, signed by both parties, before the extra work begins.`
				)
			]
		},
		independentContractorClause(roles),
		ipClause(roles),
		confidentialityClause(roles),
		terminationClause(roles, 14),
		warrantyClause(roles),
		indemnityClause(),
		liabilityClause(roles),
		forceMajeureClause(),
		...additionalTermsClause(data),
		disputesClause(data, roles),
		generalTermsClause(false)
	]
}

function ndaClauses(data: ContractData): ContractClause[] {
	const roles = rolesFor('nda')
	const endDate = formatDocumentDate(data.endDate)
	return [
		{
			id: 'purpose',
			title: 'Purpose',
			blocks: [
				text(
					`The parties expect to share confidential information with each other for this purpose: ${data.scopeOfWork.trim() || 'evaluating and carrying out a possible business relationship between the parties'} (the "Purpose"). This agreement is mutual. Each party may be a disclosing party and a receiving party.`
				)
			]
		},
		{
			id: 'definition',
			title: 'Confidential Information',
			blocks: [
				text(
					'"Confidential Information" means any non-public information, whether oral, written or electronic, that either party (the "disclosing party") shares with the other (the "receiving party") that is marked confidential or that a reasonable person would understand to be confidential given the nature of the information and the circumstances of disclosure.'
				)
			]
		},
		{
			id: 'obligations',
			title: 'Obligations of Each Party',
			blocks: [
				text(
					'When a party receives the other party’s Confidential Information, it will:'
				),
				bullets([
					'hold the Confidential Information in strict confidence;',
					'use it only for the Purpose;',
					'not disclose it to anyone except its own employees, contractors and advisors who need to know it for the Purpose and are bound by confidentiality duties at least as protective as this agreement; and',
					'protect it with at least the same care it uses for its own confidential information and never less than reasonable care.'
				]),
				text(
					'Each party is responsible for any breach of this agreement by the people it shares Confidential Information with.'
				)
			]
		},
		{
			id: 'exclusions',
			title: 'Exclusions',
			blocks: [confidentialityExclusions()]
		},
		{
			id: 'compelled-disclosure',
			title: 'Disclosure Required by Law',
			blocks: [compelledDisclosure()]
		},
		{
			id: 'term',
			title: 'Term',
			blocks: [
				text(
					endDate
						? `This agreement starts on the Effective Date and ends on ${endDate}, unless either party ends it sooner with 30 days’ written notice.`
						: 'This agreement starts on the Effective Date and continues until either party ends it with 30 days’ written notice.'
				),
				text(
					'Each party’s obligations for Confidential Information shared before this agreement ends continue for 3 years after it ends. For any Confidential Information that is a trade secret, those obligations continue for as long as it remains a trade secret under applicable law.'
				)
			]
		},
		{
			id: 'return',
			title: 'Return or Destruction',
			blocks: [
				text(
					'When this agreement ends, or when the disclosing party asks, the receiving party will promptly return or destroy the disclosing party’s Confidential Information and, on request, confirm in writing that it has done so. A party may keep copies that its legal or record-keeping obligations require, which stay subject to this agreement.'
				)
			]
		},
		{
			id: 'no-license',
			title: 'No License or Obligation',
			blocks: [
				text(
					'Sharing Confidential Information does not give the receiving party any license or ownership rights in it. This agreement does not require either party to share any particular information or to enter into any further agreement. Confidential Information is provided as is.'
				)
			]
		},
		{
			id: 'remedies',
			title: 'Remedies',
			blocks: [
				text(
					'Each party agrees that a breach of this agreement may cause the other party irreparable harm that money damages would not fully cover. Either party may seek an injunction or other equitable relief to stop or prevent a breach, in addition to any other remedy available to it.'
				)
			]
		},
		{
			id: 'whistleblower',
			title: 'Whistleblower Immunity Notice',
			blocks: [text(DTSA_NOTICE)]
		},
		...additionalTermsClause(data),
		disputesClause(data, roles),
		generalTermsClause(true)
	]
}

/** Every clause of the selected template, in order, ready to number. */
export function buildContractClauses(data: ContractData): ContractClause[] {
	switch (data.template) {
		case 'nda':
			return ndaClauses(data)
		case 'freelance-contract':
			return freelanceClauses(data)
		default:
			return serviceAgreementClauses(data)
	}
}

/** 'This template is not legal advice. Have a Texas attorney review it...' */
export function contractDisclaimer(providerState: string): string {
	return `This template is not legal advice. Have a ${legalStateName(providerState)} attorney review it before you sign.`
}

// ---------------------------------------------------------------------------
// Download checks
// ---------------------------------------------------------------------------

/**
 * Everything that must be fixed before the contract can download, in form
 * order. An empty list means the contract is ready.
 */
export function getContractIssues(data: ContractData): string[] {
	const issues: string[] = []

	if (!data.providerName.trim()) {
		issues.push('Enter your business or legal name.')
	}
	if (!data.clientName.trim() && !data.clientCompany.trim()) {
		issues.push('Enter the other party’s name or company.')
	}
	if (!isDateInputValue(data.effectiveDate)) {
		issues.push('Pick an effective date.')
	}
	if (data.endDate && !isDateInputValue(data.endDate)) {
		issues.push('Pick an end date or leave it blank.')
	} else if (isDateBefore(data.endDate, data.effectiveDate)) {
		issues.push('The end date cannot be before the effective date.')
	}

	if (data.template !== 'nda') {
		const rate = parseLateInterestRate(data.lateInterestRate)
		if (rate !== null) {
			if (!Number.isFinite(rate) || rate <= 0) {
				issues.push(
					'Enter the late payment interest rate as a number above 0, or leave it blank.'
				)
			} else if (isTexas(data.providerState) && rate > TEXAS_INTEREST_CAP) {
				issues.push(
					`Texas generally caps contract interest at ${TEXAS_INTEREST_CAP}% a year. Lower the late payment rate or leave it blank.`
				)
			} else if (rate > 100) {
				issues.push(
					'The late payment interest rate cannot be more than 100% a year.'
				)
			}
		}
	}

	return issues
}
