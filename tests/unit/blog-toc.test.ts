/**
 * Blog table of contents (src/lib/blog-toc.ts). Heading ids and TOC links
 * must come from one pass over the sanitized body, and the TOC label must be
 * plain text (React escapes it once), never a raw HTML entity.
 */
import { describe, expect, test } from 'bun:test'
import { marked } from 'marked'
import { BLOG_POSTS } from '@/lib/_generated/blog-posts'
import { prepareBlogContent } from '@/lib/blog-toc'

const ENTITY = /&(#\d+|#x[0-9a-f]+|[a-z]+);/i

function prepare(markdown: string) {
	return prepareBlogContent(marked.parse(markdown, { async: false }))
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

describe('prepareBlogContent', () => {
	test('an apostrophe gives one id shared by the heading and the TOC', () => {
		const { html, toc } = prepare(
			"### DKIM: proof the message wasn't forged\n\nBody."
		)
		expect(toc).toEqual([
			{
				id: 'dkim-proof-the-message-wasn-t-forged',
				text: "DKIM: proof the message wasn't forged",
				level: 3
			}
		])
		expect(html).toContain('id="dkim-proof-the-message-wasn-t-forged"')
	})

	test('double quotes come through as literal quotes', () => {
		const { html, toc } = prepare('## What "Just Works" Actually Means')
		expect(toc[0]?.text).toBe('What "Just Works" Actually Means')
		expect(toc[0]?.id).toBe('what-just-works-actually-means')
		expect(html).toContain('id="what-just-works-actually-means"')
	})

	test('ampersands and inline code decode to plain text', () => {
		const { html, toc } = prepare(
			'## SPF & DKIM with `a<b` in <code>DNS</code>'
		)
		expect(toc[0]?.text).toBe('SPF & DKIM with a<b in DNS')
		expect(toc[0]?.id).toBe('spf-dkim-with-a-b-in-dns')
		// The heading markup itself stays escaped.
		expect(html).toContain('SPF &amp; DKIM')
		expect(html).toContain('<code>a&lt;b</code>')
	})

	test('duplicate headings get numbered ids that never collide', () => {
		const { html, toc } = prepare(
			'## Setup\n\n## Setup\n\n## Setup 1\n\n## Setup'
		)
		expect(toc.map(item => item.id)).toEqual([
			'setup',
			'setup-1',
			'setup-1-1',
			'setup-2'
		])
		for (const item of toc) {
			expect(html).toContain(`id="${item.id}"`)
		}
	})

	test('script and unsafe attributes are stripped', () => {
		const { html } = prepareBlogContent(
			'<h2 onclick="x()">Hi</h2><script>alert(1)</script><img src="data:image/png;base64,AA">'
		)
		expect(html).not.toContain('onclick')
		expect(html).not.toContain('<script')
		expect(html).not.toContain('data:image')
	})

	test('every published post has TOC links that resolve and plain labels', () => {
		// The module test:unit compiles first: exactly what the site renders.
		expect(BLOG_POSTS.length).toBeGreaterThan(0)
		const problems: string[] = []
		for (const post of BLOG_POSTS) {
			const { html, toc } = prepareBlogContent(post.content)
			for (const item of toc) {
				const count =
					html.match(new RegExp(`id="${escapeRegExp(item.id)}"`, 'g'))
						?.length ?? 0
				if (count !== 1) {
					problems.push(`${post.slug}: #${item.id} matches ${count} headings`)
				}
				if (ENTITY.test(item.text)) {
					problems.push(`${post.slug}: label "${item.text}" has an entity`)
				}
			}
		}
		expect(problems).toEqual([])
	})

	test('the posts from the QA report now resolve', () => {
		const bySlug = new Map(BLOG_POSTS.map(post => [post.slug, post]))
		const spf = bySlug.get('spf-dkim-dmarc-for-small-business-email')
		const justWorks = bySlug.get(
			'beyond-just-works-why-businesses-need-websites-that-dominate'
		)
		if (!spf || !justWorks) {
			throw new Error('QA report posts are missing from content/blog')
		}
		const spfToc = prepareBlogContent(spf.content).toc
		expect(spfToc.map(item => item.id)).toContain(
			'dkim-proof-the-message-wasn-t-forged'
		)
		expect(spfToc.map(item => item.text)).toContain(
			"DKIM: proof the message wasn't forged"
		)
		expect(
			prepareBlogContent(justWorks.content).toc.map(i => i.text)
		).toContain('What "Just Works" Actually Means')
	})
})
