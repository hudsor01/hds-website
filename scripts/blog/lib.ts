/**
 * Shared helpers for the content/blog pipeline (build, validate, generate).
 * No DB or network access: content/blog is the only source of truth.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { Marked, type Token } from 'marked'
import { BLOG_AUTHORS, BLOG_TAGS } from '@/lib/constants/blog'
import { countCommaBeforeAnd, findAiTells } from './voice'

export const CONTENT_DIR = join(process.cwd(), 'content/blog')

/** Tag taxonomy and author registry, owned by src/lib/constants/blog.ts. */
const TAXONOMY: ReadonlySet<string> = new Set(BLOG_TAGS.map(t => t.slug))
const AUTHOR_SLUGS: ReadonlySet<string> = new Set(BLOG_AUTHORS.map(a => a.slug))

export interface BlogFrontmatter {
	title: string
	slug: string
	excerpt: string
	targetKeyword?: string
	pillar?: number
	tags: string[]
	author: string
	publishedAt: string
	published: boolean
	featured?: boolean
	featureImage?: string
	readingTime?: number
	bodyFormat?: 'markdown' | 'html'
	/** Migrated pre-v9 posts: grandfathered to structural checks only. */
	legacy?: boolean
}

export interface ParsedPost {
	file: string
	slug: string
	data: BlogFrontmatter
	body: string
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const DASH_RE = /[—–]/
const EMOJI_RE =
	/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F0FF}\u{2B00}-\u{2BFF}]/u
