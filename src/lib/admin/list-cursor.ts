/**
 * Phase 10 admin-list cursor codec + SQL LIKE escape.
 *
 * Server-only: imported by `src/lib/admin/*-queries.ts`. Pure functions,
 * no DB / IO. The cursor format is `${direction}:${b64part1}.${b64part2}...`
 * where each ORDER BY tuple part is independently base64url-encoded and
 * joined with `.` (a character outside the base64url alphabet). Encoding
 * per-part is required because ISO timestamps contain `:` -- joining the
 * raw payload would round-trip ambiguously.
 *
 * decodeCursor never throws: malformed input returns null and the caller
 * treats it as "no cursor" (page 1). This keeps a hand-edited URL from
 * crashing the admin shell.
 */
import 'server-only'

export const PAGE_SIZE = 25

export type Direction = 'after' | 'before'

export type Cursor = {
	direction: Direction
	parts: string[]
}

const DIRECTION_SEPARATOR = ':'
const PART_SEPARATOR = '.'

function toBase64Url(input: string): string {
	return Buffer.from(input, 'utf8')
		.toString('base64')
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '')
}

function fromBase64Url(input: string): string | null {
	// Base64url uses only [A-Za-z0-9_-]; reject anything else outright so
	// a URL-injected value cannot slip past Buffer's lenient decoding.
	if (!/^[A-Za-z0-9_-]*$/.test(input)) {
		return null
	}
	const padded = input.replace(/-/g, '+').replace(/_/g, '/')
	const padLen = (4 - (padded.length % 4)) % 4
	try {
		return Buffer.from(padded + '='.repeat(padLen), 'base64').toString('utf8')
	} catch {
		return null
	}
}

function stringifyPart(part: string | number | Date): string {
	if (part instanceof Date) {
		return part.toISOString()
	}
	return String(part)
}

export function encodeCursor(
	direction: Direction,
	parts: (string | number | Date)[]
): string {
	const payload = parts.map(stringifyPart).map(toBase64Url).join(PART_SEPARATOR)
	return `${direction}${DIRECTION_SEPARATOR}${payload}`
}

export function decodeCursor(raw: string | undefined): Cursor | null {
	if (!raw) {
		return null
	}
	const idx = raw.indexOf(DIRECTION_SEPARATOR)
	if (idx < 0) {
		return null
	}
	const direction = raw.slice(0, idx)
	const payloadEncoded = raw.slice(idx + 1)
	if (direction !== 'after' && direction !== 'before') {
		return null
	}
	if (payloadEncoded.length === 0) {
		return null
	}
	const encodedParts = payloadEncoded.split(PART_SEPARATOR)
	const decoded: string[] = []
	for (const part of encodedParts) {
		if (part.length === 0) {
			return null
		}
		const value = fromBase64Url(part)
		if (value === null) {
			return null
		}
		decoded.push(value)
	}
	if (decoded.length === 0) {
		return null
	}
	return {
		direction,
		parts: decoded
	}
}

export function escapeLikePattern(q: string): string {
	// Order matters: escape backslash FIRST so the wildcard escapes below
	// do not get double-escaped on their own backslash prefix.
	return q
		.replaceAll('\\', '\\\\')
		.replaceAll('%', '\\%')
		.replaceAll('_', '\\_')
}

/**
 * Build a pagination href that carries the given cursor plus every
 * preservedParams entry (skipping empty-string values). Used by the 7
 * admin list pages to compose shadcn `<PaginationPrevious href=...>` /
 * `<PaginationNext href=...>` without each page repeating the same
 * URLSearchParams ceremony.
 */
export function buildPaginationHref(
	baseHref: string,
	cursor: string,
	preservedParams?: Record<string, string>
): string {
	const params = new URLSearchParams()
	params.set('cursor', cursor)
	if (preservedParams) {
		for (const [key, value] of Object.entries(preservedParams)) {
			if (value === '') {
				continue
			}
			params.set(key, value)
		}
	}
	return `${baseHref}?${params.toString()}`
}
