/**
 * Phase 08-followup pre-upload validator.
 *
 * Pins the constants and behavior the field components depend on so a
 * future edit cannot silently widen the accept list or drop a size
 * check. Drag-drop bypasses the `<input type="file" accept="...">`
 * attribute, so this validator is the only client-side guard against
 * an operator dragging a multi-gigabyte video into the field.
 */
import { describe, expect, it } from 'bun:test'
import {
	ACCEPT_ATTRIBUTE,
	ACCEPTED_IMAGE_TYPES,
	formatBytes,
	MAX_IMAGE_BYTES,
	validateImageFile
} from '@/lib/admin/image-upload'

function makeFile(name: string, type: string, sizeBytes: number): File {
	// Bun's `File` lets us declare the reported size via the underlying
	// blob bytes. Using a single-character string per byte keeps the
	// allocation cheap up to ~10 MB.
	const blob = new Blob([new Uint8Array(sizeBytes)], { type })
	return new File([blob], name, { type })
}

describe('image-upload constants', () => {
	it('accepts exactly the 5 image MIME types Phase 08 declared', () => {
		expect(ACCEPTED_IMAGE_TYPES).toEqual([
			'image/png',
			'image/jpeg',
			'image/webp',
			'image/gif',
			'image/avif'
		])
	})

	it('ACCEPT_ATTRIBUTE joins them with commas (matches <input accept> grammar)', () => {
		expect(ACCEPT_ATTRIBUTE).toBe(
			'image/png,image/jpeg,image/webp,image/gif,image/avif'
		)
	})

	it('caps file size at exactly 8 MB', () => {
		expect(MAX_IMAGE_BYTES).toBe(8 * 1024 * 1024)
	})
})

describe('formatBytes', () => {
	it('formats 0 bytes', () => {
		expect(formatBytes(0)).toBe('0 bytes')
	})

	it('formats bytes < 1 KB', () => {
		expect(formatBytes(500)).toBe('500 bytes')
	})

	it('formats KB', () => {
		expect(formatBytes(2048)).toBe('2 KB')
	})

	it('formats MB with one decimal by default', () => {
		expect(formatBytes(8 * 1024 * 1024)).toBe('8 MB')
		expect(formatBytes(1.5 * 1024 * 1024)).toBe('1.5 MB')
	})
})

describe('validateImageFile', () => {
	it('accepts a small PNG', () => {
		const file = makeFile('a.png', 'image/png', 1024)
		expect(validateImageFile(file)).toBeNull()
	})

	it('accepts a JPEG at the exact byte limit', () => {
		const file = makeFile('a.jpg', 'image/jpeg', MAX_IMAGE_BYTES)
		expect(validateImageFile(file)).toBeNull()
	})

	it('rejects a non-image MIME (drag-drop bypass safe)', () => {
		const file = makeFile('a.pdf', 'application/pdf', 1024)
		const result = validateImageFile(file)
		expect(result?.reason).toBe('wrong-type')
		expect(result?.message).toContain('application/pdf')
	})

	it('rejects a missing MIME (empty type)', () => {
		const file = makeFile('a.bin', '', 1024)
		const result = validateImageFile(file)
		expect(result?.reason).toBe('wrong-type')
		expect(result?.message).toContain('unknown')
	})

	it('rejects an image over the size limit', () => {
		const file = makeFile('big.png', 'image/png', MAX_IMAGE_BYTES + 1)
		const result = validateImageFile(file)
		expect(result?.reason).toBe('too-large')
		expect(result?.message).toContain('Max')
		expect(result?.message).toContain('8 MB')
	})

	it('checks type BEFORE size (a 1 GB pdf reports wrong-type, not too-large)', () => {
		const file = makeFile('big.pdf', 'application/pdf', 1024 * 1024 * 1024)
		const result = validateImageFile(file)
		expect(result?.reason).toBe('wrong-type')
	})
})
