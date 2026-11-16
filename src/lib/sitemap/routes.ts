/**
 * Responses for the sitemap index (/sitemap.xml) and its four section
 * children (/sitemap-<section>.xml).
 *
 * The children sit at the site root because a sitemap may only list URLs
 * under its own directory (sitemaps.org protocol), and Next 16's
 * generateSitemaps only serves /sitemap/<id>.xml and never an index. The
 * index stays at /sitemap.xml so the existing Search Console submission and
 * robots.txt keep working with no redirect.
 *
 * 'use cache' is not allowed in a route handler body, so caching stays in
 * the DB helpers loadSitemapSources() calls (cacheLife('hours')): the routes
 * prerender at build and revalidate hourly.
 */

import { SITE_URL } from '@/lib/seo-config'
import {
	buildSitemapEntries,
	loadSitemapSources,
	SITEMAP_SECTIONS,
	type SitemapEntry,
	type SitemapSection
} from './entries'
import { renderSitemapIndex, renderUrlset, xmlResponse } from './xml'

export async function sectionSitemapResponse(
	section: SitemapSection
): Promise<Response> {
	const entries = buildSitemapEntries(await loadSitemapSources())
	return xmlResponse(renderUrlset(sectionEntries(entries, section)))
}

export async function sitemapIndexResponse(): Promise<Response> {
	const entries = buildSitemapEntries(await loadSitemapSources())
	const children = SITEMAP_SECTIONS.map(section => ({
		loc: `${SITE_URL}/sitemap-${section}.xml`,
		lastModified: newestLastModified(sectionEntries(entries, section))
	}))
	return xmlResponse(renderSitemapIndex(children))
}

/** Every section always has entries; an empty one is a builder bug. */
function sectionEntries(
	entries: readonly SitemapEntry[],
	section: SitemapSection
): SitemapEntry[] {
	const matching = entries.filter(entry => entry.section === section)
	if (matching.length === 0) {
		throw new Error(`Sitemap section "${section}" has no entries`)
	}
	return matching
}

function newestLastModified(entries: readonly SitemapEntry[]): Date {
	return entries.reduce((newest, entry) =>
		entry.lastModified.getTime() > newest.lastModified.getTime()
			? entry
			: newest
	).lastModified
}
