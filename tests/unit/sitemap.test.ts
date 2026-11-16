import { describe, expect, it, type mock } from 'bun:test'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { TOOLS } from '@/app/(public)/tools/tools-data'
import { getAllPosts, getAuthors, getTags } from '@/lib/blog'
import { SERVICES } from '@/lib/constants/services'
import { helpArticleDate } from '@/lib/help-articles'
import { getAllLocationSlugs } from '@/lib/locations'
import {
	buildSitemapEntries,
	loadSitemapSources,
	SITEMAP_SECTIONS,
	type SitemapEntry,
	type SitemapSection,
	type SitemapSources
} from '@/lib/sitemap/entries'
import { PAGE_DATES, pageDate } from '@/lib/sitemap/page-dates'
import {
	renderSitemapIndex,
	renderUrlset,
	xmlResponse
} from '@/lib/sitemap/xml'

const SITE_URL = 'https://hudsondigitalsolutions.com'
const NOW = new Date()

// No module mocks: the sitemap wraps every DB-backed source
// (showcase/help-articles) in try/catch and falls back to an empty list, so
// without a database it still emits the static + registry-derived URLs we
// assert here. Blog URLs come from the compiled content/blog module.

async function entries(): Promise<SitemapEntry[]> {
	return buildSitemapEntries(await loadSitemapSources())
}

describe('sitemap', () => {
	it('includes every public tool from the TOOLS registry', async () => {
		const urls = new Set((await entries()).map(e => e.url))
		for (const tool of TOOLS) {
			expect(urls.has(`${SITE_URL}${tool.href}`)).toBe(true)
		}
	})

	it('excludes the admin-only testimonial-collector tool', async () => {
		const urls = (await entries()).map(e => e.url)
		expect(urls.some(u => u.includes('/tools/testimonial-collector'))).toBe(
			false
		)
	})

	it('includes legal and landing routes that were previously missing', async () => {
		const urls = new Set((await entries()).map(e => e.url))
		expect(urls.has(`${SITE_URL}/terms`)).toBe(true)
		expect(urls.has(`${SITE_URL}/website-migration`)).toBe(true)
	})

	it('leaves out help pages that have no published articles', async () => {
		// No database here, so there are no help articles: the hub and every
		// category are empty pages and must not be listed.
		const urls = (await entries()).map(e => e.url)
		expect(urls.some(u => u.startsWith(`${SITE_URL}/help`))).toBe(false)
	})

	it('emits exactly one URL per published blog post', async () => {
		const blogUrls = (await entries())
			.map(e => e.url)
			.filter(u => /\/blog\/(?!tag\/|author\/)[^/]+$/.test(u))
		const posts = await getAllPosts()
		expect(blogUrls.sort()).toEqual(
			posts.map(p => `${SITE_URL}/blog/${p.slug}`).sort()
		)
	})

	it('never emits a duplicate URL', async () => {
		const urls = (await entries()).map(e => e.url)
		expect(urls.length).toBe(new Set(urls).size)
	})
})

describe('PAGE_DATES', () => {
	const STATIC_PATHS = [
		'/',
		'/about',
		'/contact',
		'/faq',
		'/showcase',
		'/tools',
		'/services',
		'/website-migration',
		'/locations',
		'/privacy',
		'/terms'
	]

	it('stores every value as a real YYYY-MM-DD calendar date', () => {
		for (const value of Object.values(PAGE_DATES)) {
			expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/)
			// Round-trip rejects impossible dates such as 2026-02-30.
			expect(new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10)).toBe(
				value
			)
		}
	})

	it('never dates a page in the future', () => {
		const now = new Date()
		for (const path of Object.keys(PAGE_DATES)) {
			expect(pageDate(path).getTime()).toBeLessThanOrEqual(now.getTime())
		}
	})

	it('returns UTC midnight for every mapped path', () => {
		for (const path of Object.keys(PAGE_DATES)) {
			const date = pageDate(path)
			expect(date.getUTCHours()).toBe(0)
			expect(date.getUTCMinutes()).toBe(0)
			expect(date.getUTCSeconds()).toBe(0)
			expect(date.getUTCMilliseconds()).toBe(0)
		}
	})

	it('dates every static page and every service, location and tool', () => {
		// A new registry entry without a date fails here, before any deploy.
		const paths = [
			...STATIC_PATHS,
			...SERVICES.map(service => `/services/${service.slug}`),
			...getAllLocationSlugs().map(slug => `/locations/${slug}`),
			...TOOLS.map(tool => tool.href)
		]
		for (const path of paths) {
			expect(() => pageDate(path)).not.toThrow()
		}
	})

	it('throws an actionable error for an unmapped path', () => {
		expect(() => pageDate('/not-a-page')).toThrow(/\/not-a-page/)
		expect(() => pageDate('/not-a-page')).toThrow(/PAGE_DATES/)
	})

	it('keeps the authored legal dates shown on the pages', () => {
		expect(pageDate('/privacy').toISOString().startsWith('2026-06-03')).toBe(
			true
		)
		expect(pageDate('/terms').toISOString().startsWith('2026-05-28')).toBe(true)
	})

	it('dates the empty dallas-fort-worth tag from the commit that defined it', () => {
		expect(PAGE_DATES['/blog/tag/dallas-fort-worth']).toBe('2026-11-08')
	})
})

