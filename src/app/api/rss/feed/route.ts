/**
 * RSS 2.0 Feed Route
 * Serves an RSS feed of published blog posts.
 * Rewrites in vercel.json map /blog/rss, /rss, /feed, /blog/feed here.
 */

import { NextResponse } from 'next/server'
import { getPosts } from '@/lib/blog'
import { logger } from '@/lib/logger'

const SITE_URL = 'https://hudsondigitalsolutions.com'
const FEED_TITLE = 'Hudson Digital Solutions Blog'
const FEED_DESCRIPTION =
	'Web development insights and digital strategy from Hudson Digital Solutions'

export async function GET() {
	try {
		const { posts } = await getPosts({ limit: 20 })

		const items = posts
			.slice(0, 20)
			.map(
				post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt ?? ''}]]></description>
      <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
    </item>`
			)
			.join('')

		const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${FEED_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>${FEED_DESCRIPTION}</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/rss" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

		return new NextResponse(rss, {
			headers: {
				'Content-Type': 'application/rss+xml; charset=utf-8',
				'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
			}
		})
	} catch (error) {
		logger.error('RSS feed generation failed', error)
		return NextResponse.json({ error: 'Feed unavailable' }, { status: 500 })
	}
}
