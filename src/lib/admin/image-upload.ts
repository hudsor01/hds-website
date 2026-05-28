/**
 * Client-side pre-upload validation for admin image fields.
 *
 * Adapted from Vercel's `blob-starter` example
 * (https://github.com/vercel/examples/tree/main/storage/blob-starter)
 * which checks file type and size BEFORE invoking the upload SDK.
 * The server still enforces the same constraints via `handleUpload`'s
 * `allowedContentTypes` + `maximumSizeInBytes` (see
 * `src/app/api/admin/images/upload/route.ts`), but client-side
 * validation:
 *
 *   - Catches drag-drop bypass (the `accept` attribute on
 *     `<input type="file">` only filters the native picker; a
 *     drag-and-dropped non-image still reaches `onChange`).
 *   - Gives the operator instant feedback instead of waiting for the
 *     PUT to round-trip and the server to reject.
 *   - Saves an unnecessary token-issue + PUT pair when the file is
 *     trivially invalid.
 *
 * Constants are exported so the field components can render the same
 * 8 MB / accepted-MIME copy the validator uses.
 */

export const ACCEPTED_IMAGE_TYPES = [
	'image/png',
	'image/jpeg',
	'image/webp',
	'image/gif',
	'image/avif'
] as const

export const ACCEPT_ATTRIBUTE = ACCEPTED_IMAGE_TYPES.join(',')

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024

/**
 * Format a byte count as a human-readable string (e.g. "8 MB").
 * Adapted from the blob-starter `formatBytes` utility. Compact form
 * because admin error messages only need MB / KB.
 */
export function formatBytes(bytes: number, decimals = 1): string {
	if (bytes === 0) {
		return '0 bytes'
	}
	const k = 1024
	const dm = decimals < 0 ? 0 : decimals
	const sizes = ['bytes', 'KB', 'MB', 'GB'] as const
	const i = Math.min(
		Math.floor(Math.log(bytes) / Math.log(k)),
		sizes.length - 1
	)
	const value = bytes / k ** i
	const rounded = Number.parseFloat(value.toFixed(dm))
	return `${rounded} ${sizes[i]}`
}

export interface ImageValidationError {
	reason: 'wrong-type' | 'too-large'
	message: string
}

/**
 * Validate a File against the admin image upload constraints.
 * Returns `null` when the file is acceptable, or an error object the
 * caller can surface in the field.
 */
export function validateImageFile(file: File): ImageValidationError | null {
	const isAcceptedType = (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(
		file.type
	)
	if (!isAcceptedType) {
		return {
			reason: 'wrong-type',
			message: `Only images are accepted (PNG, JPG, WEBP, GIF, AVIF). Got "${file.type || 'unknown'}".`
		}
	}
	if (file.size > MAX_IMAGE_BYTES) {
		return {
			reason: 'too-large',
			message: `File is too large (${formatBytes(file.size)}). Max ${formatBytes(MAX_IMAGE_BYTES)}.`
		}
	}
	return null
}
