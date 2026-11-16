import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo-config'

/**
 * Paths no crawler needs. `/_next/` is deliberately NOT here: Google
 * renders pages with their CSS and JS, and blocking the build assets
 * leaves it judging a broken, unstyled page.
 */
const DISALLOW = ['/api/', '/admin/']

/**
 * AI search and answer-engine crawlers, allowed by name. The wildcard
 * group already lets them in; naming them states the policy outright, and
 * a crawler that matches a named group obeys only that group, so each one
 * gets the same disallow list. Sources: each vendor's published crawler
 * documentation.
 */
const AI_USER_AGENTS = [
	'GPTBot',
	'OAI-SearchBot',
	'ChatGPT-User',
	'ClaudeBot',
	'Claude-User',
	'Claude-SearchBot',
	'PerplexityBot',
	'Perplexity-User',
	'Google-Extended',
	'Applebot-Extended',
	'Amazonbot',
	'CCBot'
] as const

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{ userAgent: '*', allow: '/', disallow: DISALLOW },
			{ userAgent: [...AI_USER_AGENTS], allow: '/', disallow: DISALLOW }
		],
		sitemap: `${SITE_URL}/sitemap.xml`
	}
}
