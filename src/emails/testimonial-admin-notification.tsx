import { Section, Text } from 'react-email'
import { BRAND } from '@/lib/_generated/brand'
import { BrandHeading } from './_components/brand-heading'
import { BrandLayout } from './_components/brand-layout'
import { LabelledRow } from './_components/labelled-row'

interface TestimonialAdminNotificationProps {
	clientName: string
	company?: string | null
	role?: string | null
	rating: number
	serviceType?: string | null
	content: string
	isPrivateLink: boolean
}

const SECTION_STYLE = {
	backgroundColor: '#ffffff',
	padding: '20px',
	border: `1px solid ${BRAND.border}`,
	borderRadius: '8px',
	margin: '20px 0'
}

const CONTENT_BOX_STYLE = {
	backgroundColor: BRAND.muted,
	padding: '20px',
	borderRadius: '8px',
	margin: '20px 0'
}

const FOOTER_STYLE = {
	marginTop: '20px',
	color: BRAND.mutedForeground,
	fontSize: '12px'
}

export function TestimonialAdminNotification({
	clientName,
	company,
	role,
	rating,
	serviceType,
	content,
	isPrivateLink
}: TestimonialAdminNotificationProps) {
	return (
		<BrandLayout preview={`New testimonial from ${clientName}`}>
			<BrandHeading level={1}>New Testimonial Received</BrandHeading>

			<Section style={SECTION_STYLE}>
				<LabelledRow label="Name">{clientName}</LabelledRow>
				{company && <LabelledRow label="Company">{company}</LabelledRow>}
				{role && <LabelledRow label="Role">{role}</LabelledRow>}
				<LabelledRow label="Rating">{rating}/5</LabelledRow>
				{serviceType && (
					<LabelledRow label="Service">{serviceType}</LabelledRow>
				)}
				<LabelledRow label="Submitted via">
					{isPrivateLink ? 'Private link' : 'Public form'}
				</LabelledRow>
				<LabelledRow label="Submitted at">
					{new Date().toLocaleString()}
				</LabelledRow>
			</Section>

			<Section style={CONTENT_BOX_STYLE}>
				<BrandHeading level={2}>Testimonial Content</BrandHeading>
				<Text
					style={{
						whiteSpace: 'pre-wrap',
						fontSize: '14px',
						lineHeight: 1.6,
						margin: 0
					}}
				>
					{content}
				</Text>
			</Section>

			<Text style={FOOTER_STYLE}>
				This testimonial is pending review. Log in to approve or reject it.
			</Text>
		</BrandLayout>
	)
}
