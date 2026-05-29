import { getPosts } from '@/lib/blog'
import { getShowcaseItems } from '@/lib/showcase'
import CommandPalette from './CommandPalette'
import { STATIC_PALETTE_ENTRIES } from './static-index'
import type { PaletteEntry } from './types'

/**
 * Server-side palette hydrator. Reads blog posts + showcase items
 * through their cached helpers (each wrapped in 'use cache' with
 * 'hours' lifetime) and passes a single merged entries array to the
 * client component. Both fetchers return `[]` on failure so the
 * palette degrades gracefully when the database is unreachable.
 */
export default async function CommandPaletteData() {
	const [postsResult, showcase] = await Promise.all([
		getPosts({ limit: 50 }),
		getShowcaseItems()
	])

	const blogEntries: PaletteEntry[] = postsResult.posts.map(post => ({
		id: `blog:${post.slug}`,
		label: post.title,
		description: post.excerpt || undefined,
		href: `/blog/${post.slug}`,
		group: 'Blog',
		keywords: post.tags.map(t => t.name)
	}))

	const showcaseEntries: PaletteEntry[] = showcase.map(item => ({
		id: `showcase:${item.slug}`,
		label: item.title,
		href: `/showcase/${item.slug}`,
		group: 'Showcase'
	}))

	const entries: PaletteEntry[] = [
		...STATIC_PALETTE_ENTRIES,
		...blogEntries,
		...showcaseEntries
	]

	return <CommandPalette entries={entries} />
}
