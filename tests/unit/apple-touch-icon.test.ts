/**
 * iOS and some crawlers request /apple-touch-icon.png directly without
 * reading the head, and it was a 404 (QA-12). public/apple-touch-icon.png is
 * a static 180x180 opaque PNG of the same design as src/app/apple-icon.tsx.
 */
import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'

const PNG_SIGNATURE = Buffer.from([
	0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
])
// IHDR color types without an alpha channel: grayscale, truecolor, palette.
const OPAQUE_COLOR_TYPES = [0, 2, 3]

describe('public/apple-touch-icon.png', () => {
	const png = readFileSync('public/apple-touch-icon.png')

	it('is a PNG', () => {
		expect(png.subarray(0, 8).equals(PNG_SIGNATURE)).toBe(true)
		expect(png.subarray(12, 16).toString('ascii')).toBe('IHDR')
	})

	it('is 180x180 with no alpha channel', () => {
		expect(png.readUInt32BE(16)).toBe(180)
		expect(png.readUInt32BE(20)).toBe(180)
		expect(OPAQUE_COLOR_TYPES).toContain(png.readUInt8(25))
		expect(png.includes(Buffer.from('tRNS'))).toBe(false)
	})
})
