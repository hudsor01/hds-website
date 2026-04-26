import { Link, Section } from 'react-email'
import { BRAND } from '@/lib/_generated/brand'
import { BrandHeading } from './_components/brand-heading'
import { BrandLayout } from './_components/brand-layout'
import { LabelledRow } from './_components/labelled-row'

interface NewsletterAdminNotificationProps {
	email: string
	source: string
}

const SECTION_STYLE = {
	backgroundColor: '#ffffff',
	padding: '20px',
	border: `1px solid ${BRAND.border}`,
	borderRadius: '8px',
	margin: '20px 0'
}

export function NewsletterAdminNotification({
	email,
	source
}: NewsletterAdminNotificationProps) {
	return (
		<BrandLayout preview={`New newsletter subscriber: ${email}`}>
			<BrandHeading level={1}>New Newsletter Subscriber</BrandHeading>

			<Section style={SECTION_STYLE}>
				<LabelledRow label="Email">
					<Link
						href={`mailto:${email}`}
						style={{ color: BRAND.primary, textDecoration: 'underline' }}
					>
						{email}
					</Link>
				</LabelledRow>
				<LabelledRow label="Source">{source}</LabelledRow>
				<LabelledRow label="Subscribed at">
					{new Date().toLocaleString()}
				</LabelledRow>
			</Section>
		</BrandLayout>
	)
}
