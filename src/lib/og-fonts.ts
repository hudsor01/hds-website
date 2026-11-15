import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Hanken Grotesk (the site display font) as WOFF buffers for next/og
 * ImageResponse, so the social card title matches the website typography.
 * Satori supports woff/ttf/otf (NOT woff2). Any importing route must use
 * the Node.js runtime.
 *
 * Read lazily on first use for the same reason as getLogoDataUrl in
 * ./og-logo.ts: a module-scope read runs wherever the module is imported,
 * including page functions that do not ship public/.
 */
interface OgFont {
	name: string
	data: Buffer
	weight: 600 | 700
	style: 'normal'
}

let fonts: OgFont[] | undefined

export function getOgFonts(): OgFont[] {
	fonts ??= ([600, 700] as const).map(weight => ({
		name: 'Hanken Grotesk',
		data: readFileSync(
			join(process.cwd(), `public/fonts/hanken-grotesk-${weight}.woff`)
		),
		weight,
		style: 'normal' as const
	}))
	return fonts
}
