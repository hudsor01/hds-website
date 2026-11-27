/**
 * Invoice PDF Template
 * Uses @react-pdf/renderer for PDF generation. Every number comes from
 * computeInvoiceTotals, the same function the on-screen form uses.
 */

import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { BRAND } from '@/lib/_generated/brand'
import { formatDocumentDate } from '@/lib/documents/dates'
import { cityStateZip, joinNonBlank } from '@/lib/documents/format'
import { computeInvoiceTotals } from '@/lib/documents/invoice'
import { formatCents } from '@/lib/documents/money'
import type { InvoiceData } from '@/types/pdf-templates'

// Styles for the PDF document
const styles = StyleSheet.create({
	page: {
		paddingTop: 40,
		paddingHorizontal: 40,
		// Room for the fixed footer so it never overlaps body text.
		paddingBottom: 80,
		fontFamily: 'Helvetica',
		fontSize: 10,
		color: '#333333'
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 30,
		paddingBottom: 20,
		borderBottomWidth: 2,
		borderBottomColor: BRAND.primary
	},
	companyInfo: {
		flex: 1
	},
	companyName: {
		fontSize: 20,
		fontWeight: 'bold',
		color: BRAND.primary,
		marginBottom: 4
	},
	companyDetails: {
		fontSize: 9,
		color: '#666666',
		lineHeight: 1.5
	},
	invoiceTitle: {
		textAlign: 'right'
	},
	invoiceTitleText: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#333333',
		letterSpacing: 2
	},
	invoiceNumber: {
		fontSize: 10,
		color: '#666666',
		marginTop: 4
	},
	addressSection: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 30
	},
	addressBlock: {
		flex: 1
	},
	addressLabel: {
		fontSize: 8,
		fontWeight: 'bold',
		color: BRAND.primary,
		marginBottom: 6,
		letterSpacing: 1
	},
	addressText: {
		fontSize: 10,
		lineHeight: 1.6,
		color: '#333333'
	},
	invoiceDetails: {
		alignItems: 'flex-end'
	},
	detailRow: {
		flexDirection: 'row',
		marginBottom: 4
	},
	detailLabel: {
		fontSize: 9,
		color: '#666666',
		width: 80,
		textAlign: 'right',
		marginRight: 10
	},
	detailValue: {
		fontSize: 10,
		fontWeight: 'bold',
		color: '#333333',
		width: 110
	},
	table: {
		marginBottom: 30
	},
	tableHeader: {
		flexDirection: 'row',
		backgroundColor: BRAND.primary,
		paddingVertical: 10,
		paddingHorizontal: 8
	},
	tableHeaderText: {
		color: '#ffffff',
		fontWeight: 'bold',
		fontSize: 9,
		letterSpacing: 0.5
	},
	tableRow: {
		flexDirection: 'row',
		paddingVertical: 12,
		paddingHorizontal: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#e5e5e5'
	},
	tableRowAlt: {
		backgroundColor: '#f9fafb'
	},
	colDescription: {
		flex: 3
	},
	colQty: {
		flex: 1,
		textAlign: 'center'
	},
	colRate: {
		flex: 1,
		textAlign: 'right'
	},
	colAmount: {
		flex: 1,
		textAlign: 'right'
	},
	totalsSection: {
		alignItems: 'flex-end',
		marginBottom: 30
	},
	totalRow: {
		flexDirection: 'row',
		paddingVertical: 6,
		width: 250
	},
	totalLabel: {
		flex: 1,
		fontSize: 10,
		color: '#666666'
	},
	totalValue: {
		width: 100,
		fontSize: 10,
		textAlign: 'right',
		color: '#333333'
	},
	grandTotalRow: {
		flexDirection: 'row',
		paddingVertical: 10,
		width: 250,
		borderTopWidth: 2,
		borderTopColor: BRAND.primary,
		marginTop: 6
	},
	grandTotalLabel: {
		flex: 1,
		fontSize: 12,
		fontWeight: 'bold',
		color: BRAND.primary
	},
	grandTotalValue: {
		width: 100,
		fontSize: 14,
		fontWeight: 'bold',
		textAlign: 'right',
		color: BRAND.primary
	},
	notesSection: {
		marginTop: 20,
		padding: 15,
		backgroundColor: '#f9fafb',
		borderRadius: 4
	},
	notesLabel: {
		fontSize: 9,
		fontWeight: 'bold',
		color: BRAND.primary,
		marginBottom: 6,
		letterSpacing: 0.5
	},
	notesText: {
		fontSize: 9,
		color: '#666666',
		lineHeight: 1.6
	},
	footer: {
		position: 'absolute',
		// A4 is 841.89pt tall. An absolute `bottom` on a fixed element is measured
		// against the whole unbroken document, so place the footer from the top.
		top: 792,
		left: 40,
		right: 40,
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingTop: 10,
		borderTopWidth: 1,
		borderTopColor: '#e5e5e5'
	},
	footerText: {
		fontSize: 8,
		color: '#999999'
	}
})

