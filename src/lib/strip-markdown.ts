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

	// Code fences (closed). Lazy match preserves any text between fences.
	out = out.replace(/```[\s\S]*?```/g, m => m.replace(/```/g, ''))
	// Orphan triple-backticks from truncated/unclosed fences in n8n excerpts
	out = out.replace(/```/g, '')
	// Inline code
	out = out.replace(/`([^`]+)`/g, '$1')

	// Images ![alt](url) — drop entirely (alt text rarely useful in excerpts)
	out = out.replace(/!\[[^\]]*\]\([^)]*\)/g, '')

	// Links [text](url) → text
	out = out.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')

	// Bold/italic markers. Run multi-char (and bold-italic ***word***) first.
	// `***word***` collapses via the bold pass leaving `*word*` for italic.
	out = out.replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
	out = out.replace(/___([^_]+)___/g, '$1')
	out = out.replace(/\*\*([^*]+)\*\*/g, '$1')
	out = out.replace(/__([^_]+)__/g, '$1')
	out = out.replace(/~~([^~]+)~~/g, '$1')
	// Single-char italic: open boundary mirrors the close boundary so
	// patterns like `text,*italic*` (comma adjacent) strip symmetrically.
	out = out.replace(/(^|[\s(,;:])\*([^*\n]+)\*(?=[\s).,!?:;]|$)/g, '$1$2')
	out = out.replace(/(^|[\s(,;:])_([^_\n]+)_(?=[\s).,!?:;]|$)/g, '$1$2')

	// Heading markers at line start (### , ## , # )
	out = out.replace(/^\s*#{1,6}\s+/gm, '')

	// Blockquote markers at line start
	out = out.replace(/^\s*>\s+/gm, '')

	// List markers — line-leading bullet/dash/plus, the inline `  *   `
	// style the n8n pipeline produces when flattening lists into prose,
	// and ordered-list `1. ` markers
	out = out.replace(/^\s*[*+-]\s+/gm, '')
	out = out.replace(/\s+[*+-]\s{2,}/g, ' ')
	out = out.replace(/^\s*\d+\.\s+/gm, '')

	// Horizontal rules
	out = out.replace(/^\s*[-*_]{3,}\s*$/gm, '')

	// Backslash escapes — last, so the formatting passes above don't see
	// `\*foo\*` as a literal pair (the open `\` isn't a valid open boundary).
	// `\*` becomes `*` so the visible text the author intended is preserved.
	out = out.replace(/\\([\\`*_{}[\]()#+\-.!>])/g, '$1')

	// Collapse internal whitespace runs and trim
	out = out.replace(/\s+/g, ' ').trim()

	return out
}
