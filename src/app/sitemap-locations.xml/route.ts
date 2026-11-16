// The locations section sitemap; built in src/lib/sitemap.
import { sectionSitemapResponse } from '@/lib/sitemap/routes'

export function GET() {
	return sectionSitemapResponse('locations')
}
