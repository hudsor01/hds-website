import { Link, Section } from 'react-email'
import { BRAND } from '@/lib/_generated/brand'
import { BrandHeading } from './_components/brand-heading'
import { BrandLayout } from './_components/brand-layout'
import { LabelledRow } from './_components/labelled-row'

interface CalculatorAdminNotificationProps {
	calculatorName: string
	email: string
	name?: string
	company?: string
	leadScore: number
	leadQuality: string
}

const SECTION_STYLE = {
	backgroundColor: '#ffffff',
	padding: '20px',
	border: `1px solid ${BRAND.border}`,
	borderRadius: '8px',
	margin: '20px 0'
}

export function CalculatorAdminNotification({
	calculatorName,
	email,
	name,
	company,
	leadScore,
	leadQuality
}: CalculatorAdminNotificationProps) {
	return (
		<BrandLayout preview={`New ${calculatorName} lead: ${email}`}>
			<BrandHeading level={1}>New Calculator Lead</BrandHeading>

			<Section style={SECTION_STYLE}>
				<LabelledRow label="Calculator">{calculatorName}</LabelledRow>
				<LabelledRow label="Email">
					<Link
						href={`mailto:${email}`}
						style={{ color: BRAND.primary, textDecoration: 'underline' }}
					>
						{email}
					</Link>
				</LabelledRow>
				{name && <LabelledRow label="Name">{name}</LabelledRow>}
				{company && <LabelledRow label="Company">{company}</LabelledRow>}
				<LabelledRow label="Lead Score">
					{leadScore}/100 ({leadQuality.toUpperCase()})
				</LabelledRow>
				<LabelledRow label="Submitted at">
					{new Date().toLocaleString()}
				</LabelledRow>
			</Section>
		</BrandLayout>
	)
}
