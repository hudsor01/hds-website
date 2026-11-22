/**
 * /favicon.ico is requested by browsers and crawlers by default; Crawl stats
 * showed it as a 404. The file is an ICO wrapping the 32x32 PNG from icon.tsx.
 */
import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'

describe('src/app/favicon.ico', () => {
	const ico = readFileSync('src/app/favicon.ico')

	it('is a single-image ICO', () => {
		expect(ico.readUInt16LE(0)).toBe(0)
		expect(ico.readUInt16LE(2)).toBe(1)
		expect(ico.readUInt16LE(4)).toBe(1)
	})

	it('embeds a 32x32 PNG at the declared offset', () => {
		expect(ico.readUInt8(6)).toBe(32)
		expect(ico.readUInt8(7)).toBe(32)
		const size = ico.readUInt32LE(14)
		const offset = ico.readUInt32LE(18)
		expect(offset + size).toBe(ico.length)
		const png = ico.subarray(offset)
		expect(png.subarray(1, 4).toString('ascii')).toBe('PNG')
		expect(png.readUInt32BE(16)).toBe(32)
		expect(png.readUInt32BE(20)).toBe(32)
	})
})
