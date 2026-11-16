// Sitemap index over the four section children; built in src/lib/sitemap.
import { sitemapIndexResponse } from '@/lib/sitemap/routes'

export function GET() {
	return sitemapIndexResponse()
}
