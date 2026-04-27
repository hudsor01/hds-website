import { Text } from 'react-email'
import { BRAND } from '@/lib/_generated/brand'
import { BrandFooter } from './_components/brand-footer'
import { BrandLayout } from './_components/brand-layout'

interface ContactWelcomeProps {
	subject: string
	/**
	 * Pre-processed sequence content. Paragraphs are separated by blank
	 * lines (`\n\n`); each paragraph becomes one `<Text>` block. Single
	 * `\n` within a paragraph stays as a soft line break. Content is plain
	 * text with sequence variables already substituted by
	 * replaceTemplateVariables; React Email auto-escapes children, so no
	 * manual HTML escaping is needed.
	 */
	content: string
}

// `whiteSpace: pre-wrap` preserves soft `\n` line breaks within a single
// paragraph. No current sequence template in src/data/email-templates.json
// uses intra-paragraph newlines (paragraphs are separated by `\n\n`), so
// this is a no-op today. Kept for future templates that may need it; some
// email clients (notably Outlook desktop) normalize whitespace and may
// ignore this property — do not rely on it for critical layout.
const PARAGRAPH_STYLE = {
	fontSize: '14px',
	lineHeight: 1.6,
	margin: '0 0 16px 0',
	color: BRAND.foreground,
	whiteSpace: 'pre-wrap' as const
}

export function ContactWelcome({ subject, content }: ContactWelcomeProps) {
	// Split on real paragraph boundaries (\n\n) and drop blank-only chunks.
	// This preserves the visual paragraph gap from the original raw-HTML
	// version, which wrapped every line (including blanks) in `<p>` tags.
	// `whiteSpace: pre-wrap` on PARAGRAPH_STYLE keeps soft line breaks
	// (single \n) within a paragraph.
	const paragraphs = content
		.split('\n\n')
		.map(p => p.trim())
		.filter(p => p.length > 0)

	return (
		<BrandLayout preview={subject}>
			{paragraphs.map((paragraph, idx) => (
				<Text key={`p-${idx}`} style={PARAGRAPH_STYLE}>
					{paragraph}
				</Text>
			))}
			<BrandFooter />
		</BrandLayout>
	)
}