// D1 section rule, re-derived from the path so the builder's explicit
// `section` tags are checked against an independent statement of the rule.
function expectedSection(path: string): SitemapSection {
	if (path === '/blog' || path.startsWith('/blog/')) {
		return 'blog'
	}
	if (
		path === '/services' ||
		path.startsWith('/services/') ||
		path === '/website-migration'
	) {
		return 'services'
	}
	if (path === '/locations' || path.startsWith('/locations/')) {
		return 'locations'
	}
	return 'core'
}

function pathOf(url: string): string {
	expect(url.startsWith(SITE_URL)).toBe(true)
	return url === SITE_URL ? '/' : url.slice(SITE_URL.length)
}

function findEntry(entries: SitemapEntry[], path: string): SitemapEntry {
	const entry = entries.find(e => pathOf(e.url) === path)
	if (!entry) {
		throw new Error(`No sitemap entry for ${path}`)
	}
	return entry
}

function lastmodOf(entries: SitemapEntry[], path: string): string {
	return findEntry(entries, path).lastModified.toISOString()
}

function hasPath(entries: SitemapEntry[], path: string): boolean {
	return entries.some(e => pathOf(e.url) === path)
}

// Minimal sources: no DB rows, two real services, one post so /blog (which
// has no PAGE_DATES entry) has a date. Tests override only what they cover.
function fixtureSources(overrides: Partial<SitemapSources>): SitemapSources {
	return {
		posts: [
			{
				slug: 'p',
				publishedAt: '2026-01-01T00:00:00.000Z',
				tagSlugs: [],
				authorSlug: 'richard-hudson'
			}
		],
		tagSlugs: [],
		authorSlugs: ['richard-hudson'],
		services: [
			{ slug: 'web-design', blogTag: 'web-design' },
			{ slug: 'local-seo', blogTag: 'seo' }
		],
		toolHrefs: [],
		locationSlugs: [],
		showcase: [],
		helpCategorySlugs: [],
		helpArticles: [],
		testimonials: [],
		...overrides
	}
}

// tests/setup.ts re-registers the logger mock per test, so read the live
// instance at assert time (same pattern as error-boundary-report.test.tsx).
async function currentLoggerWarn(): Promise<ReturnType<typeof mock>> {
	const { logger } = await import('@/lib/logger')
	return logger.warn as ReturnType<typeof mock>
}

const HAND_LISTED_PATHS = [
	'/',
	'/services',
	'/showcase',
	'/about',
	'/contact',
	'/website-migration',
	'/faq',
	'/blog',
	'/tools',
	'/locations',
	'/privacy',
	'/terms'
]

describe('sitemap sections', () => {
	it('lists the sections in index order', () => {
		expect([...SITEMAP_SECTIONS]).toEqual([
			'blog',
			'services',
			'locations',
			'core'
		])
	})

	it('tags every no-DB entry with the section its path belongs to', async () => {
		const entries = buildSitemapEntries(await loadSitemapSources())
		expect(entries.length).toBeGreaterThan(0)
		for (const entry of entries) {
			expect(entry.section).toBe(expectedSection(pathOf(entry.url)))
		}
	})

	it('puts DB-backed showcase, help and testimonial URLs in core', () => {
		const entries = buildSitemapEntries(
			fixtureSources({
				showcase: [
					{
						slug: 'item',
						updatedAt: new Date('2026-03-01T00:00:00.000Z'),
						publishedAt: null,
						createdAt: null
					}
				],
				helpCategorySlugs: ['billing'],
				helpArticles: [
					{
						slug: 'invoices',
						category: 'billing',
						updatedAt: '2026-02-01T00:00:00.000Z',
						createdAt: null
					}
				],
				testimonials: [{ updatedAt: '2026-04-01T00:00:00.000Z' }]
			})
		)
		for (const path of [
			'/showcase/item',
			'/help',
			'/help/billing',
			'/help/billing/invoices',
			'/testimonials'
		]) {
			expect(findEntry(entries, path).section).toBe('core')
		}
		for (const entry of entries) {
			expect(entry.section).toBe(expectedSection(pathOf(entry.url)))
		}
	})
})

