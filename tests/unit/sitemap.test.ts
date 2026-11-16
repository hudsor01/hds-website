import { describe, expect, it } from 'bun:test'
import { TOOLS } from '@/app/(public)/tools/tools-data'
import sitemap from '@/app/sitemap'
import { getAllPosts } from '@/lib/blog'
import { SERVICES } from '@/lib/constants/services'
import { getAllLocationSlugs } from '@/lib/locations'
import { PAGE_DATES, pageDate } from '@/lib/sitemap/page-dates'

const SITE_URL = 'https://hudsondigitalsolutions.com'

// No module mocks: the sitemap wraps every DB-backed source
// (showcase/help-articles) in try/catch and falls back to an empty list, so
// without a database it still emits the static + registry-derived URLs we
// assert here. Blog URLs come from the compiled content/blog module.

describe('sitemap', () => {
	it('includes every public tool from the TOOLS registry', async () => {
		const urls = new Set((await sitemap()).map(e => e.url))
		for (const tool of TOOLS) {
			expect(urls.has(`${SITE_URL}${tool.href}`)).toBe(true)
		}
	})

	it('excludes the admin-only testimonial-collector tool', async () => {
		const urls = (await sitemap()).map(e => e.url)
		expect(urls.some(u => u.includes('/tools/testimonial-collector'))).toBe(
			false
		)
	})

	it('includes legal and landing routes that were previously missing', async () => {
		const urls = new Set((await sitemap()).map(e => e.url))
		expect(urls.has(`${SITE_URL}/terms`)).toBe(true)
		expect(urls.has(`${SITE_URL}/website-migration`)).toBe(true)
	})

	it('leaves out help pages that have no published articles', async () => {
		// No database here, so there are no help articles: the hub and every
		// category are empty pages and must not be listed.
		const urls = (await sitemap()).map(e => e.url)
		expect(urls.some(u => u.startsWith(`${SITE_URL}/help`))).toBe(false)
	})

	it('emits exactly one URL per published blog post', async () => {
		const blogUrls = (await sitemap())
			.map(e => e.url)
			.filter(u => /\/blog\/(?!tag\/|author\/)[^/]+$/.test(u))
		const posts = await getAllPosts()
		expect(blogUrls.sort()).toEqual(
			posts.map(p => `${SITE_URL}/blog/${p.slug}`).sort()
		)
	})

	it('never emits a duplicate URL', async () => {
		const urls = (await sitemap()).map(e => e.url)
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
