/**
 * Tests for the rich-text editor's allowed-tag guard.
 *
 * The editor (Tiptap StarterKit + Link + Image) lives at
 * `src/components/admin/RichTextEditor.tsx`. Its output is later read by
 * `src/components/blog/BlogPostContent.tsx` and sanitized through
 * `sanitize-html` against a fixed allowedTags list. These tests pin the
 * round-trip invariant: anything the editor emits must be a tag the
 * sanitizer accepts -- otherwise the public render silently strips it.
 *
 * The component itself is not unit-tested here. Tiptap depends on a real
 * DOM (ProseMirror) which the project's bun:test setup does not provide,
 * and adding happy-dom / jsdom just for one smoke test is overkill. The
 * load-bearing assertion is the allowed-tag set; manual operator smoke
 * pre-PR covers the component render path.
 */
import { describe, expect, test } from 'bun:test'
import {
	ALLOWED_HTML_TAGS,
	isWithinAllowedHtmlTags
} from '@/components/admin/rich-text-editor-tags'

describe('isWithinAllowedHtmlTags', () => {
	test('returns true for plain text and editor-shaped HTML', () => {
		expect(isWithinAllowedHtmlTags('', ALLOWED_HTML_TAGS)).toBe(true)
		expect(isWithinAllowedHtmlTags('hello world', ALLOWED_HTML_TAGS)).toBe(true)
		expect(isWithinAllowedHtmlTags('<p>hello</p>', ALLOWED_HTML_TAGS)).toBe(
			true
		)
		expect(
			isWithinAllowedHtmlTags(
				'<h2>Heading</h2><p>Body with <strong>bold</strong> and <em>italics</em>.</p>',
				ALLOWED_HTML_TAGS
			)
		).toBe(true)
		expect(
			isWithinAllowedHtmlTags(
				'<ul><li>one</li><li>two</li></ul><ol><li>a</li></ol>',
				ALLOWED_HTML_TAGS
			)
		).toBe(true)
		expect(
			isWithinAllowedHtmlTags(
				'<blockquote>quote</blockquote><pre><code>x</code></pre>',
				ALLOWED_HTML_TAGS
			)
		).toBe(true)
		expect(
			isWithinAllowedHtmlTags(
				'<p>link <a href="https://example.com">x</a> and <img src="https://example.com/p.png" alt=""/></p>',
				ALLOWED_HTML_TAGS
			)
		).toBe(true)
	})

	test('returns false when the HTML contains a tag outside the allowlist', () => {
		expect(
			isWithinAllowedHtmlTags(
				'<table><tr><td>x</td></tr></table>',
				ALLOWED_HTML_TAGS
			)
		).toBe(false)
		expect(
			isWithinAllowedHtmlTags(
				'<p>safe</p><script>alert(1)</script>',
				ALLOWED_HTML_TAGS
			)
		).toBe(false)
		expect(
			isWithinAllowedHtmlTags(
				'<iframe src="https://evil.example"></iframe>',
				ALLOWED_HTML_TAGS
			)
		).toBe(false)
		expect(
			isWithinAllowedHtmlTags(
				'<p>fine</p><style>.x{color:red}</style>',
				ALLOWED_HTML_TAGS
			)
		).toBe(false)
	})
})

describe('ALLOWED_HTML_TAGS', () => {
	test('covers every tag Tiptap StarterKit + Link + Image can emit', () => {
		// Mirrors the StarterKit + Link + Image output shape. If a future
		// extension upgrade widens this set, the editor allowlist must
		// widen too -- and so must the sanitize-html allowlist in
		// BlogPostContent.tsx. This list is intentionally narrow.
		const tiptapEmits = [
			'p',
			'h1',
			'h2',
			'h3',
			'strong',
			'em',
			'ul',
			'ol',
			'li',
			'blockquote',
			'code',
			'pre',
			'br',
			'a',
			'img'
		]
		for (const tag of tiptapEmits) {
			expect(ALLOWED_HTML_TAGS).toContain(tag)
		}
	})
})
