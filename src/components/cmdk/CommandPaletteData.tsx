import { getPostIndex } from '@/lib/blog'
import { getShowcasePaletteItems } from '@/lib/showcase'
import CommandPalette from './CommandPalette'
import { STATIC_PALETTE_ENTRIES } from './static-index'
import type { PaletteEntry } from './types'

/**
 * Server-side palette hydrator, mounted on every public route.
 *
 * Blog entries come from the build-time post index (no I/O). Showcase
 * entries come from a 'use cache: remote' query shared across server
 * instances, so bot traffic on any public page does not wake the database.
 * Only the fields the client renders and searches are passed down.
 */
export default async function CommandPaletteData() {
	const [posts, showcase] = await Promise.all([
		getPostIndex(50),
		getShowcasePaletteItems()
	])

	const blogEntries: PaletteEntry[] = posts.map(post => ({
		id: `blog:${post.slug}`,
		label: post.title,
		description: post.excerpt || undefined,
		href: `/blog/${post.slug}`,
		group: 'Blog',
		keywords: post.tagNames
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
