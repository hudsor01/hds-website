/**
 * Strip common markdown syntax to plain text.
 *
 * Used on blog excerpts that the n8n pipeline copy-pastes from article
 * bodies — those bodies are HTML so the post content renders fine, but
 * the excerpts retain stray markdown markers (`**bold**`, `*   list`,
 * `### heading`, etc.) which leak into card UI as literal punctuation.
 *
 * This is intentionally conservative: it strips formatting markers and
 * keeps the visible text. Not a full markdown parser.
 */
export function stripMarkdown(input: string): string {
	if (!input) {
		return ''
	}

	let out = input

	// Code fences and inline code: keep contents
	out = out.replace(/```[\s\S]*?```/g, m => m.replace(/```/g, ''))
	out = out.replace(/`([^`]+)`/g, '$1')

	// Images ![alt](url) — drop entirely (alt text rarely useful in excerpts)
	out = out.replace(/!\[[^\]]*\]\([^)]*\)/g, '')

	// Links [text](url) → text
	out = out.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')

	// Bold/italic markers (**, __, *, _, ~~). Run multi-char first.
	out = out.replace(/\*\*([^*]+)\*\*/g, '$1')
	out = out.replace(/__([^_]+)__/g, '$1')
	out = out.replace(/~~([^~]+)~~/g, '$1')
	out = out.replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,!?:;]|$)/g, '$1$2')
	out = out.replace(/(^|[\s(])_([^_\n]+)_(?=[\s).,!?:;]|$)/g, '$1$2')

	// Heading markers at line start (### , ## , # )
	out = out.replace(/^\s*#{1,6}\s+/gm, '')

	// Blockquote markers at line start
	out = out.replace(/^\s*>\s+/gm, '')

	// List markers — both line-leading and the inline `  *   ` style the
	// n8n pipeline produces when it flattens lists into excerpt prose
	out = out.replace(/^\s*[*+-]\s+/gm, '')
	out = out.replace(/\s+[*+-]\s{2,}/g, ' ')
	out = out.replace(/^\s*\d+\.\s+/gm, '')

	// Horizontal rules
	out = out.replace(/^\s*[-*_]{3,}\s*$/gm, '')

	// Collapse internal whitespace runs and trim
	out = out.replace(/\s+/g, ' ').trim()

	return out
}
