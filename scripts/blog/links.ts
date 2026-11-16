/**
 * Inbound link report (LINK-01): for every published post, the qualifying
 * links from other posts (see lib.ts qualifies), whether a service page shows
 * it as a related-post card and any hand-written links to it from the service
 * and location pages. Report only: it never fails. Enforcement lives in
 * blog:build and blog:validate.
 *   bun run blog:links                 # table on stdout, summary on stderr
 *   bun run blog:links > file.md       # captures only the report
 * No DB / network needed.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { SERVICES } from '@/lib/constants/services'
import { compilePosts, loadPosts } from './build'
import { isLive, postSlugFromHref, qualifyingInbound } from './lib'

/** Mirrors RELATED_POST_LIMIT in src/app/(public)/services/[slug]/page.tsx. */
const SERVICE_CARD_LIMIT = 3
const SERVICE_SOURCES = [
	'src/app/(public)/services',
	'src/lib/constants/services.ts'
]
const LOCATION_SOURCES = ['src/lib/locations', 'src/app/(public)/locations']
const BLOG_HREF_RE = /\/blog\/[^\s"'`)<>]+/g
const HEADER = [
	'slug',
	'status',
	'inbound',
	'state',
	'sources',
	'service card',
	'service links',
	'location links'
]

function table(header: string[], rows: string[][]): string[] {
	return [
		`| ${header.join(' | ')} |`,
		`| ${header.map(() => '---').join(' | ')} |`,
		...rows.map(r => `| ${r.join(' | ')} |`)
	]
}

/** Every .ts/.tsx file at or under `path` (a file or a directory). */
function sourceFiles(path: string): string[] {
	if (!statSync(path).isDirectory()) {
		return /\.tsx?$/.test(path) ? [path] : []
	}
	return readdirSync(path)
		.sort()
		.flatMap(entry => sourceFiles(join(path, entry)))
}

/** Post slug -> number of hand-written /blog/<slug> strings in the sources. */
function pageLinks(roots: string[]): Map<string, number> {
	const counts = new Map<string, number>()
	for (const file of roots.flatMap(root =>
		sourceFiles(join(process.cwd(), root))
	)) {
		for (const m of readFileSync(file, 'utf8').matchAll(BLOG_HREF_RE)) {
			const slug = postSlugFromHref(m[0])
			if (slug) {
				counts.set(slug, (counts.get(slug) ?? 0) + 1)
			}
		}
	}
	return counts
}

function status(inbound: number): 'orphan' | 'below' | 'ok' {
	if (inbound === 0) {
		return 'orphan'
	}
	return inbound === 1 ? 'below' : 'ok'
}

function main(): void {
	const now = new Date()
	const posts = loadPosts()
	const inbound = qualifyingInbound(posts, now)
	const compiled = compilePosts(undefined, now)

	// Post slug -> the service pages that show it as a related-post card.
	const serviceCards = new Map<string, string[]>()
	for (const service of SERVICES) {
		const cards = compiled
			.filter(p => p.tagSlugs.includes(service.blogTag))
			.slice(0, SERVICE_CARD_LIMIT)
		for (const p of cards) {
			serviceCards.set(p.slug, [
				...(serviceCards.get(p.slug) ?? []),
				service.slug
			])
		}
	}
	const serviceLinks = pageLinks(SERVICE_SOURCES)
	const locationLinks = pageLinks(LOCATION_SOURCES)

	const published = posts
		.filter(p => p.data.published === true)
		.map(p => ({
			post: p,
			live: isLive(p.data, now),
			sources: inbound.get(p.slug) ?? []
		}))
		.sort(
			(a, b) =>
				a.sources.length - b.sources.length ||
				a.post.slug.localeCompare(b.post.slug)
		)

	const rows = published.map(({ post, live, sources }) => [
		post.slug,
		status(sources.length),
		String(sources.length),
		live ? 'live' : `held until ${post.data.publishedAt}`,
		sources.length > 0 ? sources.join(', ') : '-',
		serviceCards.get(post.slug)?.join(', ') ?? '-',
		String(serviceLinks.get(post.slug) ?? 0),
		String(locationLinks.get(post.slug) ?? 0)
	])

	const bucket = (n: number, live?: boolean): number =>
		published.filter(
			p =>
				(n === 3 ? p.sources.length >= 3 : p.sources.length === n) &&
				(live === undefined || p.live === live)
		).length

	const lines = [
		...table(HEADER, rows),
		'',
		`Histogram (qualifying inbound, published posts): 0: ${bucket(0)}, 1: ${bucket(1)}, 2: ${bucket(2)}, 3+: ${bucket(3)} (live: 0: ${bucket(0, true)}, 1: ${bucket(1, true)}; held: 0: ${bucket(0, false)}, 1: ${bucket(1, false)})`,
		'RelatedPosts, tag pages, the blog index and the sitemap are automatic surfaces on every live post and do not count toward the threshold.'
	]
	process.stdout.write(`${lines.join('\n')}\n`)

	const count = (s: string): number => rows.filter(r => r[1] === s).length
	console.warn(
		`blog:links - ${published.length} published posts: ${count('orphan')} orphan, ${count('below')} below, ${count('ok')} ok`
	)
}

if (import.meta.main) {
	main()
}