describe('sitemap no-DB URL set', () => {
	it('emits exactly the hand-listed, registry and blog URLs, once each', async () => {
		const entries = buildSitemapEntries(await loadSitemapSources())
		const urls = entries.map(e => e.url)
		expect(urls.length).toBe(new Set(urls).size)

		const expected = [
			...HAND_LISTED_PATHS,
			...SERVICES.map(service => `/services/${service.slug}`),
			...TOOLS.map(tool => tool.href),
			...getAllLocationSlugs().map(slug => `/locations/${slug}`),
			...(await getAllPosts()).map(post => `/blog/${post.slug}`),
			...(await getTags()).map(tag => `/blog/tag/${tag.slug}`),
			...(await getAuthors()).map(author => `/blog/author/${author.slug}`)
		].map(path => (path === '/' ? SITE_URL : `${SITE_URL}${path}`))

		expect([...urls].sort()).toEqual([...expected].sort())
		expect(urls).toContain(`${SITE_URL}/blog/tag/dallas-fort-worth`)
		expect(urls).toContain(SITE_URL)
		expect(urls).not.toContain(`${SITE_URL}/`)
	})

	it('splits the no-DB set into the expected per-section counts', async () => {
		const entries = buildSitemapEntries(await loadSitemapSources())
		const count = (section: SitemapSection) =>
			entries.filter(e => e.section === section).length
		const posts = await getAllPosts()
		const tags = await getTags()
		const authors = await getAuthors()

		expect(count('services')).toBe(2 + SERVICES.length)
		expect(count('locations')).toBe(1 + getAllLocationSlugs().length)
		expect(count('core')).toBe(8 + TOOLS.length)
		expect(count('blog')).toBe(1 + posts.length + tags.length + authors.length)
		expect(SERVICES.length).toBe(3)
		expect(getAllLocationSlugs().length).toBe(4)
	})

	it('dates every no-DB entry at a real UTC midnight no later than now', async () => {
		const entries = buildSitemapEntries(await loadSitemapSources())
		for (const entry of entries) {
			const time = entry.lastModified.getTime()
			expect(Number.isNaN(time)).toBe(false)
			expect(time).toBeLessThanOrEqual(NOW.getTime())
			expect(time % 86_400_000).toBe(0)
		}
	})

	it('keeps changefreq and priority exactly as before the split', async () => {
		const entries = buildSitemapEntries(await loadSitemapSources())
		const expectations: [string, string, number][] = [
			['/', 'weekly', 1],
			['/services', 'monthly', 0.9],
			['/services/web-design', 'monthly', 0.9],
			['/showcase', 'weekly', 0.9],
			['/about', 'monthly', 0.8],
			['/contact', 'monthly', 0.9],
			['/website-migration', 'monthly', 0.8],
			['/faq', 'monthly', 0.7],
			['/blog', 'weekly', 0.8],
			['/tools', 'monthly', 0.7],
			['/locations', 'monthly', 0.8],
			['/privacy', 'yearly', 0.3],
			['/terms', 'yearly', 0.3],
			['/tools/roi-calculator', 'monthly', 0.7],
			['/locations/dallas', 'monthly', 0.7],
			['/blog/tag/seo', 'weekly', 0.5],
			['/blog/author/richard-hudson', 'weekly', 0.5]
		]
		for (const [path, changeFrequency, priority] of expectations) {
			const entry = findEntry(entries, path)
			expect([path, entry.changeFrequency, entry.priority]).toEqual([
				path,
				changeFrequency,
				priority
			])
		}
		const post = (await getAllPosts())[0]
		if (!post) {
			throw new Error('expected at least one live post')
		}
		const postEntry = findEntry(entries, `/blog/${post.slug}`)
		expect(postEntry.changeFrequency).toBe('monthly')
		expect(postEntry.priority).toBe(0.7)
	})

	it('keeps the DB-backed families at their previous changefreq and priority', () => {
		const entries = buildSitemapEntries(
			fixtureSources({
				showcase: [
					{
						slug: 'item',
						updatedAt: new Date('2026-03-01T00:00:00.000Z'),
						publishedAt: null,
						createdAt: null
					}
				],
				helpCategorySlugs: ['billing'],
				helpArticles: [
					{
						slug: 'invoices',
						category: 'billing',
						updatedAt: '2026-02-01T00:00:00.000Z',
						createdAt: null
					}
				],
				testimonials: [{ updatedAt: '2026-04-01T00:00:00.000Z' }]
			})
		)
		const expectations: [string, string, number][] = [
			['/help', 'monthly', 0.6],
			['/help/billing', 'monthly', 0.5],
			['/help/billing/invoices', 'monthly', 0.5],
			['/testimonials', 'weekly', 0.7],
			['/showcase/item', 'monthly', 0.7]
		]
		for (const [path, changeFrequency, priority] of expectations) {
			const entry = findEntry(entries, path)
			expect([path, entry.changeFrequency, entry.priority]).toEqual([
				path,
				changeFrequency,
				priority
			])
		}
	})
})