interface InvoiceDocumentProps {
	data: InvoiceData
}

/** Format a quantity without float noise: 1.5 stays 1.5, 2 stays 2. */
const formatQuantity = (quantity: number): string =>
	Number(quantity.toFixed(4)).toString()

export function InvoiceDocument({ data }: InvoiceDocumentProps) {
	const totals = computeInvoiceTotals(data)
	const companyDetails = joinNonBlank(
		[
			data.companyAddress,
			cityStateZip(data.companyCity, data.companyState, data.companyZip),
			data.companyEmail,
			data.companyPhone
		],
		'\n'
	)
	const billTo = joinNonBlank(
		[
			data.clientName,
			data.clientCompany,
			data.clientAddress,
			cityStateZip(data.clientCity, data.clientState, data.clientZip),
			data.clientEmail
		],
		'\n'
	)

	return (
		<Document title={`Invoice ${data.invoiceNumber}`} author={data.companyName}>
			<Page size="A4" style={styles.page}>
				{/* Fixed footer first so it repeats on every page */}
				<View style={styles.footer} fixed>
					<Text style={styles.footerText}>
						{joinNonBlank(
							[data.companyName, `Invoice #${data.invoiceNumber}`],
							' | '
						)}
					</Text>
					<Text
						style={styles.footerText}
						render={({ pageNumber, totalPages }) =>
							`Page ${pageNumber} of ${totalPages}`
						}
					/>
				</View>

				{/* Header */}
				<View style={styles.header}>
					<View style={styles.companyInfo}>
						<Text style={styles.companyName}>{data.companyName}</Text>
						{companyDetails ? (
							<Text style={styles.companyDetails}>{companyDetails}</Text>
						) : null}
					</View>
					<View style={styles.invoiceTitle}>
						<Text style={styles.invoiceTitleText}>INVOICE</Text>
						<Text style={styles.invoiceNumber}>#{data.invoiceNumber}</Text>
					</View>
				</View>

				{/* Bill To & Invoice Details */}
				<View style={styles.addressSection}>
					<View style={styles.addressBlock}>
						<Text style={styles.addressLabel}>BILL TO</Text>
						<Text style={styles.addressText}>{billTo}</Text>
					</View>
					<View style={styles.invoiceDetails}>
						<View style={styles.detailRow}>
							<Text style={styles.detailLabel}>Invoice Date:</Text>
							<Text style={styles.detailValue}>
								{formatDocumentDate(data.invoiceDate)}
							</Text>
						</View>
						<View style={styles.detailRow}>
							<Text style={styles.detailLabel}>Due Date:</Text>
							<Text style={styles.detailValue}>
								{formatDocumentDate(data.dueDate)}
							</Text>
						</View>
						<View style={styles.detailRow}>
							<Text style={styles.detailLabel}>Payment Terms:</Text>
							<Text style={styles.detailValue}>{data.paymentTerms}</Text>
						</View>
					</View>
				</View>

				{/* Line Items Table */}
				<View style={styles.table}>
					<View style={styles.tableHeader}>
						<Text style={[styles.tableHeaderText, styles.colDescription]}>
							Description
						</Text>
						<Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
						<Text style={[styles.tableHeaderText, styles.colRate]}>Rate</Text>
						<Text style={[styles.tableHeaderText, styles.colAmount]}>
							Amount
						</Text>
					</View>
					{totals.lines.map((line, index) => (
						<View
							key={line.id}
							wrap={false}
							style={[
								styles.tableRow,
								index % 2 === 1 ? styles.tableRowAlt : {}
							]}
						>
							<Text style={styles.colDescription}>{line.description}</Text>
							<Text style={styles.colQty}>{formatQuantity(line.quantity)}</Text>
							<Text style={styles.colRate}>{formatCents(line.rateCents)}</Text>
							<Text style={styles.colAmount}>
								{formatCents(line.amountCents)}
							</Text>
						</View>
					))}
				</View>

				{/* Totals */}
				<View style={styles.totalsSection} wrap={false}>
					<View style={styles.totalRow}>
						<Text style={styles.totalLabel}>Subtotal</Text>
						<Text style={styles.totalValue}>
							{formatCents(totals.subtotalCents)}
						</Text>
					</View>
					{data.taxRate > 0 && (
						<View style={styles.totalRow}>
							<Text style={styles.totalLabel}>Tax ({data.taxRate}%)</Text>
							<Text style={styles.totalValue}>
								{formatCents(totals.taxCents)}
							</Text>
						</View>
					)}
					<View style={styles.grandTotalRow}>
						<Text style={styles.grandTotalLabel}>Total Due</Text>
						<Text style={styles.grandTotalValue}>
							{formatCents(totals.totalCents)}
						</Text>
					</View>
				</View>

				{/* Notes */}
				{data.notes.trim() ? (
					<View style={styles.notesSection} wrap={false}>
						<Text style={styles.notesLabel}>NOTES</Text>
						<Text style={styles.notesText}>{data.notes.trim()}</Text>
					</View>
				) : null}
			</Page>
		</Document>
	)
}
