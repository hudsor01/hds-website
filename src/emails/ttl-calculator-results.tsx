import { Section, Text } from 'react-email'
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

const HEADER_STYLE = {
	padding: '32px 24px',
	background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDeep} 100%)`,
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

const BREAKDOWN_ROW_STYLE = {
	display: 'flex',
	justifyContent: 'space-between',
	padding: '8px 0',
	borderBottom: `1px solid ${BRAND.border}`,
	color: BRAND.mutedForeground,
	fontSize: '14px'
}

const TOTAL_ROW_STYLE = {
	display: 'flex',
	justifyContent: 'space-between',
	padding: '12px 0',
	color: BRAND.primary,
	fontWeight: 600,
	fontSize: '16px'
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
				<Text style={BREAKDOWN_ROW_STYLE}>
					<span>Sales Tax (6.25%)</span>
					<span style={{ color: BRAND.foreground, fontWeight: 500 }}>
						{salesTax}
					</span>
				</Text>
				<Text style={BREAKDOWN_ROW_STYLE}>
					<span>Title &amp; Fees</span>
					<span style={{ color: BRAND.foreground, fontWeight: 500 }}>
						{titleFee}
					</span>
				</Text>
				<Text style={BREAKDOWN_ROW_STYLE}>
					<span>Registration</span>
					<span style={{ color: BRAND.foreground, fontWeight: 500 }}>
						{registrationFees}
					</span>
				</Text>
				<Text style={TOTAL_ROW_STYLE}>
					<span>Total TTL</span>
					<span style={{ fontSize: '20px', fontWeight: 700 }}>{totalTTL}</span>
				</Text>
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
					Powered by{' '}
					<a
						href="https://hudsondigitalsolutions.com"
						style={{ color: BRAND.primary, textDecoration: 'none' }}
					>
						Hudson Digital Solutions
					</a>
				</Text>
			</Section>
		</BrandLayout>
	)
}
