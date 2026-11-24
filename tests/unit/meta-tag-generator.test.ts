/**
 * Meta tag generator: escaping, tag set and validation.
 * Locks src/lib/meta-tag-generator.ts.
 */

import { describe, expect, test } from 'bun:test'
import {
	buildMetaTags,
	escapeAttribute,
	escapeText,
	type MetaTagInput,
	normalizeHandle,
	normalizeHttpUrl,
	previewHostname
} from '@/lib/meta-tag-generator'

const BASE: MetaTagInput = {
	title: 'Acme Plumbing',
	description: 'Plumbing repairs in Dallas.',
	pageUrl: 'https://acme.com/'
}

function html(input: MetaTagInput): string {
	const result = buildMetaTags(input)
	if (!result.ok) {
		throw new Error(`expected ok, got ${JSON.stringify(result.errors)}`)
	}
	return result.html
}

describe('escaping', () => {
	test('escapes & < > " in attributes', () => {
		expect(escapeAttribute(`Tom & Jerry's "Best" <Plumbing>`)).toBe(
			"Tom &amp; Jerry's &quot;Best&quot; &lt;Plumbing&gt;"
		)
	})

	test('escapes & < in title text', () => {
		expect(escapeText('</title><script>alert(1)</script> & co')).toBe(
			'&lt;/title>&lt;script>alert(1)&lt;/script> &amp; co'
		)
	})

	test('quotes and ampersands cannot break a content attribute', () => {
		const out = html({ ...BASE, title: `Tom & Jerry's "Best" Plumbing` })
		expect(out).toContain(
			'<meta property="og:title" content="Tom &amp; Jerry\'s &quot;Best&quot; Plumbing" />'
		)
		expect(out).toContain('<title>Tom &amp; Jerry\'s "Best" Plumbing</title>')
		expect(out).not.toContain('"Best"" ')
	})

	test('a </title><script> title emits no live script tag', () => {
		const out = html({ ...BASE, title: '</title><script>alert(1)</script>' })
		expect(out).not.toContain('<script>')
		expect(out).not.toContain('</title><')
		expect(out.match(/<\/title>/g)?.length).toBe(1)
		expect(out).toContain(
			'<title>&lt;/title>&lt;script>alert(1)&lt;/script></title>'
		)
	})

	test('keeps non-ASCII text and percent-encodes non-ASCII URL paths', () => {
		const out = html({
			...BASE,
			title: 'Café Señor Niño',
			pageUrl: 'https://cafe.example/menú'
		})
		expect(out).toContain('<title>Café Señor Niño</title>')
		expect(out).toContain(
			'<link rel="canonical" href="https://cafe.example/men%C3%BA" />'
		)
	})

	test('escapes & in URL query strings', () => {
		const out = html({ ...BASE, pageUrl: 'https://acme.com/?a=1&b=2' })
		expect(out).toContain('content="https://acme.com/?a=1&amp;b=2"')
	})

	test('trims every input', () => {
		const out = html({
			title: '  Acme  ',
			description: '\tRepairs ',
			pageUrl: '  https://acme.com  ',
			author: ' Ana '
		})
		expect(out).toContain('<title>Acme</title>')
		expect(out).toContain('<meta name="description" content="Repairs" />')
		expect(out).toContain('<meta name="author" content="Ana" />')
	})
})

