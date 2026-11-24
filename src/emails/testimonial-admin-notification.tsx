import { Section, Text } from 'react-email'
import { BRAND } from '@/lib/_generated/brand'
import { SITE_URL } from '@/lib/seo-config'
import { BrandButton } from './_components/brand-button'
import { BrandHeading } from './_components/brand-heading'
import { BrandLayout } from './_components/brand-layout'
import { LabelledRow } from './_components/labelled-row'

interface TestimonialAdminNotificationProps {
	clientName: string
	company?: string | null
	role?: string | null
	rating: number
	content: string
	videoUrl?: string | null
	submittedAt: Date
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

// The business runs on Central time; the email renders on a UTC server, so
// the zone is explicit and printed (e.g. "Nov 23, 2026, 2:05 PM CST").
const SUBMITTED_AT_FORMAT = new Intl.DateTimeFormat('en-US', {
	dateStyle: 'medium',
	timeStyle: 'short',
	timeZone: 'America/Chicago'
})

const TIME_ZONE_NAME_FORMAT = new Intl.DateTimeFormat('en-US', {
	timeZone: 'America/Chicago',
	timeZoneName: 'short'
})

function formatSubmittedAt(date: Date): string {
	const zone =
		TIME_ZONE_NAME_FORMAT.formatToParts(date).find(
			part => part.type === 'timeZoneName'
		)?.value ?? 'Central'
	return `${SUBMITTED_AT_FORMAT.format(date)} ${zone}`
}

const TESTIMONIALS_ADMIN_URL = `${SITE_URL}/admin/testimonials`

export function TestimonialAdminNotification({
	clientName,
	company,
	role,
	rating,
	content,
	videoUrl,
	submittedAt
}: TestimonialAdminNotificationProps) {
	return (
		<BrandLayout preview={`New testimonial from ${clientName}`}>
			<BrandHeading level={1}>New Testimonial Received</BrandHeading>

			<Section style={SECTION_STYLE}>
				<LabelledRow label="Name">{clientName}</LabelledRow>
				{company && <LabelledRow label="Company">{company}</LabelledRow>}
				{role && <LabelledRow label="Role">{role}</LabelledRow>}
				<LabelledRow label="Rating">{rating}/5</LabelledRow>
				{videoUrl && <LabelledRow label="Video">{videoUrl}</LabelledRow>}
				<LabelledRow label="Submitted via">Private request link</LabelledRow>
				<LabelledRow label="Submitted at">
					{formatSubmittedAt(submittedAt)}
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

			<Section style={{ margin: '24px 0' }}>
				<BrandButton href={TESTIMONIALS_ADMIN_URL}>Review in admin</BrandButton>
			</Section>

			<Text style={FOOTER_STYLE}>
				This testimonial is unpublished. It goes live only after you publish it
				in /admin/testimonials.
			</Text>
		</BrandLayout>
	)
}
