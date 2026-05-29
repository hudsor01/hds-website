/**
 * Lock the static palette index contract:
 *
 *   - ids are unique (cmdk uses value-based deduping, but stable keys
 *     prevent React reconciler churn when re-rendering).
 *   - every entry resolves to an in-app route (`/...`), never an
 *     external URL or anchor — the palette routes via Next.js's
 *     useRouter and would not handle protocols.
 *   - labels and descriptions never contain em-dash or en-dash, which
 *     CLAUDE.md forbids in user-facing strings.
 *   - every TOOLS entry from src/app/(public)/tools/tools-data.ts has
 *     a corresponding palette entry, so adding a tool surfaces it in
 *     the palette automatically. Audit #263.
 */

import { describe, expect, test } from 'bun:test'

import { TOOLS } from '@/app/(public)/tools/tools-data'
import { STATIC_PALETTE_ENTRIES } from '@/components/cmdk/static-index'

const EM_DASH = String.fromCharCode(0x2014)
const EN_DASH = String.fromCharCode(0x2013)

describe('STATIC_PALETTE_ENTRIES', () => {
	test('every id is unique', () => {
		const ids = STATIC_PALETTE_ENTRIES.map(e => e.id)
		const unique = new Set(ids)
		expect(unique.size).toBe(ids.length)
	})

	test('every href starts with `/`', () => {
		for (const entry of STATIC_PALETTE_ENTRIES) {
			expect(entry.href.startsWith('/')).toBe(true)
		}
	})

	test('no em-dash or en-dash in labels or descriptions', () => {
		for (const entry of STATIC_PALETTE_ENTRIES) {
			const corpus = `${entry.label} ${entry.description ?? ''}`
			expect(corpus.includes(EM_DASH)).toBe(false)
			expect(corpus.includes(EN_DASH)).toBe(false)
		}
	})

	test('every TOOLS entry is represented exactly once', () => {
		const toolHrefs = TOOLS.map(t => t.href).sort()
		const palettedToolHrefs = STATIC_PALETTE_ENTRIES.filter(
			e => e.group === 'Tools'
		)
			.map(e => e.href)
			.sort()
		expect(palettedToolHrefs).toEqual(toolHrefs)
	})

	test('group assignments only use the canonical four groups', () => {
		const allowed = new Set(['Tools', 'Pages', 'Blog', 'Showcase'])
		for (const entry of STATIC_PALETTE_ENTRIES) {
			expect(allowed.has(entry.group)).toBe(true)
		}
	})
})