describe('sitemap lastmod', () => {
	it('builds the default fixture from its one post', () => {
		const entries = buildSitemapEntries(fixtureSources({}))
		expect(lastmodOf(entries, '/blog/p')).toBe('2026-01-01T00:00:00.000Z')
		expect(lastmodOf(entries, '/blog')).toBe('2026-01-01T00:00:00.000Z')
		expect(lastmodOf(entries, '/blog/author/richard-hudson')).toBe(
			'2026-01-01T00:00:00.000Z'
		)
	})

	it('throws naming /blog when there are no posts to date it', () => {
		expect(() => buildSitemapEntries(fixtureSources({ posts: [] }))).toThrow(
			/\/blog/
		)
	})

	it('dates /blog, tags and authors by their newest post', () => {
		const entries = buildSitemapEntries(
			fixtureSources({
				posts: [
					{
						slug: 'a',
						publishedAt: '2026-03-05T00:00:00.000Z',
						tagSlugs: ['seo'],
						authorSlug: 'richard-hudson'
					},
					{
						slug: 'b',
						publishedAt: '2026-05-10T00:00:00.000Z',
						tagSlugs: ['seo', 'web-design'],
						authorSlug: 'guest'
					},
					{
						slug: 'c',
						publishedAt: '2026-04-01T00:00:00.000Z',
						tagSlugs: ['web-design'],
						authorSlug: 'richard-hudson'
					}
				],
				tagSlugs: ['seo', 'web-design'],
				authorSlugs: ['richard-hudson', 'guest']
			})
		)
		expect(lastmodOf(entries, '/blog')).toBe('2026-05-10T00:00:00.000Z')
		expect(lastmodOf(entries, '/blog/a')).toBe('2026-03-05T00:00:00.000Z')
		expect(lastmodOf(entries, '/blog/tag/seo')).toBe('2026-05-10T00:00:00.000Z')
		expect(lastmodOf(entries, '/blog/tag/web-design')).toBe(
			'2026-05-10T00:00:00.000Z'
		)
		expect(lastmodOf(entries, '/blog/author/richard-hudson')).toBe(
			'2026-04-01T00:00:00.000Z'
		)
		expect(lastmodOf(entries, '/blog/author/guest')).toBe(
			'2026-05-10T00:00:00.000Z'
		)
	})

	it('dates an empty tag from PAGE_DATES', () => {
		const entries = buildSitemapEntries(
			fixtureSources({ tagSlugs: ['dallas-fort-worth'] })
		)
		expect(lastmodOf(entries, '/blog/tag/dallas-fort-worth')).toBe(
			'2026-11-08T00:00:00.000Z'
		)
	})

	it('throws naming an empty tag that has no PAGE_DATES entry', () => {
		expect(() =>
			buildSitemapEntries(fixtureSources({ tagSlugs: ['no-posts-yet'] }))
		).toThrow(/\/blog\/tag\/no-posts-yet/)
	})

	it('dates a service page by its newest related post when that is newer', () => {
		const entries = buildSitemapEntries(
			fixtureSources({
				posts: [
					{
						slug: 'fresh',
						publishedAt: '2026-11-20T00:00:00.000Z',
						tagSlugs: ['web-design'],
						authorSlug: 'richard-hudson'
					}
				]
			})
		)
		expect(lastmodOf(entries, '/services/web-design')).toBe(
			'2026-11-20T00:00:00.000Z'
		)
		expect(lastmodOf(entries, '/services/local-seo')).toBe(
			pageDate('/services/local-seo').toISOString()
		)
	})

	it('keeps a service page at its PAGE_DATES date when related posts are older', () => {
		const entries = buildSitemapEntries(
			fixtureSources({
				posts: [
					{
						slug: 'old',
						publishedAt: '2025-01-01T00:00:00.000Z',
						tagSlugs: ['web-design'],
						authorSlug: 'richard-hudson'
					}
				]
			})
		)
		expect(lastmodOf(entries, '/services/web-design')).toBe(
			pageDate('/services/web-design').toISOString()
		)
	})

	it('dates hand-authored pages from PAGE_DATES', () => {
		const entries = buildSitemapEntries(
			fixtureSources({
				toolHrefs: ['/tools/json-formatter'],
				locationSlugs: ['dallas']
			})
		)
		for (const path of [
			'/',
			'/about',
			'/privacy',
			'/website-migration',
			'/tools/json-formatter',
			'/locations/dallas'
		]) {
			expect(lastmodOf(entries, path)).toBe(pageDate(path).toISOString())
		}
	})

	it('dates showcase items by updatedAt, then publishedAt, then createdAt', () => {
		const entries = buildSitemapEntries(
			fixtureSources({
				showcase: [
					{
						slug: 'updated',
						updatedAt: new Date('2026-03-03T10:00:00.000Z'),
						publishedAt: new Date('2026-02-02T00:00:00.000Z'),
						createdAt: new Date('2026-01-01T00:00:00.000Z')
					},
					{
						slug: 'published',
						updatedAt: null,
						publishedAt: new Date('2026-02-02T00:00:00.000Z'),
						createdAt: new Date('2026-01-01T00:00:00.000Z')
					},
					{
						slug: 'created',
						updatedAt: null,
						publishedAt: null,
						createdAt: new Date('2026-01-01T00:00:00.000Z')
					}
				]
			})
		)
		expect(lastmodOf(entries, '/showcase/updated')).toBe(
			'2026-03-03T10:00:00.000Z'
		)
		expect(lastmodOf(entries, '/showcase/published')).toBe(
			'2026-02-02T00:00:00.000Z'
		)
		expect(lastmodOf(entries, '/showcase/created')).toBe(
			'2026-01-01T00:00:00.000Z'
		)
	})

	it('drops and logs a showcase item with no date', async () => {
		const entries = buildSitemapEntries(
			fixtureSources({
				showcase: [
					{
						slug: 'undated',
						updatedAt: null,
						publishedAt: null,
						createdAt: null
					}
				]
			})
		)
		expect(hasPath(entries, '/showcase/undated')).toBe(false)
		expect(hasPath(entries, '/showcase')).toBe(true)
		expect(await currentLoggerWarn()).toHaveBeenCalledWith(
			expect.stringContaining('no date'),
			{ slug: 'undated' }
		)
	})

	it('dates /showcase by the later of its page date and newest item', () => {
		const newer = buildSitemapEntries(
			fixtureSources({
				showcase: [
					{
						slug: 'new',
						updatedAt: new Date('2026-11-30T08:00:00.000Z'),
						publishedAt: null,
						createdAt: null
					}
				]
			})
		)
		expect(lastmodOf(newer, '/showcase')).toBe('2026-11-30T08:00:00.000Z')

		const older = buildSitemapEntries(
			fixtureSources({
				showcase: [
					{
						slug: 'old',
						updatedAt: new Date('2025-01-01T00:00:00.000Z'),
						publishedAt: null,
						createdAt: null
					}
				]
			})
		)
		expect(lastmodOf(older, '/showcase')).toBe(
			pageDate('/showcase').toISOString()
		)
	})

	it('lists no help URL when there are no help articles', () => {
		const entries = buildSitemapEntries(
			fixtureSources({ helpCategorySlugs: ['billing', 'account'] })
		)
		expect(entries.some(e => pathOf(e.url).startsWith('/help'))).toBe(false)
	})

	it('lists the hub, category and article for one help article', () => {
		const entries = buildSitemapEntries(
			fixtureSources({
				helpCategorySlugs: ['billing', 'account'],
				helpArticles: [
					{
						slug: 'invoices',
						category: 'billing',
						updatedAt: null,
						createdAt: '2026-02-01T00:00:00.000Z'
					}
				]
			})
		)
		const helpPaths = entries
			.map(e => pathOf(e.url))
			.filter(path => path.startsWith('/help'))
			.sort()
		expect(helpPaths).toEqual([
			'/help',
			'/help/billing',
			'/help/billing/invoices'
		])
		expect(lastmodOf(entries, '/help/billing/invoices')).toBe(
			'2026-02-01T00:00:00.000Z'
		)
	})

	it('dates help articles by updatedAt and listings by their newest article', () => {
		const entries = buildSitemapEntries(
			fixtureSources({
				helpCategorySlugs: ['billing', 'account'],
				helpArticles: [
					{
						slug: 'invoices',
						category: 'billing',
						updatedAt: '2026-04-04T00:00:00.000Z',
						createdAt: '2026-01-01T00:00:00.000Z'
					},
					{
						slug: 'refunds',
						category: 'billing',
						updatedAt: '2026-03-03T00:00:00.000Z',
						createdAt: null
					},
					{
						slug: 'password',
						category: 'account',
						updatedAt: '2026-06-06T00:00:00.000Z',
						createdAt: null
					}
				]
			})
		)
		expect(lastmodOf(entries, '/help/billing/invoices')).toBe(
			'2026-04-04T00:00:00.000Z'
		)
		expect(lastmodOf(entries, '/help/billing')).toBe('2026-04-04T00:00:00.000Z')
		expect(lastmodOf(entries, '/help/account')).toBe('2026-06-06T00:00:00.000Z')
		expect(lastmodOf(entries, '/help')).toBe('2026-06-06T00:00:00.000Z')
	})

	it('drops an undated help article and the listings it alone filled', async () => {
		const entries = buildSitemapEntries(
			fixtureSources({
				helpCategorySlugs: ['billing'],
				helpArticles: [
					{
						slug: 'undated',
						category: 'billing',
						updatedAt: null,
						createdAt: null
					}
				]
			})
		)
		expect(entries.some(e => pathOf(e.url).startsWith('/help'))).toBe(false)
		expect(await currentLoggerWarn()).toHaveBeenCalledWith(
			expect.stringContaining('no date'),
			{ slug: 'undated' }
		)
	})

	it('lists exactly the help articles the help pages leave indexable', () => {
		const rows = [
			{
				slug: 'both',
				updated_at: '2026-04-04T00:00:00.000Z',
				created_at: '2026-01-01T00:00:00.000Z'
			},
			{
				slug: 'updated',
				updated_at: '2026-03-03T00:00:00.000Z',
				created_at: null
			},
			{
				slug: 'created',
				updated_at: null,
				created_at: '2026-02-02T00:00:00.000Z'
			},
			{ slug: 'undated', updated_at: null, created_at: null }
		]
		const entries = buildSitemapEntries(
			fixtureSources({
				helpCategorySlugs: ['billing'],
				helpArticles: rows.map(row => ({
					slug: row.slug,
					category: 'billing',
					updatedAt: row.updated_at,
					createdAt: row.created_at
				}))
			})
		)
		for (const row of rows) {
			const path = `/help/billing/${row.slug}`
			const date = helpArticleDate(row)
			expect([row.slug, hasPath(entries, path)]).toEqual([
				row.slug,
				date !== null
			])
			if (date) {
				expect(lastmodOf(entries, path)).toBe(date)
			}
		}
	})

	it('lists a help article outside the known categories without its category', () => {
		const entries = buildSitemapEntries(
			fixtureSources({
				helpCategorySlugs: ['billing'],
				helpArticles: [
					{
						slug: 'orphan',
						category: 'retired',
						updatedAt: '2026-02-01T00:00:00.000Z',
						createdAt: null
					}
				]
			})
		)
		expect(hasPath(entries, '/help/retired/orphan')).toBe(true)
		expect(hasPath(entries, '/help/retired')).toBe(false)
		expect(hasPath(entries, '/help')).toBe(false)
	})

	it('lists /testimonials only when an approved testimonial exists', () => {
		const entries = buildSitemapEntries(fixtureSources({ testimonials: [] }))
		expect(hasPath(entries, '/testimonials')).toBe(false)
	})

	it('dates /testimonials by the newest updatedAt', () => {
		const entries = buildSitemapEntries(
			fixtureSources({
				testimonials: [
					{ updatedAt: '2026-04-01T00:00:00.000Z' },
					{ updatedAt: '2026-07-07T00:00:00.000Z' },
					{ updatedAt: null }
				]
			})
		)
		expect(lastmodOf(entries, '/testimonials')).toBe('2026-07-07T00:00:00.000Z')
	})

	it('drops and logs /testimonials when no approved row has updatedAt', async () => {
		const entries = buildSitemapEntries(
			fixtureSources({ testimonials: [{ updatedAt: null }] })
		)
		expect(hasPath(entries, '/testimonials')).toBe(false)
		expect(await currentLoggerWarn()).toHaveBeenCalledWith(
			expect.stringContaining('no date'),
			{ slug: 'testimonials' }
		)
	})
})

