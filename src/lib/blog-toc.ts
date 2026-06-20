/**
 * Blog table-of-contents helper. The post body is stored as HTML (markdown
 * converted by marked at publish time) with no heading ids. This injects
 * stable kebab-case ids onto h2/h3 and returns the TOC so the page can render
 * an "On this page" nav with working anchor links + scrollspy.
 */

export interface TocItem {
	id: string
	text: string
	level: 2 | 3
}

function slugifyHeading(text: string): string {
	return text
		.toLowerCase()
		.replace(/<[^>]+>/g, '')
		.replace(/&[a-z]+;/g, ' ')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

/**
 * Inject `id` attributes on h2/h3 (skipping any that already have one) and
 * collect the TOC. Returns the rewritten HTML and the heading list. Pure
 * string work, no DOM/jsdom, so it runs in the Vercel build runtime.
 */
export function withHeadingIds(html: string): { html: string; toc: TocItem[] } {
	const toc: TocItem[] = []
	const seen = new Map<string, number>()

	const out = html.replace(
		/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/g,
		(match, levelStr: string, attrs: string | undefined, inner: string) => {
			const level = Number(levelStr) as 2 | 3
			const text = inner
				.replace(/<[^>]+>/g, '')
				.replace(/\s+/g, ' ')
				.trim()
			if (!text) {
				return match
			}
			// Respect an existing id if the markup already has one.
			const existing = attrs?.match(/\sid=["']([^"']+)["']/)
			let id = existing?.[1] ?? slugifyHeading(text)
			if (!id) {
				return match
			}
			// De-duplicate ids across the document.
			const count = seen.get(id) ?? 0
			seen.set(id, count + 1)
			if (count > 0) {
				id = `${id}-${count}`
			}
			toc.push({ id, text, level })
			if (existing) {
				return match
			}
			const cleanAttrs = attrs ?? ''
			return `<h${level}${cleanAttrs} id="${id}">${inner}</h${level}>`
		}
	)

	return { html: out, toc }
}
