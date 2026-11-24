/**
 * Contract PDF Template
 * Uses @react-pdf/renderer for PDF generation. Every clause comes from
 * buildContractClauses, the same list the contract page shows on screen.
 */

import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { BRAND } from '@/lib/_generated/brand'
import {
	buildContractClauses,
	type ClauseBlock,
	CONTRACT_TEMPLATE_TITLES,
	type ContractClause,
	contractDisclaimer,
	contractPartyNames,
	contractRoles
} from '@/lib/documents/contract'
import { formatDocumentDate } from '@/lib/documents/dates'
import { cityStateZip, joinNonBlank } from '@/lib/documents/format'
import type { ContractData, ContractTemplate } from '@/types/pdf-templates'

// Re-export types for convenience
export type { ContractData, ContractTemplate }

const BLANK_LINE = '______________________________'

const styles = StyleSheet.create({
	page: {
		paddingTop: 50,
		paddingHorizontal: 50,
		// Room for the fixed footer so it never overlaps body text.
		paddingBottom: 80,
		fontFamily: 'Helvetica',
		fontSize: 10.5,
		color: '#333333',
		lineHeight: 1.5
	},
	header: {
		marginBottom: 16,
		paddingBottom: 16,
		borderBottomWidth: 2,
		borderBottomColor: BRAND.primary
	},
	title: {
		fontSize: 22,
		fontWeight: 'bold',
		color: BRAND.primary,
		textAlign: 'center',
		marginBottom: 8
	},
	subtitle: {
		fontSize: 12,
		color: '#666666',
		textAlign: 'center'
	},
	disclaimer: {
		fontSize: 8.5,
		color: '#666666',
		textAlign: 'center',
		marginBottom: 14
	},
	effectiveDate: {
		textAlign: 'center',
		fontWeight: 'bold',
		marginBottom: 16
	},
	partiesSection: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 20,
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#e5e5e5'
	},
	partyBlock: {
		flex: 1,
		padding: 8
	},
	partyLabel: {
		fontSize: 9,
		fontWeight: 'bold',
		color: BRAND.primary,
		marginBottom: 5,
		letterSpacing: 1
	},
	partyName: {
		fontSize: 12,
		fontWeight: 'bold',
		marginBottom: 4
	},
	partyDetails: {
		fontSize: 10,
		color: '#666666',
		lineHeight: 1.5
	},
	section: {
		marginBottom: 14
	},
	sectionTitle: {
		fontSize: 12,
		fontWeight: 'bold',
		color: BRAND.primary,
		marginBottom: 6,
		paddingBottom: 4,
		borderBottomWidth: 1,
		borderBottomColor: '#e5e5e5'
	},
	paragraph: {
		marginBottom: 6,
		textAlign: 'justify'
	},
	conspicuous: {
		fontWeight: 'bold',
		color: '#111111'
	},
	bulletPoint: {
		marginBottom: 4,
		paddingLeft: 12
	},
	signatureSection: {
		marginTop: 24,
		paddingTop: 16,
		borderTopWidth: 1,
		borderTopColor: '#e5e5e5'
	},
	signatureIntro: {
		marginBottom: 12,
		fontWeight: 'bold'
	},
	signatureBlock: {
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	signatureColumn: {
		width: '46%'
	},
	signatureParty: {
		fontSize: 9,
		fontWeight: 'bold',
		color: BRAND.primary,
		letterSpacing: 1
	},
	signatureEntity: {
		fontSize: 11,
		fontWeight: 'bold',
		marginBottom: 4
	},
	signatureLine: {
		borderBottomWidth: 1,
		borderBottomColor: '#333333',
		marginTop: 30,
		marginBottom: 4,
		height: 1
	},
	signatureLabel: {
		fontSize: 9,
		color: '#666666',
		marginBottom: 6
	},
	footer: {
		position: 'absolute',
		// A4 is 841.89pt tall. An absolute `bottom` on a fixed element is measured
		// against the whole unbroken document, so place the footer from the top.
		top: 792,
		left: 50,
		right: 50,
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingTop: 8,
		borderTopWidth: 1,
		borderTopColor: '#e5e5e5'
	},
	footerText: {
		fontSize: 8,
		color: '#999999'
	}
})

interface ContractDocumentProps {
	data: ContractData
}

function ClauseBlockView({
	block,
	conspicuous
}: {
	block: ClauseBlock
	conspicuous: boolean
}) {
	if (block.kind === 'bullets') {
		return (
			<View>
				{block.items.map(item => (
					<Text
						key={item}
						style={[styles.bulletPoint, conspicuous ? styles.conspicuous : {}]}
					>
						{`•  ${item}`}
					</Text>
				))}
			</View>
		)
	}
	const bold = conspicuous || block.conspicuous === true
	return (
		<Text style={[styles.paragraph, bold ? styles.conspicuous : {}]}>
			{block.text}
		</Text>
	)
}