describe('tag set', () => {
	test('omits tags Google and X ignore', () => {
		const out = html({ ...BASE, imageUrl: 'https://acme.com/og.jpg' })
		expect(out).not.toContain('name="title"')
		expect(out).not.toContain('keywords')
		expect(out).not.toContain('twitter:url')
	})

	test('X tags use name=, never property=', () => {
		const out = html({ ...BASE, siteHandle: 'acme' })
		expect(out).not.toContain('property="twitter:')
		expect(out).toContain('<meta name="twitter:site" content="@acme" />')
	})

	test('summary card without an image, summary_large_image with one', () => {
		expect(html(BASE)).toContain(
			'<meta name="twitter:card" content="summary" />'
		)
		expect(html({ ...BASE, imageUrl: 'https://acme.com/og.jpg' })).toContain(
			'<meta name="twitter:card" content="summary_large_image" />'
		)
	})

	test('adds a canonical link from the page URL', () => {
		expect(html(BASE)).toContain(
			'<link rel="canonical" href="https://acme.com/" />'
		)
	})

	test('image alt goes to og:image:alt and twitter:image:alt', () => {
		const out = html({
			...BASE,
			imageUrl: 'https://acme.com/og.jpg',
			imageAlt: 'A van & a plumber'
		})
		expect(out).toContain(
			'<meta property="og:image:alt" content="A van &amp; a plumber" />'
		)
		expect(out).toContain(
			'<meta name="twitter:image:alt" content="A van &amp; a plumber" />'
		)
	})

	test('twitter:creator only when an author handle is given', () => {
		expect(html({ ...BASE, author: 'Ana' })).not.toContain('twitter:creator')
		expect(html({ ...BASE, creatorHandle: 'ana_d' })).toContain(
			'<meta name="twitter:creator" content="@ana_d" />'
		)
	})

	test('charset and viewport only when asked', () => {
		expect(html(BASE)).not.toContain('charset')
		const out = html({ ...BASE, includeDocumentBasics: true })
		expect(out.startsWith('<!-- Include once per page')).toBe(true)
		expect(out).toContain('<meta charset="utf-8" />')
		expect(out).toContain(
			'<meta name="viewport" content="width=device-width, initial-scale=1" />'
		)
	})
})

describe('warnings', () => {
	test('warns (does not block) when og:image is missing', () => {
		const result = buildMetaTags({ ...BASE, siteHandle: 'acme' })
		expect(result.ok).toBe(true)
		if (result.ok) {
			expect(result.warnings).toHaveLength(1)
			expect(result.warnings[0]).toContain('og:image')
		}
	})

	test('warns about missing alt text and missing twitter:site', () => {
		const result = buildMetaTags({
			...BASE,
			imageUrl: 'https://acme.com/og.jpg'
		})
		expect(result.ok && result.warnings.join(' ')).toContain('og:image:alt')
		expect(result.ok && result.warnings.join(' ')).toContain('twitter:site')
	})
})

describe('validation', () => {
	test('requires title, description and a full page URL', () => {
		const result = buildMetaTags({ title: ' ', description: '', pageUrl: '' })
		expect(result.ok).toBe(false)
		if (!result.ok) {
			expect(Object.keys(result.errors).sort()).toEqual([
				'description',
				'pageUrl',
				'title'
			])
		}
	})

	test('rejects partial and non-http URLs', () => {
		for (const pageUrl of ['https://', 'acme.com', 'javascript:alert(1)']) {
			const result = buildMetaTags({ ...BASE, pageUrl })
			expect(result.ok).toBe(false)
		}
		const badImage = buildMetaTags({ ...BASE, imageUrl: 'og.jpg' })
		expect(!badImage.ok && badImage.errors.imageUrl).toBeTruthy()
	})

	test('rejects an invalid handle', () => {
		const result = buildMetaTags({ ...BASE, siteHandle: 'not a handle!' })
		expect(!result.ok && result.errors.siteHandle).toBeTruthy()
	})
})

describe('helpers', () => {
	test('normalizeHandle adds @ and accepts profile URLs', () => {
		expect(normalizeHandle('acme')).toBe('@acme')
		expect(normalizeHandle('@acme')).toBe('@acme')
		expect(normalizeHandle(' @@acme ')).toBe('@acme')
		expect(normalizeHandle('https://x.com/acme')).toBe('@acme')
		expect(normalizeHandle('twitter.com/acme/')).toBe('@acme')
		expect(normalizeHandle('')).toBeUndefined()
		expect(normalizeHandle('this_handle_is_too_long')).toBeNull()
	})

	test('normalizeHttpUrl returns the normalized href', () => {
		expect(normalizeHttpUrl('https://ACME.com')).toBe('https://acme.com/')
		expect(normalizeHttpUrl('ftp://acme.com')).toBeUndefined()
		expect(normalizeHttpUrl('https://')).toBeUndefined()
	})

	test('previewHostname falls back on partial URLs instead of throwing', () => {
		expect(previewHostname('https://acme.com/x', 'example.com')).toBe(
			'acme.com'
		)
		expect(previewHostname('https://', 'example.com')).toBe('example.com')
		expect(previewHostname('acm', 'example.com')).toBe('example.com')
	})
})
