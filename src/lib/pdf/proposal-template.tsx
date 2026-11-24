/**
 * Proposal PDF Template
 * Uses @react-pdf/renderer for PDF generation. Pricing rows and the total
 * come from computeProposalPricing, the same function the form uses.
 */

import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { BRAND } from '@/lib/_generated/brand'
import { formatDocumentDate } from '@/lib/documents/dates'
import { cityStateZip, joinNonBlank } from '@/lib/documents/format'
import { formatCents } from '@/lib/documents/money'
import { computeProposalPricing } from '@/lib/documents/proposal'
import type {
	ProposalData,
	ProposalMilestone,
	ProposalPricingItem
} from '@/types/pdf-templates'

// Re-export types for convenience
export type { ProposalData, ProposalMilestone, ProposalPricingItem }

const styles = StyleSheet.create({
	page: {
		paddingTop: 50,
		paddingHorizontal: 50,
		// Room for the fixed footer so it never overlaps body text.
		paddingBottom: 80,
		fontFamily: 'Helvetica',
		fontSize: 10,
		color: '#333333',
		lineHeight: 1.6
	},
	coverPage: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 50
	},
	coverTitle: {
		fontSize: 36,
		fontWeight: 'bold',
		color: BRAND.primary,
		marginBottom: 20,
		textAlign: 'center'
	},
	coverSubtitle: {
		fontSize: 14,
		color: '#666666',
		marginBottom: 40,
		textAlign: 'center'
	},
	coverClient: {
		fontSize: 18,
		color: '#333333',
		marginBottom: 10,
		textAlign: 'center'
	},
	coverDate: {
		fontSize: 12,
		color: '#666666',
		marginTop: 40,
		textAlign: 'center'
	},
	coverCompany: {
		position: 'absolute',
		bottom: 50,
		left: 50,
		right: 50,
		textAlign: 'center'
	},
	coverCompanyName: {
		fontSize: 14,
		fontWeight: 'bold',
		color: BRAND.primary,
		marginBottom: 4
	},
	coverCompanyDetails: {
		fontSize: 9,
		color: '#666666'
	},
	header: {
		marginBottom: 20,
		paddingBottom: 10,
		borderBottomWidth: 2,
		borderBottomColor: BRAND.primary,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	headerCompany: {
		fontSize: 12,
		fontWeight: 'bold',
		color: BRAND.primary
	},
	headerProject: {
		fontSize: 10,
		color: '#666666'
	},
	section: {
		marginBottom: 25
	},
	sectionTitle: {
		fontSize: 14,
		fontWeight: 'bold',
		color: BRAND.primary,
		marginBottom: 12,
		paddingBottom: 6,
		borderBottomWidth: 1,
		borderBottomColor: '#e5e5e5'
	},
	paragraph: {
		marginBottom: 10,
		textAlign: 'justify'
	},
	scopeItem: {
		marginBottom: 8,
		paddingLeft: 15,
		flexDirection: 'row'
	},
	scopeBullet: {
		marginRight: 10,
		color: BRAND.primary
	},
	scopeText: {
		flex: 1
	},
	milestoneRow: {
		flexDirection: 'row',
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#e5e5e5'
	},
	milestonePhase: {
		width: '20%',
		fontWeight: 'bold'
	},
	milestoneDesc: {
		flex: 1
	},
	milestoneDuration: {
		width: '20%',
		textAlign: 'right',
		color: '#666666'
	},
	pricingTable: {
		marginTop: 10
	},
	pricingHeader: {
		flexDirection: 'row',
		backgroundColor: BRAND.primary,
		paddingVertical: 10,
		paddingHorizontal: 8
	},
	pricingHeaderText: {
		color: '#ffffff',
		fontWeight: 'bold',
		fontSize: 9
	},
	pricingRow: {
		flexDirection: 'row',
		paddingVertical: 10,
		paddingHorizontal: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#e5e5e5'
	},
	pricingRowAlt: {
		backgroundColor: '#f9fafb'
	},
	pricingItem: {
		flex: 3
	},
	pricingPrice: {
		flex: 1,
		textAlign: 'right',
		fontWeight: 'bold'
	},
	totalRow: {
		flexDirection: 'row',
		paddingVertical: 12,
		paddingHorizontal: 8,
		backgroundColor: BRAND.primary,
		marginTop: 2
	},
	totalLabel: {
		flex: 3,
		fontWeight: 'bold',
		color: '#ffffff',
		fontSize: 11
	},
	totalValue: {
		flex: 1,
		textAlign: 'right',
		fontWeight: 'bold',
		color: '#ffffff',
		fontSize: 12
	},
	termsSection: {
		marginTop: 20,
		padding: 15,
		backgroundColor: '#f9fafb',
		borderRadius: 4
	},
	termItem: {
		marginBottom: 8,
		fontSize: 9
	},
	termTitle: {
		fontWeight: 'bold',
		color: '#333333'
	},
	termText: {
		color: '#666666'
	},
	aboutSection: {
		marginTop: 30,
		paddingTop: 20,
		borderTopWidth: 1,
		borderTopColor: '#e5e5e5'
	},
	signatureSection: {
		marginTop: 40,
		paddingTop: 20
	},
	signatureBlock: {
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	signatureColumn: {
		width: '45%'
	},
	signatureLine: {
		borderBottomWidth: 1,
		borderBottomColor: '#333333',
		marginBottom: 5,
		marginTop: 30,
		height: 1
	},
	signatureLabel: {
		fontSize: 8,
		color: '#666666',
		marginBottom: 3
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
		paddingTop: 10,
		borderTopWidth: 1,
		borderTopColor: '#e5e5e5'
	},
	footerText: {
		fontSize: 8,
		color: '#999999'
	},
	smallNote: {
		marginTop: 10,
		fontSize: 9,
		color: '#666666'
	},
	validUntil: {
		backgroundColor: '#fff7ed',
		padding: 10,
		borderRadius: 4,
		marginTop: 15,
		textAlign: 'center'
	},
	validUntilText: {
		fontSize: 10,
		color: '#c2410c',
		fontWeight: 'bold'
	}
})

interface ProposalDocumentProps {
	data: ProposalData
}

interface PageChromeProps {
	companyName: string
	projectName: string
}

/** Header repeated on every content page. */
function PageHeader({ companyName, projectName }: PageChromeProps) {
	return (
		<View style={styles.header} fixed>
			<Text style={styles.headerCompany}>{companyName}</Text>
			<Text style={styles.headerProject}>{projectName}</Text>
		</View>
	)
}

/** Fixed footer with page numbers, inside the page's bottom padding. */
function PageFooter({ companyName, projectName }: PageChromeProps) {
	return (
		<View style={styles.footer} fixed>
			<Text style={styles.footerText}>
				{joinNonBlank([companyName, projectName], ' | ')}
			</Text>
			<Text
				style={styles.footerText}
				render={({ pageNumber, totalPages }) =>
					`Page ${pageNumber} of ${totalPages}`
				}
			/>
		</View>
	)
}

export function ProposalDocument({ data }: ProposalDocumentProps) {
	const pricing = computeProposalPricing(data.pricingItems)
	const scopeItems = data.scopeItems.map(item => item.trim()).filter(Boolean)
	const milestones = data.milestones.filter(
		m => m.description.trim() || m.duration.trim()
	)
	const clientLabel = data.clientCompany.trim() || data.clientName.trim()
	const contactLine = joinNonBlank(
		[data.companyEmail, data.companyPhone],
		' | '
	)
	const addressBlock = joinNonBlank(
		[
			data.companyAddress,
			cityStateZip(data.companyCity, data.companyState, data.companyZip),
			contactLine
		],
		'\n'
	)
	const companyDescription = data.companyDescription.trim()
	const validUntil = formatDocumentDate(data.validUntil)
	const chrome = {
		companyName: data.companyName,
		projectName: data.projectName
	}

	return (
		<Document title={`Proposal: ${data.projectName}`} author={data.companyName}>
			{/* Cover Page */}
			<Page size="A4" style={styles.page}>
				<View style={styles.coverPage}>
					<Text style={styles.coverTitle}>PROJECT PROPOSAL</Text>
					<Text style={styles.coverSubtitle}>{data.projectName}</Text>
					<Text style={styles.coverClient}>Prepared for: {clientLabel}</Text>
					<Text style={styles.coverDate}>
						{formatDocumentDate(data.projectDate)}
					</Text>
				</View>
				<View style={styles.coverCompany}>
					<Text style={styles.coverCompanyName}>{data.companyName}</Text>
					{contactLine ? (
						<Text style={styles.coverCompanyDetails}>{contactLine}</Text>
					) : null}
				</View>
			</Page>

			{/* Content Pages */}
			<Page size="A4" style={styles.page}>
				{/* Fixed footer first so it repeats on every page */}
				<PageFooter {...chrome} />
				<PageHeader {...chrome} />

				{/* Overview */}
				{data.overview.trim() ? (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Project Overview</Text>
						<Text style={styles.paragraph}>{data.overview.trim()}</Text>
					</View>
				) : null}

				{/* Scope of Work */}
				{scopeItems.length > 0 ? (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Scope of Work</Text>
						{scopeItems.map((item, index) => (
							<View
								key={`${index}-${item}`}
								style={styles.scopeItem}
								wrap={false}
							>
								<Text style={styles.scopeBullet}>&#8226;</Text>
								<Text style={styles.scopeText}>{item}</Text>
							</View>
						))}
					</View>
				) : null}

				{/* Timeline */}
				{milestones.length > 0 ? (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Project Timeline</Text>
						{milestones.map(milestone => (
							<View key={milestone.id} style={styles.milestoneRow} wrap={false}>
								<Text style={styles.milestonePhase}>{milestone.phase}</Text>
								<Text style={styles.milestoneDesc}>
									{milestone.description}
								</Text>
								<Text style={styles.milestoneDuration}>
									{milestone.duration}
								</Text>
							</View>
						))}
					</View>
				) : null}

				{/* Pricing: the same rows the total is summed from */}
				{pricing.rows.length > 0 ? (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Investment</Text>
						<View style={styles.pricingTable}>
							<View style={styles.pricingHeader}>
								<Text style={[styles.pricingHeaderText, styles.pricingItem]}>
									Description
								</Text>
								<Text style={[styles.pricingHeaderText, styles.pricingPrice]}>
									Amount
								</Text>
							</View>
							{pricing.rows.map((row, index) => (
								<View
									key={row.id}
									wrap={false}
									style={[
										styles.pricingRow,
										index % 2 === 1 ? styles.pricingRowAlt : {}
									]}
								>
									<Text style={styles.pricingItem}>{row.description}</Text>
									<Text style={styles.pricingPrice}>
										{formatCents(row.cents)}
									</Text>
								</View>
							))}
							<View style={styles.totalRow} wrap={false}>
								<Text style={styles.totalLabel}>Total Investment</Text>
								<Text style={styles.totalValue}>
									{formatCents(pricing.totalCents)}
								</Text>
							</View>
						</View>
					</View>
				) : null}

				{/* Payment terms and validity print even without pricing rows */}
				{data.paymentTerms.trim() ? (
					<Text style={[styles.paragraph, styles.smallNote]}>
						Payment Terms: {data.paymentTerms.trim()}
					</Text>
				) : null}

				{validUntil ? (
					<View style={styles.validUntil} wrap={false}>
						<Text style={styles.validUntilText}>
							This proposal is valid until {validUntil}
						</Text>
					</View>
				) : null}
			</Page>

			{/* Terms & About Page */}
			<Page size="A4" style={styles.page}>
				{/* Fixed footer first so it repeats on every page */}
				<PageFooter {...chrome} />
				<PageHeader {...chrome} />

				{data.terms.trim() ? (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Terms &amp; Conditions</Text>
						<Text style={styles.paragraph}>{data.terms.trim()}</Text>
					</View>
				) : null}

				{companyDescription || addressBlock ? (
					<View style={styles.aboutSection} wrap={false}>
						<Text style={styles.sectionTitle}>About {data.companyName}</Text>
						{companyDescription ? (
							<Text style={styles.paragraph}>{companyDescription}</Text>
						) : null}
						{addressBlock ? (
							<Text style={[styles.paragraph, styles.smallNote]}>
								{addressBlock}
							</Text>
						) : null}
					</View>
				) : null}

				{/* Signature Section: never split across pages */}
				<View style={styles.signatureSection} wrap={false}>
					<Text style={{ marginBottom: 10, fontWeight: 'bold' }}>
						To accept this proposal, please sign below:
					</Text>
					<View style={styles.signatureBlock}>
						<View style={styles.signatureColumn}>
							<View style={styles.signatureLine} />
							<Text style={styles.signatureLabel}>Client Signature</Text>
							<Text style={{ fontSize: 10 }}>{clientLabel}</Text>
							<Text style={styles.signatureLabel}>
								Date: __________________
							</Text>
						</View>
						<View style={styles.signatureColumn}>
							<View style={styles.signatureLine} />
							<Text style={styles.signatureLabel}>Signature</Text>
							<Text style={{ fontSize: 10 }}>{data.companyName}</Text>
							<Text style={styles.signatureLabel}>
								Date: __________________
							</Text>
						</View>
					</View>
				</View>
			</Page>
		</Document>
	)
}
