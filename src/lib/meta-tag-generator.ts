/**
 * Meta tag generator.
 *
 * Builds the <head> markup (title, description, canonical, Open Graph and
 * X (Twitter) card tags) the Meta Tag Generator tool shows for copying.
 *
 * Security: the output is pasted into other people's pages, so every value
 * is HTML-escaped. Attribute values escape & < > " and the <title> text
 * escapes & < (enough to stop `</title><script>` breaking out). URL fields
 * are parsed and re-emitted as the URL's normalized href, and only http(s)
 * URLs are accepted.
 *
 * Tag choices follow the primary sources:
 * - Google ignores meta keywords and does not list name="title"
 *   (developers.google.com/search/docs/crawling-indexing/special-tags).
 * - Open Graph requires og:title, og:type, og:image and og:url (ogp.me).
 * - X cards use name= attributes; card values are summary,
 *   summary_large_image, app and player; twitter:url is not a card tag
 *   and twitter:site is required.
 */

export interface MetaTagInput {
	title: string
	description: string
	pageUrl: string
	imageUrl?: string
	imageAlt?: string
	siteName?: string
	/** The site's X (Twitter) handle, emitted as twitter:site. */
	siteHandle?: string
	/** The author's X (Twitter) handle, emitted as twitter:creator. */
	creatorHandle?: string
	/** The author's name, emitted as meta name="author". */
	author?: string
	/** Prepend charset and viewport lines. */
	includeDocumentBasics?: boolean
}

export type MetaTagField =
	| 'title'
	| 'description'
	| 'pageUrl'
	| 'imageUrl'
	| 'siteHandle'
	| 'creatorHandle'

export type MetaTagErrors = Partial<Record<MetaTagField, string>>

export type MetaTagResult =
	| {
			ok: true
			html: string
			warnings: string[]
			/** Normalized page URL, for previews. */
			pageUrl: string
			/** Normalized image URL, for previews. */
			imageUrl?: string
	  }
	| { ok: false; errors: MetaTagErrors }

const ATTRIBUTE_ESCAPES: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;'
}

