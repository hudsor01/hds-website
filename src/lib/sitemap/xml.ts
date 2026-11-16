/**
 * Sitemap XML (sitemaps.org protocol 0.9: https://www.sitemaps.org/protocol.html).
 *
 * Next 16's metadata sitemap serializer only serves /sitemap.xml or
 * /sitemap/<id>.xml, cannot emit a <sitemapindex>, and writes <loc>
 * unescaped. The section children must live at the site root (a sitemap only
 * covers URLs under its own directory), so the routes render XML here: every
 * <loc> goes through escapeXml, and both document types share one namespace.
 */

import { escapeXml } from '@/lib/xml-escape'
import type { SitemapEntry } from './entries'

const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>'
const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9'

export function renderUrlset(entries: readonly SitemapEntry[]): string {
	const urls = entries.map(
		entry =>
			`<url><loc>${escapeXml(entry.url)}</loc><lastmod>${entry.lastModified.toISOString()}</lastmod><changefreq>${entry.changeFrequency}</changefreq><priority>${entry.priority}</priority></url>`
	)
	return `${XML_DECLARATION}\n<urlset xmlns="${SITEMAP_NS}">\n${urls.join('\n')}\n</urlset>\n`
}

export function renderSitemapIndex(
	children: ReadonlyArray<{ loc: string; lastModified: Date }>
): string {
	const sitemaps = children.map(
		child =>
			`<sitemap><loc>${escapeXml(child.loc)}</loc><lastmod>${child.lastModified.toISOString()}</lastmod></sitemap>`
	)
	return `${XML_DECLARATION}\n<sitemapindex xmlns="${SITEMAP_NS}">\n${sitemaps.join('\n')}\n</sitemapindex>\n`
}

/** No Cache-Control here: Next's route caching owns it. */
export function xmlResponse(body: string): Response {
	return new Response(body, {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' }
	})
}
