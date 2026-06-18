/**
 * Shared helpers for the content/blog pipeline (validate, publish, generate).
 * No DB import here, so validate.ts runs in CI without POSTGRES_URL.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { marked } from 'marked'
import { countCommaBeforeAnd, findAiTells } from './voice'

export const CONTENT_DIR = join(process.cwd(), 'content/blog')

/** The 12-slug tag taxonomy (mirror of the blog_tags table). */
export const TAXONOMY = [
	'web-development',
	'business',
	'conversion-optimization',
	'business-automation',
	'dallas-fort-worth',
	'home-services',
	'local-marketing',
	'seo',
	'small-business',
	'web-design',
	'website-migration',
	'website-performance'
] as const
export type TagSlug = (typeof TAXONOMY)[number]

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

export function listPostFiles(): string[] {
	return readdirSync(CONTENT_DIR)
		.filter(f => f.endsWith('.md') && f !== 'README.md')
		.sort()
}

export function parsePost(file: string): ParsedPost {
	const raw = readFileSync(join(CONTENT_DIR, file), 'utf8')
	const { data, content } = matter(raw)
	const fm = data as BlogFrontmatter
	return {
		file,
		slug: fm.slug ?? file.replace(/\.md$/, ''),
		data: fm,
		body: content.trim()
	}
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

export function bodyToHtml(
	body: string,
	format: 'markdown' | 'html' = 'markdown'
): string {
	if (format === 'html') {
		return body
	}
	return marked.parse(body, { async: false }) as string
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
			if (!TAXONOMY.includes(t as TagSlug)) {
				err('R4', `unknown tag: ${t}`)
			}
		}
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