describe('sitemap source scan', () => {
	it('never stamps build or request time in src/lib/sitemap', () => {
		const dir = join(import.meta.dir, '../../src/lib/sitemap')
		const files = readdirSync(dir).filter(file => file.endsWith('.ts'))
		expect(files).toContain('entries.ts')
		for (const file of files) {
			const code = readFileSync(join(dir, file), 'utf8')
				.replace(/\/\*[\s\S]*?\*\//g, '')
				.replace(/\/\/.*$/gm, '')
			expect([file, /new Date\(\s*\)/.test(code)]).toEqual([file, false])
			expect([file, code.includes('BUILD_TIME')]).toEqual([file, false])
		}
	})
})

const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9'
// happy-dom's DOMParser accepts a raw `&`, so escaping is checked on the text.
const BARE_AMP = /&(?!(?:amp|lt|gt|quot|apos);)/

function parse(xml: string): Document {
	return new DOMParser().parseFromString(xml, 'application/xml')
}

function textOf(parent: Element, tag: string): string | null {
	return parent.getElementsByTagName(tag)[0]?.textContent ?? null
}

function fixtureEntry(url: string): SitemapEntry {
	return {
		url,
		section: 'core',
		lastModified: new Date('2026-11-14T00:00:00.000Z'),
		changeFrequency: 'monthly',
		priority: 0.7
	}
}

describe('sitemap XML', () => {
	it('renders a well-formed urlset in the sitemaps 0.9 namespace', () => {
		const entry = fixtureEntry(`${SITE_URL}/about`)
		const xml = renderUrlset([entry])
		expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
		const doc = parse(xml)
		expect(doc.getElementsByTagName('parsererror').length).toBe(0)
		expect(doc.documentElement.tagName).toBe('urlset')
		expect(doc.documentElement.namespaceURI).toBe(SITEMAP_NS)
		const urls = doc.getElementsByTagName('url')
		expect(urls.length).toBe(1)
		const url = urls[0]
		if (!url) {
			throw new Error('expected one <url>')
		}
		expect(textOf(url, 'loc')).toBe(`${SITE_URL}/about`)
		expect(textOf(url, 'lastmod')).toBe(entry.lastModified.toISOString())
		expect(textOf(url, 'changefreq')).toBe('monthly')
		expect(textOf(url, 'priority')).toBe('0.7')
	})

	it('escapes &, < and > in a loc', () => {
		const xml = renderUrlset([fixtureEntry(`${SITE_URL}/x?a=1&b=<2>`)])
		expect(xml).toContain('x?a=1&amp;b=&lt;2&gt;')
		const doc = parse(xml)
		expect(doc.getElementsByTagName('parsererror').length).toBe(0)
		expect(textOf(doc.documentElement, 'loc')).toBe(`${SITE_URL}/x?a=1&b=<2>`)
	})

	it('leaves no bare ampersand in a urlset or an index', () => {
		const urlset = renderUrlset([fixtureEntry(`${SITE_URL}/y?a=1&b=2`)])
		expect(urlset).toContain('y?a=1&amp;b=2')
		expect(BARE_AMP.test(urlset)).toBe(false)

		const index = renderSitemapIndex([
			{
				loc: `${SITE_URL}/sitemap-blog.xml?a=1&b=2`,
				lastModified: new Date('2026-11-12T00:00:00.000Z')
			}
		])
		expect(index).toContain('sitemap-blog.xml?a=1&amp;b=2')
		expect(BARE_AMP.test(index)).toBe(false)
	})

	it('renders a well-formed sitemapindex with the children in order', () => {
		const children = [
			{ loc: `${SITE_URL}/sitemap-blog.xml`, date: '2026-11-12' },
			{ loc: `${SITE_URL}/sitemap-services.xml`, date: '2026-11-15' },
			{ loc: `${SITE_URL}/sitemap-locations.xml`, date: '2026-11-14' },
			{ loc: `${SITE_URL}/sitemap-core.xml`, date: '2026-11-16' }
		].map(({ loc, date }) => ({
			loc,
			lastModified: new Date(`${date}T00:00:00.000Z`)
		}))
		const xml = renderSitemapIndex(children)
		expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
		const doc = parse(xml)
		expect(doc.getElementsByTagName('parsererror').length).toBe(0)
		expect(doc.documentElement.tagName).toBe('sitemapindex')
		expect(doc.documentElement.namespaceURI).toBe(SITEMAP_NS)
		const sitemaps = Array.from(doc.getElementsByTagName('sitemap'))
		expect(
			sitemaps.map(node => [textOf(node, 'loc'), textOf(node, 'lastmod')])
		).toEqual(
			children.map(child => [child.loc, child.lastModified.toISOString()])
		)
	})

	it('serves XML with an explicit UTF-8 content type and the body unchanged', async () => {
		const body = renderUrlset([fixtureEntry(`${SITE_URL}/faq`)])
		const response = xmlResponse(body)
		expect(response.status).toBe(200)
		expect(response.headers.get('content-type')).toBe(
			'application/xml; charset=utf-8'
		)
		expect(await response.text()).toBe(body)
	})

	it('renders the full no-DB entry list as a valid urlset', async () => {
		const entries = buildSitemapEntries(await loadSitemapSources())
		const xml = renderUrlset(entries)
		const doc = parse(xml)
		expect(doc.getElementsByTagName('parsererror').length).toBe(0)
		expect(doc.documentElement.namespaceURI).toBe(SITEMAP_NS)
		expect(BARE_AMP.test(xml)).toBe(false)
		const locs = Array.from(doc.getElementsByTagName('loc')).map(
			node => node.textContent ?? ''
		)
		expect(locs.length).toBe(entries.length)
		for (const loc of locs) {
			expect(loc.startsWith(SITE_URL)).toBe(true)
		}
	})
})

type SitemapRoute = { GET: () => Promise<Response> }

// Literal imports so each route module is type-checked.
const CHILD_ROUTES: Record<SitemapSection, () => Promise<SitemapRoute>> = {
	blog: () => import('@/app/sitemap-blog.xml/route'),
	services: () => import('@/app/sitemap-services.xml/route'),
	locations: () => import('@/app/sitemap-locations.xml/route'),
	core: () => import('@/app/sitemap-core.xml/route')
}

async function serve(
	load: () => Promise<SitemapRoute>
): Promise<{ response: Response; xml: string }> {
	const response = await (await load()).GET()
	return { response, xml: await response.text() }
}

function locsOf(xml: string): string[] {
	return Array.from(parse(xml).getElementsByTagName('loc')).map(
		node => node.textContent ?? ''
	)
}

const APP_DIR = join(import.meta.dir, '../../src/app')

describe('sitemap routes', () => {
	for (const section of SITEMAP_SECTIONS) {
		it(`serves /sitemap-${section}.xml as a valid urlset`, async () => {
			const { response, xml } = await serve(CHILD_ROUTES[section])
			expect(response.status).toBe(200)
			expect(response.headers.get('content-type')).toBe(
				'application/xml; charset=utf-8'
			)
			const doc = parse(xml)
			expect(doc.getElementsByTagName('parsererror').length).toBe(0)
			expect(doc.documentElement.tagName).toBe('urlset')
			expect(doc.documentElement.namespaceURI).toBe(SITEMAP_NS)
			expect(BARE_AMP.test(xml)).toBe(false)
			const locs = locsOf(xml)
			expect(locs.length).toBeGreaterThan(0)
			for (const loc of locs) {
				expect(loc.startsWith(SITE_URL)).toBe(true)
			}
		})
	}

	it('partitions the builder URL set across the four children', async () => {
		const builderUrls = (await entries()).map(e => e.url)
		const served: string[] = []
		for (const section of SITEMAP_SECTIONS) {
			const locs = locsOf((await serve(CHILD_ROUTES[section])).xml)
			for (const loc of locs) {
				expect([loc, expectedSection(pathOf(loc))]).toEqual([loc, section])
			}
			served.push(...locs)
		}
		// Equal counts plus equal sets: no URL is in two children.
		expect(served.length).toBe(builderUrls.length)
		expect(new Set(served)).toEqual(new Set(builderUrls))
	})

	it('serves /sitemap.xml as an index of the four children in order', async () => {
		const { response, xml } = await serve(
			() => import('@/app/sitemap.xml/route')
		)
		expect(response.status).toBe(200)
		expect(response.headers.get('content-type')).toBe(
			'application/xml; charset=utf-8'
		)
		const doc = parse(xml)
		expect(doc.getElementsByTagName('parsererror').length).toBe(0)
		expect(doc.documentElement.tagName).toBe('sitemapindex')
		expect(doc.documentElement.namespaceURI).toBe(SITEMAP_NS)
		expect(BARE_AMP.test(xml)).toBe(false)
		expect(locsOf(xml)).toEqual([
			`${SITE_URL}/sitemap-blog.xml`,
			`${SITE_URL}/sitemap-services.xml`,
			`${SITE_URL}/sitemap-locations.xml`,
			`${SITE_URL}/sitemap-core.xml`
		])
	})

	it('dates each index entry by the newest lastmod in its child', async () => {
		const all = await entries()
		const { xml } = await serve(() => import('@/app/sitemap.xml/route'))
		const lastmods = Array.from(parse(xml).getElementsByTagName('sitemap')).map(
			node => textOf(node, 'lastmod')
		)
		const expected = SITEMAP_SECTIONS.map(section =>
			new Date(
				Math.max(
					...all
						.filter(e => e.section === section)
						.map(e => e.lastModified.getTime())
				)
			).toISOString()
		)
		expect(lastmods).toEqual(expected)
	})

	it('has no metadata sitemap file competing for /sitemap.xml', () => {
		for (const file of ['sitemap.ts', 'sitemap.tsx', 'sitemap.js']) {
			expect([file, existsSync(join(APP_DIR, file))]).toEqual([file, false])
		}
		// sitemap.xml must be the route folder, never a static file.
		expect(statSync(join(APP_DIR, 'sitemap.xml')).isDirectory()).toBe(true)
	})
})
