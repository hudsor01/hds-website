/**
 * GET /llms.txt: the site map for AI assistants (see src/lib/llms-txt.ts).
 *
 * Reads only build-time data (compiled blog posts, the tools registry and
 * the services list), so Next prerenders it at build like robots.txt and
 * the sitemap. A newly published post reaches it on the next deploy, the
 * same deploy that publishes the post.
 */

import { TOOLS } from '@/app/(public)/tools/tools-data'
import { getAllPosts } from '@/lib/blog'
import { SERVICES } from '@/lib/constants/services'
import { buildLlmsTxt } from '@/lib/llms-txt'

export async function GET() {
	const posts = await getAllPosts()
	const body = buildLlmsTxt({
		services: SERVICES,
		tools: TOOLS.map(({ title, href, description }) => ({
			title,
			href,
			description
		})),
		posts: posts.map(({ title, slug, excerpt }) => ({
			title,
			href: `/blog/${slug}`,
			description: excerpt
		}))
	})
	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	})
}
