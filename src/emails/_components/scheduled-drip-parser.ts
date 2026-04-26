/**
 * Markdown-like content parser for the scheduled drip email template.
 *
 * Recognises three block types in user-authored sequence content:
 *   - heading: a paragraph wrapped in **double asterisks**
 *   - list:    a paragraph that begins with `• ` OR contains lines that
 *              all begin with `• `
 *   - paragraph: anything else
 *
 * Block boundaries are real newlines (U+000A). Earlier inline-string
 * versions used escaped `\\n\\n` which never matched at runtime — every
 * email collapsed into a single paragraph with literal `•` characters.
 *
 * Empty bullet-filtered lists (paragraph contains `•` mid-sentence but
 * no line starts with `• `) fall back to paragraph rendering rather
 * than emitting an empty <ul>.
 */
export type ContentBlock =
	| { type: 'heading'; value: string }
	| { type: 'list'; value: string[] }
	| { type: 'paragraph'; value: string }

export function parseContent(content: string): ContentBlock[] {
	const blocks: ContentBlock[] = []
	for (const paragraph of content.split('\n\n')) {
		if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
			blocks.push({ type: 'heading', value: paragraph.slice(2, -2) })
			continue
		}

		if (paragraph.startsWith('• ')) {
			// Single-bullet paragraph — could still contain multi-line bullets
			const items = paragraph
				.split('\n')
				.filter(line => line.startsWith('• '))
				.map(line => line.slice(2))
			if (items.length > 0) {
				blocks.push({ type: 'list', value: items })
				continue
			}
		}

		if (paragraph.includes('• ')) {
			const items = paragraph
				.split('\n')
				.filter(line => line.startsWith('• '))
				.map(line => line.slice(2))
			if (items.length > 0) {
				blocks.push({ type: 'list', value: items })
				continue
			}
			// Inline `•` mid-sentence; no line starts with bullet — treat as
			// regular paragraph rather than emitting an empty <ul>.
		}

		blocks.push({ type: 'paragraph', value: paragraph })
	}
	return blocks
}
