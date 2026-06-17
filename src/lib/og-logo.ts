import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The brand logo as a base64 PNG data URL, for use inside next/og
 * ImageResponse (Satori), where next/image is unavailable. Read once at module
 * load, so any route importing it must use the Node.js runtime (not edge).
 */
export const LOGO_DATA_URL = `data:image/png;base64,${readFileSync(
	join(process.cwd(), 'public/hds-logo-og.png')
).toString('base64')}`
