/**
 * One-off: emit JSON of every PUBLISHED post (slug, title, excerpt, keyword,
 * tags, pillar) for the social-caption workflow. Read-only.
 */
import { listPostFiles, parsePost } from './lib'

const SITE = 'https://hudsondigitalsolutions.com'

const posts = listPostFiles()
	.map(parsePost)
	.filter(p => p.data.published)
	.map(p => ({
		slug: p.slug,
		title: p.data.title,
		excerpt: p.data.excerpt ?? '',
		keyword: p.data.targetKeyword ?? '',
		tags: p.data.tags ?? [],
		pillar: p.data.pillar ?? 0,
		url: `${SITE}/blog/${p.slug}`
	}))
	.sort((a, b) => a.slug.localeCompare(b.slug))

process.stdout.write(`${JSON.stringify(posts)}\n`)
