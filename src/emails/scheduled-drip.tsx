import { Link, Section, Text } from 'react-email'
import { BRAND } from '@/lib/_generated/brand'
import { BUSINESS_INFO } from '@/lib/constants/business'
import { BrandFooter } from './_components/brand-footer'
import { BrandLayout } from './_components/brand-layout'
import { parseContent } from './_components/scheduled-drip-parser'

interface ScheduledDripProps {
	subject: string
	content: string
	recipientEmail: string
}

const PARAGRAPH_STYLE = {
	margin: '15px 0',
	fontSize: '14px',
	lineHeight: 1.6
}

const HEADING_STYLE = {
	color: BRAND.primary,
	margin: '25px 0 15px 0',
	fontSize: '18px',
	fontWeight: 600
}

const LIST_STYLE = {
	margin: '15px 0',
	paddingLeft: '20px',
	fontSize: '14px',
	lineHeight: 1.6
}

const SIGNATURE_STYLE = {
	marginTop: '40px',
	paddingTop: '20px',
	borderTop: `1px solid ${BRAND.border}`,
	fontSize: '14px',
	color: BRAND.mutedForeground,
	lineHeight: 1.6
}

export function ScheduledDrip({
	subject,
	content,
	recipientEmail
}: ScheduledDripProps) {
	const unsubscribeUrl = `https://hudsondigitalsolutions.com/unsubscribe?email=${encodeURIComponent(recipientEmail)}`
	const blocks = parseContent(content)

	return (
		<BrandLayout preview={subject}>
			{blocks.map((block, idx) => {
				if (block.type === 'heading') {
					return (
						<Text key={`b-${idx}`} style={HEADING_STYLE}>
							{block.value}
						</Text>
					)
				}
				if (block.type === 'list') {
					return (
						<Section key={`b-${idx}`}>
							<ul style={LIST_STYLE}>
								{block.value.map((item, i) => (
									<li key={`i-${i}`} style={{ margin: '8px 0' }}>
										{item}
									</li>
								))}
							</ul>
						</Section>
					)
				}
				return (
					<Text key={`b-${idx}`} style={PARAGRAPH_STYLE}>
						{block.value}
					</Text>
				)
			})}

			<Section style={SIGNATURE_STYLE}>
				<Text style={{ margin: 0 }}>
					Richard Hudson
					<br />
					Hudson Digital Solutions
					<br />
					<Link
						href={`mailto:${BUSINESS_INFO.email}`}
						style={{ color: BRAND.primary, textDecoration: 'underline' }}
					>
						{BUSINESS_INFO.email}
					</Link>
				</Text>
			</Section>

			<BrandFooter unsubscribeUrl={unsubscribeUrl} />
		</BrandLayout>
	)
}
