import { Section, Text } from 'react-email'
import { BRAND } from '@/lib/_generated/brand'
import { BUSINESS_INFO } from '@/lib/constants/business'
import { BrandFooter } from './_components/brand-footer'
import { BrandLayout } from './_components/brand-layout'

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

interface ContentBlock {
	type: 'heading' | 'list' | 'paragraph'
	value: string | string[]
}

function parseContent(content: string): ContentBlock[] {
	const blocks: ContentBlock[] = []
	for (const paragraph of content.split('\\n\\n')) {
		if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
			blocks.push({ type: 'heading', value: paragraph.slice(2, -2) })
		} else if (paragraph.startsWith('• ')) {
			blocks.push({ type: 'list', value: [paragraph.slice(2)] })
		} else if (paragraph.includes('• ')) {
			const items = paragraph
				.split('\\n')
				.filter(line => line.startsWith('• '))
				.map(line => line.slice(2))
			blocks.push({ type: 'list', value: items })
		} else {
			blocks.push({ type: 'paragraph', value: paragraph })
		}
	}
	return blocks
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
							{block.value as string}
						</Text>
					)
				}
				if (block.type === 'list') {
					const items = block.value as string[]
					return (
						<Section key={`b-${idx}`}>
							<ul style={LIST_STYLE}>
								{items.map((item, i) => (
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
						{block.value as string}
					</Text>
				)
			})}

			<Section style={SIGNATURE_STYLE}>
				<Text style={{ margin: 0 }}>
					Richard Hudson
					<br />
					Hudson Digital Solutions
					<br />
					<a
						href={`mailto:${BUSINESS_INFO.email}`}
						style={{ color: BRAND.primary, textDecoration: 'underline' }}
					>
						{BUSINESS_INFO.email}
					</a>
				</Text>
			</Section>

			<BrandFooter unsubscribeUrl={unsubscribeUrl} />
		</BrandLayout>
	)
}
