/**
 * Blog body preparation: sanitize the compiled post HTML, inject stable
 * kebab-case ids onto h2/h3 and collect the table of contents, all in one
 * pass. The page renders the html and the TOC from the same call, so every
 * TOC href matches a heading id by construction.
 */
import sanitizeHtml from 'sanitize-html'

export interface TocItem {
	id: string
	/** Plain decoded heading text; React escapes it once on render. */
	text: string
	level: 2 | 3
}

// sanitize-html uses htmlparser2 (no jsdom) so it builds cleanly under
// Bun on Vercel. The previous isomorphic-dompurify dep pulled in jsdom
// which references the Node `MIMEType` global, not exposed in Vercel's
// build runtime, breaking /blog/[slug] page collection.
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
	allowedTags: [
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
		'img',
		'hr',
		'table',
		'thead',
		'tbody',
		'tr',
		'th',
		'td'
	],
	allowedAttributes: {
		a: ['href', 'title', 'target', 'rel', 'class'],
		img: ['src', 'alt', 'title', 'class'],
		th: ['align'],
		td: ['align']
	},
	allowedSchemes: ['http', 'https', 'mailto']
	// Intentionally NOT allowing data: URIs on <img>: data: images can carry
	// tracking pixels or, in legacy browsers, exfiltration vectors.
}

const NAMED_ENTITIES: Record<string, string> = {
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	nbsp: ' '
}

/**
 * Decode the entities that marked or sanitize-html can leave in heading
 * markup. `&amp;` is decoded last so `&amp;lt;` stays the literal text `&lt;`.
 */
function decodeEntities(text: string): string {
	return text
		.replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
			String.fromCodePoint(Number.parseInt(hex, 16))
		)
		.replace(/&#(\d+);/g, (_, dec: string) =>
			String.fromCodePoint(Number.parseInt(dec, 10))
		)
		.replace(
			/&(lt|gt|quot|apos|nbsp);/g,
			(_, name: string) => NAMED_ENTITIES[name] ?? ''
		)
		.replace(/&amp;/g, '&')
}

/** The plain text a reader sees for a heading's inner HTML. */
function headingText(inner: string): string {
	return decodeEntities(inner.replace(/<[^>]+>/g, ''))
		.replace(/\s+/g, ' ')
		.trim()
}

/** Kebab-case id from plain (already decoded) heading text. */
function slugifyHeading(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

/**
 * Inject `id` attributes on h2/h3 and collect the TOC. Runs on sanitized
 * markup, which never carries an `id` (SANITIZE_OPTIONS does not allow it).
 * Pure string work, no DOM/jsdom, so it runs in the Vercel build runtime.
 */
function withHeadingIds(html: string): { html: string; toc: TocItem[] } {
	const toc: TocItem[] = []
	const used = new Set<string>()

	const out = html.replace(
		/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/g,
		(match, levelStr: string, attrs: string | undefined, inner: string) => {
			const level = Number(levelStr) as 2 | 3
			const text = headingText(inner)
			if (!text) {
				return match
			}
			const base = slugifyHeading(text)
			if (!base) {
				return match
			}
			// De-duplicate ids across the document: first free -1, -2, ...
			let id = base
			for (let n = 1; used.has(id); n++) {
				id = `${base}-${n}`
			}
			used.add(id)
			toc.push({ id, text, level })
			return `<h${level}${attrs ?? ''} id="${id}">${inner}</h${level}>`
		}
	)

	return { html: out, toc }
}

/**
 * Sanitize a post body and derive its heading ids and table of contents
 * from that single sanitized string. Blog content comes from content/blog in
 * this repo; sanitization is defense in depth.
 */
export function prepareBlogContent(content: string): {
	html: string
	toc: TocItem[]
} {
	return withHeadingIds(sanitizeHtml(content, SANITIZE_OPTIONS))
}
