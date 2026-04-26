import { Column, Row, Section, Text } from 'react-email'
import { BRAND } from '@/lib/_generated/brand'
import { BrandButton } from './_components/brand-button'
import { BrandLayout } from './_components/brand-layout'

interface TtlCalculatorResultsProps {
	purchasePrice: string
	county: string
	downPayment: string
	tradeInValue?: string
	salesTax: string
	titleFee: string
	registrationFees: string
	totalTTL: string
	monthlyPayment: string
	loanTermMonths: number
	interestRate: number
	shareUrl: string
}

// Outlook desktop ignores linear-gradient; the solid backgroundColor is
// the fallback every client respects. Modern clients render the gradient.
const HEADER_STYLE = {
	padding: '32px 24px',
	backgroundColor: BRAND.primary,
	backgroundImage: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDeep} 100%)`,
	textAlign: 'center' as const,
	borderRadius: '8px 8px 0 0'
}

const HEADER_TITLE_STYLE = {
	margin: 0,
	color: '#ffffff',
	fontSize: '24px',
	fontWeight: 600
}

const HEADER_SUB_STYLE = {
	margin: '8px 0 0',
	color: 'rgba(255,255,255,0.9)',
	fontSize: '14px'
}

const DETAILS_BOX_STYLE = {
	backgroundColor: BRAND.muted,
	borderRadius: '8px',
	padding: '16px',
	margin: '24px 0'
}

const SECTION_HEADING_STYLE = {
	margin: '0 0 12px',
	color: BRAND.foreground,
	fontSize: '18px',
	fontWeight: 600
}

const DETAIL_LINE_STYLE = {
	margin: '4px 0',
	color: BRAND.mutedForeground,
	fontSize: '14px'
}

// Outlook desktop ignores `display: flex`. Row + Column render as table
// cells in the email markup, which every client respects.
const BREAKDOWN_LABEL_STYLE = {
	color: BRAND.mutedForeground,
	fontSize: '14px',
	margin: 0,
	padding: '8px 0',
	borderBottom: `1px solid ${BRAND.border}`
}

const BREAKDOWN_VALUE_STYLE = {
	color: BRAND.foreground,
	fontWeight: 500,
	fontSize: '14px',
	margin: 0,
	padding: '8px 0',
	borderBottom: `1px solid ${BRAND.border}`,
	textAlign: 'right' as const
}

const TOTAL_LABEL_STYLE = {
	color: BRAND.primary,
	fontWeight: 600,
	fontSize: '16px',
	margin: 0,
	padding: '12px 0'
}

const TOTAL_VALUE_STYLE = {
	color: BRAND.primary,
	fontWeight: 700,
	fontSize: '20px',
	margin: 0,
	padding: '12px 0',
	textAlign: 'right' as const
}

const PAYMENT_BOX_STYLE = {
	backgroundColor: BRAND.primary,
	borderRadius: '8px',
	padding: '20px',
	textAlign: 'center' as const,
	margin: '24px 0'
}

const PAYMENT_LABEL_STYLE = {
	margin: '0 0 4px',
	color: 'rgba(255,255,255,0.8)',
	fontSize: '14px'
}

const PAYMENT_VALUE_STYLE = {
	margin: 0,
	color: '#ffffff',
	fontSize: '32px',
	fontWeight: 700
}

const PAYMENT_FOOTER_STYLE = {
	margin: '8px 0 0',
	color: 'rgba(255,255,255,0.8)',
	fontSize: '12px'
}

const CTA_WRAP_STYLE = {
	textAlign: 'center' as const,
	padding: '24px 0'
}

const FOOTER_STYLE = {
	padding: '24px',
	backgroundColor: BRAND.muted,
	textAlign: 'center' as const,
	borderTop: `1px solid ${BRAND.border}`,
	marginTop: '24px'
}

const FOOTER_TEXT_STYLE = {
	margin: '0 0 8px',
	color: BRAND.mutedForeground,
	fontSize: '12px'
}

export function TtlCalculatorResults({
	purchasePrice,
	county,
	downPayment,
	tradeInValue,
	salesTax,
	titleFee,
	registrationFees,
	totalTTL,
	monthlyPayment,
	loanTermMonths,
	interestRate,
	shareUrl
}: TtlCalculatorResultsProps) {
	return (
		<BrandLayout preview={`Your Texas TTL: ${totalTTL}`}>
			<Section style={HEADER_STYLE}>
				<Text style={HEADER_TITLE_STYLE}>Texas TTL Calculator</Text>
				<Text style={HEADER_SUB_STYLE}>Your calculation results</Text>
			</Section>

			<Section style={DETAILS_BOX_STYLE}>
				<Text style={SECTION_HEADING_STYLE}>Vehicle Details</Text>
				<Text style={DETAIL_LINE_STYLE}>
					<strong>Purchase Price:</strong> {purchasePrice}
				</Text>
				<Text style={DETAIL_LINE_STYLE}>
					<strong>County:</strong> {county}
				</Text>
				<Text style={DETAIL_LINE_STYLE}>
					<strong>Down Payment:</strong> {downPayment}
				</Text>
				{tradeInValue && (
					<Text style={DETAIL_LINE_STYLE}>
						<strong>Trade-In:</strong> {tradeInValue}
					</Text>
				)}
			</Section>

			<Section style={{ padding: '0 0 24px' }}>
				<Text style={SECTION_HEADING_STYLE}>TTL Breakdown</Text>
				<Row>
					<Column style={{ width: '70%' }}>
						<Text style={BREAKDOWN_LABEL_STYLE}>Sales Tax (6.25%)</Text>
					</Column>
					<Column style={{ width: '30%' }}>
						<Text style={BREAKDOWN_VALUE_STYLE}>{salesTax}</Text>
					</Column>
				</Row>
				<Row>
					<Column style={{ width: '70%' }}>
						<Text style={BREAKDOWN_LABEL_STYLE}>Title &amp; Fees</Text>
					</Column>
					<Column style={{ width: '30%' }}>
						<Text style={BREAKDOWN_VALUE_STYLE}>{titleFee}</Text>
					</Column>
				</Row>
				<Row>
					<Column style={{ width: '70%' }}>
						<Text style={BREAKDOWN_LABEL_STYLE}>Registration</Text>
					</Column>
					<Column style={{ width: '30%' }}>
						<Text style={BREAKDOWN_VALUE_STYLE}>{registrationFees}</Text>
					</Column>
				</Row>
				<Row>
					<Column style={{ width: '70%' }}>
						<Text style={TOTAL_LABEL_STYLE}>Total TTL</Text>
					</Column>
					<Column style={{ width: '30%' }}>
						<Text style={TOTAL_VALUE_STYLE}>{totalTTL}</Text>
					</Column>
				</Row>
			</Section>

			<Section style={PAYMENT_BOX_STYLE}>
				<Text style={PAYMENT_LABEL_STYLE}>Estimated Monthly Payment</Text>
				<Text style={PAYMENT_VALUE_STYLE}>{monthlyPayment}</Text>
				<Text style={PAYMENT_FOOTER_STYLE}>
					{loanTermMonths} months @ {interestRate}% APR
				</Text>
			</Section>

			<Section style={CTA_WRAP_STYLE}>
				<BrandButton href={shareUrl}>View Full Results</BrandButton>
				<Text
					style={{
						margin: '12px 0 0',
						color: BRAND.mutedForeground,
						fontSize: '12px'
					}}
				>
					This link will work for 90 days
				</Text>
			</Section>

			<Section style={FOOTER_STYLE}>
				<Text style={FOOTER_TEXT_STYLE}>
					<strong>Disclaimer:</strong> This calculator provides estimates only.
					Actual fees may vary by county.
				</Text>
				<Text style={FOOTER_TEXT_STYLE}>
					Powered by Hudson Digital Solutions
				</Text>
			</Section>
		</BrandLayout>
	)
}
