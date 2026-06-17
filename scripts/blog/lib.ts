/**
 * Shared helpers for the content/blog pipeline (validate, publish, generate).
 * No DB import here, so validate.ts runs in CI without POSTGRES_URL.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { marked } from 'marked'

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

export interface Violation {
	rule: string
	message: string
}

export function validatePost(p: ParsedPost): Violation[] {
	const v: Violation[] = []
	const d = p.data
	const push = (rule: string, message: string): void => {
		v.push({ rule, message })
	}

	for (const k of [
		'title',
		'slug',
		'excerpt',
		'author',
		'publishedAt'
	] as const) {
		if (typeof d?.[k] !== 'string' || !d[k]) {
			push('R0', `missing/!string frontmatter: ${k}`)
		}
	}
	if (!Array.isArray(d?.tags) || d.tags.length < 1) {
		push('R4', 'tags must be a non-empty array')
	} else {
		for (const t of d.tags) {
			if (!TAXONOMY.includes(t as TagSlug)) {
				push('R4', `unknown tag: ${t}`)
			}
		}
	}
	if (typeof d?.published !== 'boolean') {
		push('R0', 'published must be a boolean')
	}
	if (typeof d?.slug === 'string') {
		if (!SLUG_RE.test(d.slug)) {
			push('R3', `slug not kebab-case: ${d.slug}`)
		}
		if (d.slug !== p.file.replace(/\.md$/, '')) {
			push('R3', `slug "${d.slug}" != filename "${p.file}"`)
		}
	}

	// Migrated posts are grandfathered: structural frontmatter only.
	if (d?.legacy || v.length > 0) {
		return v
	}

	if (typeof d.targetKeyword !== 'string' || !d.targetKeyword) {
		push('R1', 'missing targetKeyword')
		return v
	}
	if (typeof d.pillar !== 'number') {
		push('R0', 'pillar must be a number 1-10')
	}
	const kw = d.targetKeyword.toLowerCase()
	if (d.title.length > 60) {
		push('R1', `title ${d.title.length} chars (> 60)`)
	}
	if (!d.title.toLowerCase().includes(kw)) {
		push('R1', 'title does not contain targetKeyword')
	}
	if (d.excerpt.length < 120 || d.excerpt.length > 160) {
		push('R2', `excerpt ${d.excerpt.length} chars (need 120-160)`)
	}
	const links = (p.body.match(INTERNAL_LINK_RE) ?? []).length
	if (links < 2) {
		push('R5', `${links} internal links (need >= 2)`)
	}
	if (!CTA_RE.test(p.body)) {
		push('R6', 'no CTA link to /contact or /tools')
	}
	if (!/(^|\n)##\s|<h2/i.test(p.body)) {
		push('R7', 'no H2 section')
	}
	const first100 = p.body
		.replace(/<[^>]+>/g, ' ')
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 100)
		.join(' ')
		.toLowerCase()
	if (!first100.includes(kw)) {
		push('R7', 'targetKeyword not in first 100 words')
	}
	const words = wordCount(p.body)
	if (words < 1000 || words > 2000) {
		push('R8', `${words} words (need 1000-2000)`)
	}
	for (const [field, text] of [
		['title', d.title],
		['excerpt', d.excerpt],
		['body', p.body]
	] as const) {
		if (DASH_RE.test(text)) {
			push('R9', `em/en-dash in ${field}`)
		}
		if (EMOJI_RE.test(text)) {
			push('R9', `emoji in ${field}`)
		}
	}
	return v
}
