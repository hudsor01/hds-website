/**
 * CommandPaletteData hands the client palette a minimal projection: blog
 * entries come from the compiled post index (no article bodies) and showcase
 * entries degrade to none without a database (tests run on the mock db).
 */
import { describe, expect, test } from 'bun:test'
import type { ReactElement } from 'react'
import CommandPaletteData from '@/components/cmdk/CommandPaletteData'
import type { PaletteEntry } from '@/components/cmdk/types'
import { getPostIndex } from '@/lib/blog'

describe('CommandPaletteData', () => {
	test('passes blog entries without article content', async () => {
		const element = (await CommandPaletteData()) as ReactElement<{
			entries: PaletteEntry[]
		}>
		const blog = element.props.entries.filter(e => e.group === 'Blog')
		const index = await getPostIndex(50)

		expect(blog.map(e => e.href)).toEqual(index.map(p => `/blog/${p.slug}`))
		for (const entry of blog) {
			expect(Object.keys(entry).sort()).toEqual(
				['description', 'group', 'href', 'id', 'keywords', 'label'].filter(
					k => k !== 'description' || entry.description !== undefined
				)
			)
			expect(JSON.stringify(entry)).not.toContain('<p>')
		}
	})

	test('renders no showcase entries when the database is unavailable', async () => {
		const element = (await CommandPaletteData()) as ReactElement<{
			entries: PaletteEntry[]
		}>
		expect(element.props.entries.some(e => e.group === 'Showcase')).toBe(false)
		expect(element.props.entries.some(e => e.group === 'Tools')).toBe(true)
	})
})
