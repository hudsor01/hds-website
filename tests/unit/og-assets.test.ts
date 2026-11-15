/**
 * Next imports the icon modules while resolving every page's metadata, and
 * a Vercel page function does not ship public/. A module-scope readFileSync
 * in og-logo / og-fonts therefore threw ENOENT on every on-demand page
 * render (React #441, the error screen, a soft 404 in Search Console).
 * Importing these modules must never touch the filesystem.
 */

import { afterEach, describe, expect, test } from 'bun:test'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const repoRoot = process.cwd()

afterEach(() => {
	process.chdir(repoRoot)
})

describe('next/og assets', () => {
	test('importing the loaders reads nothing from disk', async () => {
		process.chdir(mkdtempSync(join(tmpdir(), 'no-public-')))
		const logo = await import('@/lib/og-logo')
		const fonts = await import('@/lib/og-fonts')
		expect(typeof logo.getLogoDataUrl).toBe('function')
		expect(typeof fonts.getOgFonts).toBe('function')
	})

	test('the loaders return the assets when an image renders', async () => {
		const { getLogoDataUrl } = await import('@/lib/og-logo')
		const { getOgFonts } = await import('@/lib/og-fonts')
		expect(getLogoDataUrl()).toStartWith('data:image/png;base64,')
		expect(getOgFonts().map(font => font.weight)).toEqual([600, 700])
	})
})
