/**
 * Allowed-tag guard for the admin rich-text editor (`RichTextEditor`).
 *
 * The editor (Tiptap StarterKit + Link + Image) produces HTML that is read
 * back on the public side by `src/components/blog/BlogPostContent.tsx`,
 * which sanitizes via `sanitize-html` against a fixed allowedTags list. If
 * Tiptap ever (via a future major or a misconfigured extension) emits a
 * tag outside that list, the sanitizer strips it on render -- producing a
 * silent diff between the author's view and the public output.
 *
 * This module provides:
 *
 *  1. `ALLOWED_HTML_TAGS` -- the load-bearing allowlist that mirrors the
 *     sanitize-html config in `BlogPostContent.tsx`. Single source of truth
 *     for the round-trip contract. If either side changes, the other must
 *     change in lockstep, and the unit test guarding alignment must be
 *     updated.
 *
 *  2. `isWithinAllowedHtmlTags(html, allowed)` -- pure helper that scans an
 *     HTML string for opening tag names and returns true iff every tag is
 *     in `allowed`. No DOM dependency (uses a regex) so it runs in Bun's
 *     test runtime without happy-dom / jsdom.
 *
 * The scan is intentionally conservative: it only inspects tag NAMES, not
 * attributes, since attribute filtering is the sanitizer's job (the editor
 * never produces, e.g., `onclick`). Self-closing tags and unclosed
 * fragments both match the same opening-tag pattern.
 */

/**
 * The fixed allowedTags list from `BlogPostContent.tsx`'s SANITIZE_OPTIONS.
 * Order matches the source for easy diff comparison. Mutating this in one
 * place without mutating the other breaks the round-trip invariant.
 */
export const ALLOWED_HTML_TAGS: readonly string[] = [
	'p',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'strong',
	'em',
	'u',
	'a',
	'ul',
	'ol',
	'li',
	'blockquote',
	'code',
	'pre',
	'br',
	'img'
] as const

const OPENING_TAG_PATTERN = /<\s*([a-zA-Z][a-zA-Z0-9-]*)\b/g

/**
 * Returns true iff every opening tag in `html` appears in `allowed`.
 * Comparison is case-insensitive (HTML tag names are case-insensitive).
 * Empty / whitespace-only input returns true (no tags = no violation).
 */
export function isWithinAllowedHtmlTags(
	html: string,
	allowed: readonly string[]
): boolean {
	if (typeof html !== 'string' || html.length === 0) {
		return true
	}
	const allowedSet = new Set(allowed.map(t => t.toLowerCase()))
	OPENING_TAG_PATTERN.lastIndex = 0
	let match: RegExpExecArray | null = OPENING_TAG_PATTERN.exec(html)
	while (match !== null) {
		const captured = match[1]
		if (captured === undefined) {
			match = OPENING_TAG_PATTERN.exec(html)
			continue
		}
		if (!allowedSet.has(captured.toLowerCase())) {
			return false
		}
		match = OPENING_TAG_PATTERN.exec(html)
	}
	return true
}
