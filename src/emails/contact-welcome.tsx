import { Text } from 'react-email'
import { BRAND } from '@/lib/_generated/brand'
import { BrandFooter } from './_components/brand-footer'
import { BrandLayout } from './_components/brand-layout'

interface ContactWelcomeProps {
	subject: string
	/**
	 * Pre-processed sequence content. Each line becomes a `<Text>`
	 * paragraph. Content is plain text with sequence variables already
	 * substituted by processEmailTemplate; React Email auto-escapes
	 * children, so no manual HTML escaping is needed.
	 */
	content: string
}

const PARAGRAPH_STYLE = {
	fontSize: '14px',
	lineHeight: 1.6,
	margin: '0 0 12px 0',
	color: BRAND.foreground
}

export function ContactWelcome({ subject, content }: ContactWelcomeProps) {
	const lines = content.split('\n').filter(line => line.length > 0)

	return (
		<BrandLayout preview={subject}>
			{lines.map((line, idx) => (
				<Text key={`line-${idx}`} style={PARAGRAPH_STYLE}>
					{line}
				</Text>
			))}
			<BrandFooter />
		</BrandLayout>
	)
}
