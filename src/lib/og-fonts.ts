import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Hanken Grotesk (the site display font) as WOFF buffers for next/og
 * ImageResponse, so the social card title matches the website typography.
 * Satori supports woff/ttf/otf (NOT woff2). Read once at module load with
 * literal paths so Next file-tracing bundles them into the serverless
 * function; any importing route must use the Node.js runtime.
 */
const hanken600 = readFileSync(
	join(process.cwd(), 'public/fonts/hanken-grotesk-600.woff')
)
const hanken700 = readFileSync(
	join(process.cwd(), 'public/fonts/hanken-grotesk-700.woff')
)

export const OG_FONTS = [
	{
		name: 'Hanken Grotesk',
		data: hanken600,
		weight: 600 as const,
		style: 'normal' as const
	},
	{
		name: 'Hanken Grotesk',
		data: hanken700,
		weight: 700 as const,
		style: 'normal' as const
	}
]