/** Escape a value for a double-quoted HTML attribute. */
export function escapeAttribute(value: string): string {
	return value.replace(/[&<>"]/g, ch => ATTRIBUTE_ESCAPES[ch] ?? ch)
}

/** Escape a value for HTML text content such as <title>. */
export function escapeText(value: string): string {
	return value.replace(/[&<]/g, ch => ATTRIBUTE_ESCAPES[ch] ?? ch)
}

function clean(value: string | undefined): string | undefined {
	const trimmed = value?.trim()
	return trimmed ? trimmed : undefined
}

/**
 * Parse an absolute http(s) URL and return its normalized href, or
 * undefined when it is not one. Non-ASCII paths come back percent-encoded
 * (https://cafe.example/menú -> https://cafe.example/men%C3%BA).
 */
export function normalizeHttpUrl(
	value: string | undefined
): string | undefined {
	const trimmed = clean(value)
	if (trimmed === undefined || !URL.canParse(trimmed)) {
		return undefined
	}
	const url = new URL(trimmed)
	if (url.protocol !== 'https:' && url.protocol !== 'http:') {
		return undefined
	}
	return url.href
}

/** Hostname of a URL for previews; falls back when the URL is partial. */
export function previewHostname(value: string, fallback: string): string {
	const trimmed = value.trim()
	return URL.canParse(trimmed) ? new URL(trimmed).hostname : fallback
}

const HANDLE_RE = /^[A-Za-z0-9_]{1,15}$/
const PROFILE_URL_RE = /^(?:https?:\/\/)?(?:www\.)?(?:x|twitter)\.com\//i

/**
 * Normalize an X (Twitter) handle to `@handle`. Accepts `handle`,
 * `@handle` or a profile URL. Returns null for an invalid handle and
 * undefined for a blank one.
 */
export function normalizeHandle(
	value: string | undefined
): string | null | undefined {
	const trimmed = clean(value)
	if (trimmed === undefined) {
		return undefined
	}
	const handle = trimmed
		.replace(PROFILE_URL_RE, '')
		.replace(/^@+/, '')
		.replace(/\/+$/, '')
	return HANDLE_RE.test(handle) ? `@${handle}` : null
}

const HANDLE_ERROR =
	'Use an X (Twitter) handle: up to 15 letters, numbers or underscores.'

function meta(
	attribute: 'name' | 'property',
	key: string,
	content: string
): string {
	return `<meta ${attribute}="${key}" content="${escapeAttribute(content)}" />`
}

/** Validate the input and build the meta tag markup. */
export function buildMetaTags(input: MetaTagInput): MetaTagResult {
	const title = clean(input.title)
	const description = clean(input.description)
	const pageUrl = normalizeHttpUrl(input.pageUrl)
	const imageUrl = normalizeHttpUrl(input.imageUrl)
	const imageAlt = clean(input.imageAlt)
	const siteName = clean(input.siteName)
	const author = clean(input.author)
	const siteHandle = normalizeHandle(input.siteHandle)
	const creatorHandle = normalizeHandle(input.creatorHandle)

	const errors: MetaTagErrors = {}
	if (!title) {
		errors.title = 'Enter a page title.'
	}
	if (!description) {
		errors.description = 'Enter a page description.'
	}
	if (!pageUrl) {
		errors.pageUrl = clean(input.pageUrl)
			? 'Enter a full URL starting with https:// or http://.'
			: 'Enter the page URL.'
	}
	if (clean(input.imageUrl) && !imageUrl) {
		errors.imageUrl =
			'Enter a full image URL starting with https:// or http://.'
	}
	if (siteHandle === null) {
		errors.siteHandle = HANDLE_ERROR
	}
	if (creatorHandle === null) {
		errors.creatorHandle = HANDLE_ERROR
	}
	if (!(title && description && pageUrl) || Object.keys(errors).length > 0) {
		return { ok: false, errors }
	}

	const warnings: string[] = []
	if (!imageUrl) {
		warnings.push(
			'Open Graph lists og:image as required (ogp.me). Without an image, X shows a small summary card and other platforms may show no preview image.'
		)
	} else if (!imageAlt) {
		warnings.push(
			'Add image alt text. Open Graph says a page with og:image should also set og:image:alt.'
		)
	}
	if (!siteHandle) {
		warnings.push(
			"X lists twitter:site as required for cards. Add your site's X (Twitter) handle."
		)
	}

	const lines: string[] = []
	if (input.includeDocumentBasics) {
		lines.push(
			'<!-- Include once per page if your template does not already -->',
			'<meta charset="utf-8" />',
			'<meta name="viewport" content="width=device-width, initial-scale=1" />',
			''
		)
	}

	lines.push(
		'<!-- Primary meta tags -->',
		`<title>${escapeText(title)}</title>`,
		meta('name', 'description', description)
	)
	if (author) {
		lines.push(meta('name', 'author', author))
	}
	lines.push(`<link rel="canonical" href="${escapeAttribute(pageUrl)}" />`)

	lines.push(
		'',
		'<!-- Open Graph -->',
		meta('property', 'og:type', 'website'),
		meta('property', 'og:url', pageUrl),
		meta('property', 'og:title', title),
		meta('property', 'og:description', description)
	)
	if (imageUrl) {
		lines.push(meta('property', 'og:image', imageUrl))
		if (imageAlt) {
			lines.push(meta('property', 'og:image:alt', imageAlt))
		}
	}
	if (siteName) {
		lines.push(meta('property', 'og:site_name', siteName))
	}

	lines.push(
		'',
		'<!-- X (Twitter) -->',
		meta('name', 'twitter:card', imageUrl ? 'summary_large_image' : 'summary')
	)
	if (siteHandle) {
		lines.push(meta('name', 'twitter:site', siteHandle))
	}
	if (creatorHandle) {
		lines.push(meta('name', 'twitter:creator', creatorHandle))
	}
	lines.push(
		meta('name', 'twitter:title', title),
		meta('name', 'twitter:description', description)
	)
	if (imageUrl) {
		lines.push(meta('name', 'twitter:image', imageUrl))
		if (imageAlt) {
			lines.push(meta('name', 'twitter:image:alt', imageAlt))
		}
	}

	return {
		ok: true,
		html: lines.join('\n'),
		warnings,
		pageUrl,
		...(imageUrl ? { imageUrl } : {})
	}
}
