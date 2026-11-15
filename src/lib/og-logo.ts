import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The brand logo as a base64 PNG data URL, for use inside next/og
 * ImageResponse (Satori), where next/image is unavailable. Any importing
 * route must use the Node.js runtime (not edge).
 *
 * Read lazily, on the first image render, never at module load: Next
 * imports the icon modules while resolving every page's metadata, and a
 * page function's file trace does not include public/. A module-scope read
 * threw ENOENT on Vercel for every on-demand page render (React #441, the
 * "Something went wrong" screen, a soft 404 in Search Console).
 * next.config.ts also traces the file into every function.
 */
let logoDataUrl: string | undefined

export function getLogoDataUrl(): string {
	logoDataUrl ??= `data:image/png;base64,${readFileSync(
		join(process.cwd(), 'public/hds-logo-og.png')
	).toString('base64')}`
	return logoDataUrl
}