function ClauseView({
	clause,
	number
}: {
	clause: ContractClause
	number: number
}) {
	const conspicuous = clause.conspicuous === true
	return (
		<View style={styles.section}>
			{/* Keep each heading with the start of its text. */}
			<Text style={styles.sectionTitle} minPresenceAhead={40}>
				{`${number}. ${clause.title.toUpperCase()}`}
			</Text>
			{clause.blocks.map((block, index) => (
				<ClauseBlockView
					// Blocks are static, ordered clause text.
					key={index}
					block={block}
					conspicuous={conspicuous}
				/>
			))}
		</View>
	)
}

interface SignatureColumnProps {
	role: string
	entity: string
	signerName: string
	signerTitle: string
}

function SignatureColumn({
	role,
	entity,
	signerName,
	signerTitle
}: SignatureColumnProps) {
	return (
		<View style={styles.signatureColumn}>
			<Text style={styles.signatureParty}>{role.toUpperCase()}</Text>
			<Text style={styles.signatureEntity}>{entity}</Text>
			<View style={styles.signatureLine} />
			<Text style={styles.signatureLabel}>Signature</Text>
			<Text style={styles.signatureLabel}>
				Name: {signerName.trim() || BLANK_LINE}
			</Text>
			<Text style={styles.signatureLabel}>
				Title: {signerTitle.trim() || BLANK_LINE}
			</Text>
			<Text style={styles.signatureLabel}>Date: {BLANK_LINE}</Text>
		</View>
	)
}

export function ContractDocument({ data }: ContractDocumentProps) {
	const clauses = buildContractClauses(data)
	const roles = contractRoles(data.template)
	const names = contractPartyNames(data)
	const title = CONTRACT_TEMPLATE_TITLES[data.template]
	const bodyClauses = clauses.slice(0, -1)
	const lastClause = clauses.at(-1)

	const providerDetails = joinNonBlank(
		[
			data.providerAddress,
			cityStateZip(data.providerCity, data.providerState, data.providerZip),
			data.providerEmail
		],
		'\n'
	)
	const clientDetails = joinNonBlank(
		[
			data.clientCompany.trim() && data.clientName.trim()
				? `Attn: ${data.clientName.trim()}`
				: '',
			data.clientAddress,
			cityStateZip(data.clientCity, data.clientState, data.clientZip),
			data.clientEmail
		],
		'\n'
	)

	return (
		<Document title={title} author={names.provider}>
			<Page size="A4" style={styles.page}>
				{/* Fixed footer first so it repeats on every page */}
				<View style={styles.footer} fixed>
					<Text style={styles.footerText}>{title}</Text>
					<Text
						style={styles.footerText}
						render={({ pageNumber, totalPages }) =>
							`Page ${pageNumber} of ${totalPages}`
						}
					/>
				</View>

				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.title}>{title.toUpperCase()}</Text>
					<Text style={styles.subtitle}>
						Between {names.provider} and {names.client}
					</Text>
				</View>

				<Text style={styles.disclaimer}>
					{contractDisclaimer(data.providerState)}
				</Text>

				<Text style={styles.effectiveDate}>
					Effective Date: {formatDocumentDate(data.effectiveDate)}
				</Text>

				{/* Parties */}
				<View style={styles.partiesSection}>
					<View style={styles.partyBlock}>
						<Text style={styles.partyLabel}>
							{roles.provider.toUpperCase()}
						</Text>
						<Text style={styles.partyName}>{names.provider}</Text>
						{providerDetails ? (
							<Text style={styles.partyDetails}>{providerDetails}</Text>
						) : null}
					</View>
					<View style={styles.partyBlock}>
						<Text style={styles.partyLabel}>{roles.client.toUpperCase()}</Text>
						<Text style={styles.partyName}>{names.client}</Text>
						{clientDetails ? (
							<Text style={styles.partyDetails}>{clientDetails}</Text>
						) : null}
					</View>
				</View>

				{/* Clauses */}
				{bodyClauses.map((clause, index) => (
					<ClauseView key={clause.id} clause={clause} number={index + 1} />
				))}

				{/* The last clause and the signatures stay together on one page,
				    so a signature block never sits alone on a page. */}
				<View wrap={false}>
					{lastClause ? (
						<ClauseView clause={lastClause} number={clauses.length} />
					) : null}
					<View style={styles.signatureSection}>
						<Text style={styles.signatureIntro}>
							The parties have signed this agreement as of the Effective Date.
						</Text>
						<View style={styles.signatureBlock}>
							<SignatureColumn
								role={roles.provider}
								entity={names.provider}
								signerName={data.providerSignerName}
								signerTitle={data.providerSignerTitle}
							/>
							<SignatureColumn
								role={roles.client}
								entity={names.client}
								signerName={data.clientName}
								signerTitle={data.clientSignerTitle}
							/>
						</View>
					</View>
				</View>
			</Page>
		</Document>
	)
}
