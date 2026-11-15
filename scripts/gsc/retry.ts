/**
 * Retry-After parsing shared by the token call (auth.ts) and the Search
 * Console calls (client.ts). Single definition (D7).
 */
import { MAX_RETRY_AFTER_MS } from './config'

/**
 * Milliseconds to wait from a Retry-After header: integer seconds or an
 * HTTP-date, capped at MAX_RETRY_AFTER_MS. Undefined when absent, unparsable
 * or in the past, so the caller falls back to exponential backoff.
 */
export function retryAfterMs(
	header: string | null,
	nowMs: number
): number | undefined {
	if (header === null) {
		return undefined
	}
	const value = header.trim()
	if (/^\d+$/.test(value)) {
		return Math.min(Number(value) * 1000, MAX_RETRY_AFTER_MS)
	}
	const at = Date.parse(value)
	if (!Number.isFinite(at)) {
		return undefined
	}
	const delta = at - nowMs
	if (delta < 0) {
		return undefined
	}
	return Math.min(delta, MAX_RETRY_AFTER_MS)
}
