import { Link, Section, Text } from 'react-email'
import { BRAND } from '@/lib/_generated/brand'
import { BrandHeading } from './_components/brand-heading'
import { BrandLayout } from './_components/brand-layout'
import { LabelledRow } from './_components/labelled-row'

interface ContactAdminNotificationProps {
	firstName: string
	lastName: string
	email: string
	phone?: string
	company?: string
	service?: string
	budget?: string
	timeline?: string
	message: string
	leadScore?: number
	sequenceId?: string
}

const SECTION_STYLE = {
	backgroundColor: '#ffffff',
	padding: '20px',
	border: `1px solid ${BRAND.border}`,
	borderRadius: '8px',
	margin: '20px 0'
}

const MESSAGE_BOX_STYLE = {
	backgroundColor: BRAND.muted,
	padding: '20px',
	borderRadius: '8px',
	margin: '20px 0'
}

const LEAD_BOX_STYLE = {
	backgroundColor: BRAND.muted,
	padding: '20px',
	borderRadius: '8px',
	margin: '20px 0'
}

const FOOTER_STYLE = {
	marginTop: '24px',
	color: BRAND.mutedForeground,
	fontSize: '12px',
	lineHeight: 1.5
}

function getCategory(score: number): string {
	if (score >= 80) {
		return '(HIGH PRIORITY)'
	}
	if (score >= 50) {
		return '(QUALIFIED)'
	}
	return '(NURTURE)'
}

function getRecommendedAction(score: number): string {
	if (score >= 80) {
		return 'Schedule call within 24 hours'
	}
	if (score >= 50) {
		return 'Follow up within 2-3 days'
	}
	return 'Add to nurture sequence'
}

export function ContactAdminNotification({
	firstName,
	lastName,
	email,
	phone,
	company,
	service,
	budget,
	timeline,
	message,
	leadScore,
	sequenceId
}: ContactAdminNotificationProps) {
	const sequence = sequenceId ?? 'standard-welcome'

	return (
		<BrandLayout preview={`New contact: ${firstName} ${lastName}`}>
			<BrandHeading level={1}>New Contact Form Submission</BrandHeading>

			<Section style={SECTION_STYLE}>
				<BrandHeading level={2}>Contact Information</BrandHeading>
				<LabelledRow label="Name">
					{firstName} {lastName}
				</LabelledRow>
				<LabelledRow label="Email">
					<Link
						href={`mailto:${email}`}
						style={{ color: BRAND.primary, textDecoration: 'underline' }}
					>
						{email}
					</Link>
				</LabelledRow>
				{phone && (
					<LabelledRow label="Phone">
						<Link
							href={`tel:${phone}`}
							style={{ color: BRAND.primary, textDecoration: 'underline' }}
						>
							{phone}
						</Link>
					</LabelledRow>
				)}
				{company && <LabelledRow label="Company">{company}</LabelledRow>}
				{service && (
					<LabelledRow label="Service Interest">{service}</LabelledRow>
				)}
				{budget && <LabelledRow label="Budget">{budget}</LabelledRow>}
				{timeline && <LabelledRow label="Timeline">{timeline}</LabelledRow>}
			</Section>

			{leadScore !== undefined && (
				<Section style={LEAD_BOX_STYLE}>
					<BrandHeading level={2}>Lead Intelligence</BrandHeading>
					<LabelledRow label="Lead Score">
						{leadScore}/100 {getCategory(leadScore)}
					</LabelledRow>
					<LabelledRow label="Email Sequence">{sequence}</LabelledRow>
					<LabelledRow label="Recommended Action">
						{getRecommendedAction(leadScore)}
					</LabelledRow>
				</Section>
			)}

			<Section style={MESSAGE_BOX_STYLE}>
				<BrandHeading level={2}>Message</BrandHeading>
				<Text
					style={{
						whiteSpace: 'pre-wrap',
						fontSize: '14px',
						lineHeight: 1.6,
						margin: 0
					}}
				>
					{message}
				</Text>
			</Section>

			<Text style={FOOTER_STYLE}>
				Submitted: {new Date().toLocaleString()}
				<br />
				Source: Hudson Digital Solutions Contact Form
				{leadScore !== undefined && (
					<>
						<br />
						Lead Score: {leadScore}/100 | Sequence: {sequence}
					</>
				)}
			</Text>
		</BrandLayout>
	)
}