const INTERNAL_LINK_RE = /\]\(\/(?!\/)|href=["']\/(?!\/)/g
const CTA_RE = /\]\(\/(?:contact|tools)|href=["']\/(?:contact|tools)/
/** Hrefs resolve against this origin, the way a browser does on our pages. */
const SITE_ORIGIN = 'https://hudsondigitalsolutions.com'
const SITE_HOSTS: ReadonlySet<string> = new Set([
	'hudsondigitalsolutions.com',
	'www.hudsondigitalsolutions.com'
])
/**
 * A resolved post path with an optional trailing slash. The segment capture is
 * loose on purpose: a malformed slug is still extracted so the dead-link rule
 * reports it instead of skipping it.
 */
const POST_PATH_RE = /^\/blog\/([^/]+)\/?$/
/** Character references allowed in an href attribute value. */
const ENTITY_RE = /&(?:#(\d+)|#x([\da-f]+)|([a-z]+));/gi
const NAMED_ENTITIES: Readonly<Record<string, string>> = {
	amp: '&',
	apos: "'",
	colon: ':',
	gt: '>',
	lt: '<',
	num: '#',
	percnt: '%',
	period: '.',
	quest: '?',
	quot: '"',
	sol: '/'
}
/** /blog/tag and /blog/author are listing pages, not posts. */
const NON_POST_SEGMENTS: ReadonlySet<string> = new Set(['tag', 'author'])
/** publishedAt is a quoted calendar day; times and offsets are rejected. */
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function listPostFiles(dir: string = CONTENT_DIR): string[] {
	return readdirSync(dir)
		.filter(f => f.endsWith('.md') && f !== 'README.md')
		.sort()
}

export function parsePost(file: string, dir: string = CONTENT_DIR): ParsedPost {
	const raw = readFileSync(join(dir, file), 'utf8')
	const { data, content } = matter(raw)
	const fm = data as BlogFrontmatter
	return {
		file,
		slug: fm.slug ?? file.replace(/\.md$/, ''),
		data: fm,
		body: content.trim()
	}
}

/**
 * A publishedAt value as its YYYY-MM-DD calendar day, or null when it is not a
 * real date in that exact form. Days are compared as strings and never parsed
 * in local time, so no result depends on the machine's timezone.
 */
export function publishedDay(value: unknown): string | null {
	if (typeof value !== 'string' || !DATE_RE.test(value)) {
		return null
	}
	const time = Date.parse(`${value}T00:00:00Z`)
	// Round trip rejects days that roll over, such as 2026-02-30.
	return !Number.isNaN(time) && new Date(time).toISOString().startsWith(value)
		? value
		: null
}

/**
 * Live = published and dated on or before today's UTC calendar day. A future
 * publishedAt schedules the post: it stays out of the build until the first
 * build on or after that day (UTC midnight), which the publish-scheduled-posts
 * workflow triggers.
 */
export function isLive(data: BlogFrontmatter, now: Date): boolean {
	const day = publishedDay(data.publishedAt)
	return (
		data.published === true &&
		day !== null &&
		day <= now.toISOString().slice(0, 10)
	)
}

export function wordCount(body: string): number {
	return body
		.replace(/<[^>]+>/g, ' ')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/[#*_>`]/g, ' ')
		.split(/\s+/)
		.filter(Boolean).length
}

export function computeReadingTime(body: string): number {
	return Math.max(1, Math.ceil(wordCount(body) / 200))
}

/**
 * Markdown to HTML. A link to a post that `linkable` rejects (one that is not
 * live yet) renders as its inline content, so the page never ships an <a> that
 * 404s; the next build on or after that post's date turns the link on. Every
 * other link falls through to marked's default renderer, byte for byte. A
 * dedicated Marked instance keeps the global `marked` untouched. Pass the
 * post's own slug so relative hrefs resolve the way they do on its page.
 */
export function bodyToHtml(
	body: string,
	format: 'markdown' | 'html' = 'markdown',
	linkable: (slug: string) => boolean = () => true,
	sourceSlug?: string
): string {
	if (format === 'html') {
		return body
	}
	const md = new Marked({
		renderer: {
			// Method syntax, not an arrow function: it needs `this.parser`.
			link(token) {
				const slug = markdownPostSlug(token.href, sourceSlug)
				if (slug && !linkable(slug)) {
					return this.parser.parseInline(token.tokens)
				}
				return false
			}
		}
	})
	return md.parse(body, { async: false }) as string
}

export type Severity = 'error' | 'warn'

export interface Violation {
	rule: string
	message: string
	severity: Severity
}

/**
 * Two tiers, by design (v9 philosophy: push for quality + volume, do not
 * block strong content on arbitrary boxes):
 *   - error: blocks the PR. Only things that break publish (missing/invalid
 *     frontmatter, slug, taxonomy tag), violate the absolute project brand
 *     rule (no em/en-dash, no emoji in user-facing text), or are too thin to
 *     be real content (word floor). There is NO upper word limit.
 *   - warn: reported, never blocks. SEO/quality nudges Claude resolves during
 *     finalization (title/excerpt length, internal-link count, CTA, keyword
 *     placement). Over-length excerpts are clamped for the meta tag at render.
 */
// Floor pushes quality UP (no thin sub-1k stubs); there is deliberately no
// ceiling, so strong long-form content is never penalized for depth.
const MIN_WORDS = 1000

export function validatePost(p: ParsedPost): Violation[] {
	const v: Violation[] = []
	const d = p.data
	const err = (rule: string, message: string): void => {
		v.push({ rule, message, severity: 'error' })
	}
	const warn = (rule: string, message: string): void => {
		v.push({ rule, message, severity: 'warn' })
	}

	// --- HARD ERRORS: publish/integrity ---
	for (const k of [
		'title',
		'slug',
		'excerpt',
		'author',
		'publishedAt'
	] as const) {
		if (typeof d?.[k] !== 'string' || !d[k]) {
			err('R0', `missing/!string frontmatter: ${k}`)
		}
	}
	if (!Array.isArray(d?.tags) || d.tags.length < 1) {
		err('R4', 'tags must be a non-empty array')
	} else {
		for (const t of d.tags) {
			if (!TAXONOMY.has(t)) {
				err('R4', `unknown tag: ${t}`)
			}
		}
	}
	if (typeof d?.author === 'string' && !AUTHOR_SLUGS.has(d.author)) {
		err('R0', `unknown author: ${d.author}`)
	}
	if (
		typeof d?.publishedAt === 'string' &&
		publishedDay(d.publishedAt) === null
	) {
		err(
			'R0',
			`publishedAt must be a YYYY-MM-DD date (UTC day), got "${d.publishedAt}"`
		)
	}
	if (typeof d?.published !== 'boolean') {
		err('R0', 'published must be a boolean')
	}
	if (typeof d?.slug === 'string') {
		if (!SLUG_RE.test(d.slug)) {
			err('R3', `slug not kebab-case: ${d.slug}`)
		}
		if (d.slug !== p.file.replace(/\.md$/, '')) {
			err('R3', `slug "${d.slug}" != filename "${p.file}"`)
		}
	}

	// Migrated posts are grandfathered to structural frontmatter only.
	if (d?.legacy || v.some(x => x.severity === 'error')) {
		return v
	}

	// --- HARD ERROR: absolute brand rule (no em/en-dash, no emoji) ---
	for (const [field, text] of [
		['title', d.title],
		['excerpt', d.excerpt],
		['body', p.body]
	] as const) {
		if (DASH_RE.test(text)) {
			err('R9', `em/en-dash in ${field}`)
		}
		if (EMOJI_RE.test(text)) {
			err('R9', `emoji in ${field}`)
		}
	}

	// --- HARD ERROR: thin-content floor (no upper bound; volume is good) ---
	const words = wordCount(p.body)
	if (words < MIN_WORDS) {
		err('R8', `${words} words (min ${MIN_WORDS}; too thin to be real content)`)
	}

	// --- WARNINGS: SEO/quality nudges, never block ---
	const kw =
		typeof d.targetKeyword === 'string' ? d.targetKeyword.toLowerCase() : ''
	if (!kw) {
		warn('R1', 'missing targetKeyword')
	}
	if (typeof d.pillar !== 'number') {
		warn('R0', 'pillar should be a number 1-10 (tracking)')
	}
	if (d.title.length > 60) {
		warn('R1', `title ${d.title.length} chars (> 60 may truncate in SERP)`)
	}
	if (kw && !d.title.toLowerCase().includes(kw)) {
		warn('R1', 'title does not contain targetKeyword')
	}
	if (d.excerpt.length < 120 || d.excerpt.length > 160) {
		warn('R2', `excerpt ${d.excerpt.length} chars (ideal 120-160)`)
	}
	const links = (p.body.match(INTERNAL_LINK_RE) ?? []).length
	if (links < 2) {
		warn('R5', `${links} internal links (aim >= 2)`)
	}
	if (!CTA_RE.test(p.body)) {
		warn('R6', 'no CTA link to /contact or /tools')
	}
	if (!/(^|\n)##\s|<h2/i.test(p.body)) {
		warn('R7', 'no H2 section')
	}
	const first100 = p.body
		.replace(/<[^>]+>/g, ' ')
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 100)
		.join(' ')
		.toLowerCase()
	if (kw && !first100.includes(kw)) {
		warn('R7', 'targetKeyword not in first 100 words')
	}
	// AI tell-tale phrases: warn (Claude scrubs at finalization so published
	// posts read human and in-voice). Use --strict to make these block.
	const tells = findAiTells(`${d.title} ${d.excerpt} ${p.body}`)
	if (tells.length > 0) {
		warn('AIVOICE', `AI tell-tale phrases: ${tells.join(', ')}`)
	}
	const commaAnd = countCommaBeforeAnd(`${d.excerpt} ${p.body}`)
	if (commaAnd > 0) {
		warn('VOICE', `${commaAnd}x comma before "and" (voice rule: never use it)`)
	}
	return v
}

// --- Cross-post link graph (internal linking rules) ---

/** An href attribute value with its character references decoded. */
function decodeEntities(value: string): string {
	return value.replace(
		ENTITY_RE,
		(ref, dec?: string, hex?: string, name?: string) => {
			if (name) {
				return NAMED_ENTITIES[name] ?? ref
			}
			const code = Number.parseInt(dec ?? hex ?? '', dec ? 10 : 16)
			return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ref
		}
	)
}

/**
 * The post slug an href attribute value points at, or null when it is not a
 * post link. The href is resolved with the WHATWG URL parser the way a browser
 * resolves it on the source post's page (/blog/<sourceSlug>; the site sets
 * trailingSlash: false), so scheme and host case, protocol-relative URLs,
 * default ports, dot segments, repeated slashes, percent-encoding, character
 * references and relative paths ("held", "./held", "../blog/held") all land on
 * the same slug.
 * Without a source, relative hrefs resolve against the site root.
 */
export function postSlugFromHref(
	href: string,
	sourceSlug?: string
): string | null {
	const base =
		sourceSlug === undefined
			? `${SITE_ORIGIN}/`
			: `${SITE_ORIGIN}/blog/${sourceSlug}`
	let url: URL
	try {
		url = new URL(decodeEntities(href), base)
	} catch {
		return null
	}
	if (
		(url.protocol !== 'https:' && url.protocol !== 'http:') ||
		!SITE_HOSTS.has(url.hostname) ||
		url.port !== ''
	) {
		return null
	}
	// The URL parser keeps empty segments, but Next 308s any path containing
	// "//" to its single-slash form, so /blog//held lands on /blog/held.
	const path = url.pathname.replace(/\/{2,}/g, '/')
	const segment = POST_PATH_RE.exec(path)?.[1]
	if (!segment) {
		return null
	}
	let slug = segment
	try {
		slug = decodeURIComponent(segment)
	} catch {
		// Malformed percent-encoding: keep the raw segment so LINK-dead names it.
	}
	return NON_POST_SEGMENTS.has(slug) ? null : slug
}

/**
 * The post slug a markdown link points at. marked writes the href into the
 * page through encodeURI (its cleanUrl), so resolve that form, not the raw
 * token, to match what the browser follows.
 */
function markdownPostSlug(href: string, sourceSlug?: string): string | null {
	let rendered: string
	try {
		rendered = encodeURI(href).replace(/%25/g, '%')
	} catch {
		return null
	}
	return postSlugFromHref(rendered, sourceSlug)
}

export interface PostLinks {
	/** Every other post this body links to, once each. */
	targets: Set<string>
	/** The subset linked from raw HTML, which the renderer cannot hide. */
	htmlTargets: Set<string>
}

/**
 * The href of every <a> element in a piece of raw HTML, in document order.
 * Bun's HTMLRewriter is a real HTML tokenizer, so HTML comments, script and
 * style text, escaped markup inside code or pre (&lt;a href=...&gt;) and other
 * attributes such as data-href never count, while double-quoted,
 * single-quoted and unquoted href values all do.
 */
export function htmlAnchorHrefs(html: string): string[] {
	const hrefs: string[] = []
	new HTMLRewriter()
		.on('a[href]', {
			element(el) {
				const href = el.getAttribute('href')
				if (href !== null) {
					hrefs.push(href)
				}
			}
		})
		.transform(html)
	return hrefs
}

/**
 * The other posts a body links to. Markdown goes through the marked lexer, so
 * reference links and autolinks count while code spans, code blocks and HTML
 * comments never do; raw HTML (html tokens and html-format bodies) is parsed
 * and only real <a href> elements count.
 */
export function extractPostLinks(p: ParsedPost): PostLinks {
	const targets = new Set<string>()
	const htmlTargets = new Set<string>()
	const add = (href: string, html: boolean): void => {
		const slug = html
			? postSlugFromHref(href, p.slug)
			: markdownPostSlug(href, p.slug)
		if (!slug || slug === p.slug) {
			return
		}
		targets.add(slug)
		if (html) {
			htmlTargets.add(slug)
		}
	}
	const scanHtml = (html: string): void => {
		for (const href of htmlAnchorHrefs(html)) {
			add(href, true)
		}
	}
	if ((p.data.bodyFormat ?? 'markdown') === 'html') {
		scanHtml(p.body)
		return { targets, htmlTargets }
	}
	const md = new Marked()
	md.walkTokens(md.lexer(p.body), (token: Token) => {
		if (token.type === 'link') {
			add(token.href, false)
		} else if (token.type === 'html') {
			scanHtml(token.raw)
		}
	})
	return { targets, htmlTargets }
}

/**
 * A source link counts for a target when the source is published AND either
 * already live or dated on or before the target. Both dates are UTC calendar
 * days and isLive uses the same days, so either way the link is live by the
 * target's go-live day. The set of qualifying links only grows as days
 * pass, so a scheduled post can never newly fail on its publish day.
 */
export function qualifies(
	src: ParsedPost,
	tgt: ParsedPost,
	now: Date
): boolean {
	if (src.data.published !== true) {
		return false
	}
	if (isLive(src.data, now)) {
		return true
	}
	const srcDay = publishedDay(src.data.publishedAt)
	const tgtDay = publishedDay(tgt.data.publishedAt)
	return srcDay !== null && tgtDay !== null && srcDay <= tgtDay
}

/**
 * Whether the source can be on the site while the target is not live yet: the
 * source is published and either live now or dated before the target. Drafts
 * never render, and a held source dated on or after the target is only ever
 * compiled once the target is live (both go live at UTC midnight).
 */
function rendersWhileHeld(
	src: ParsedPost,
	tgt: ParsedPost,
	now: Date
): boolean {
	if (src.data.published !== true || isLive(tgt.data, now)) {
		return false
	}
	if (isLive(src.data, now)) {
		return true
	}
	const srcDay = publishedDay(src.data.publishedAt)
	const tgtDay = publishedDay(tgt.data.publishedAt)
	// A target with no valid date never goes live, so fail closed.
	return srcDay !== null && (tgtDay === null || srcDay < tgtDay)
}

function inboundFrom(
	posts: ParsedPost[],
	links: ReadonlyMap<ParsedPost, PostLinks>,
	now: Date
): Map<string, string[]> {
	const bySlug = new Map(posts.map(p => [p.slug, p]))
	const inbound = new Map<string, string[]>()
	for (const p of posts) {
		if (p.data.published === true) {
			inbound.set(p.slug, [])
		}
	}
	for (const src of posts) {
		for (const slug of links.get(src)?.targets ?? []) {
			const tgt = bySlug.get(slug)
			const sources = inbound.get(slug)
			if (tgt && sources && qualifies(src, tgt, now)) {
				sources.push(src.slug)
			}
		}
	}
	for (const sources of inbound.values()) {
		sources.sort()
	}
	return inbound
}

/**
 * Every published post's slug mapped to the sorted, distinct slugs of the
 * posts whose links qualify for it (see qualifies). Empty when none do.
 */
export function qualifyingInbound(
	posts: ParsedPost[],
	now: Date
): Map<string, string[]> {
	return inboundFrom(
		posts,
		new Map(posts.map(p => [p, extractPostLinks(p)])),
		now
	)
}

/**
 * An orphan fails the build and the message names the slug. Every published
 * post has inbound links, so an orphan can only come from a new post shipped
 * without them. Scheduled publishes stay safe: a link qualifies when its source
 * is live now OR dated on or before the target, so the qualifying set only
 * grows as dates pass.
 */
export const ORPHAN_SEVERITY: Severity = 'error'

export interface LinkViolation extends Violation {
	file: string
}

/**
 * Cross-post link rules. They need every post at once, so they cannot live in
 * validatePost. Source-side rules land on the linking file:
 *   - LINK-dead: the target slug does not exist (any source, drafts included)
 *   - LINK-unpublished: a published source links a published: false post
 *   - LINK-html: a raw HTML anchor points at a post that is not live yet,
 *     which the renderer cannot turn into text the way it does markdown links;
 *     only when the source can render first (see rendersWhileHeld)
 * Target-side rules land on the linked file and count only qualifying links
 * from other published posts (live now OR dated on or before the target):
 *   - LINK-orphan: 0 qualifying inbound links (ORPHAN_SEVERITY)
 *   - LINK-below: exactly 1, a warning, because the floor is 2 so that one
 *     later edit cannot orphan a post again
 */
export function linkViolations(
	posts: ParsedPost[],
	now: Date
): LinkViolation[] {
	const v: LinkViolation[] = []
	const err = (file: string, rule: string, message: string): void => {
		v.push({ file, rule, message, severity: 'error' })
	}
	const warn = (file: string, rule: string, message: string): void => {
		v.push({ file, rule, message, severity: 'warn' })
	}

	const bySlug = new Map(posts.map(p => [p.slug, p]))
	const links = new Map(posts.map(p => [p, extractPostLinks(p)]))

	for (const src of posts) {
		const { targets, htmlTargets } = links.get(src) ?? {
			targets: new Set<string>(),
			htmlTargets: new Set<string>()
		}
		for (const slug of targets) {
			const tgt = bySlug.get(slug)
			if (!tgt) {
				err(
					src.file,
					'LINK-dead',
					`links to /blog/${slug}, which does not exist`
				)
				continue
			}
			if (tgt.data.published !== true && src.data.published === true) {
				err(
					src.file,
					'LINK-unpublished',
					`links to /blog/${slug}, which is published: false`
				)
			} else if (htmlTargets.has(slug) && rendersWhileHeld(src, tgt, now)) {
				err(
					src.file,
					'LINK-html',
					`raw HTML link to /blog/${slug}, which is not live yet; use a markdown link so the build renders it as text until it publishes`
				)
			}
		}
	}

	for (const [slug, sources] of inboundFrom(posts, links, now)) {
		const file = bySlug.get(slug)?.file ?? `${slug}.md`
		if (sources.length === 0) {
			v.push({
				file,
				rule: 'LINK-orphan',
				message: `${slug} has no qualifying inbound links from other posts (needs at least 2)`,
				severity: ORPHAN_SEVERITY
			})
		} else if (sources.length === 1) {
			warn(
				file,
				'LINK-below',
				`${slug} has 1 qualifying inbound link (from ${sources[0]}); add one more from a related post`
			)
		}
	}
	return v
}
