/**
 * The bounded retry transport shared by the token call (auth.ts) and the
 * Search Console calls (client.ts): Retry-After parsing, JSON body reading
 * and the attempt loop. Single definition (D7).
 */
import { BASE_BACKOFF_MS, MAX_ATTEMPTS, MAX_RETRY_AFTER_MS } from './config'
import type { Clock, FetchFn } from './types'

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

/** Body text parsed as JSON; undefined when unreadable or not JSON. */
export async function readJson(res: Response): Promise<unknown> {
	let text: string
	try {
		text = await res.text()
	} catch {
		return undefined
	}
	try {
		return JSON.parse(text)
	} catch {
		return undefined
	}
}

/**
 * What the caller makes of one HTTP response: a final value, or retry. A
 * failure that must not retry is thrown from the callback instead.
 */
export type AttemptVerdict<T> = { done: true; value: T } | { done: false }

/** The loop result: the value, or the last failure after MAX_ATTEMPTS. */
export type RetryResult<T> =
	| { ok: true; value: T }
	| { ok: false; status: number | null; body: unknown }

/**
 * Sends the request up to MAX_ATTEMPTS times. Network errors always retry;
 * a response retries only when onResponse returns done: false. Waits use
 * Retry-After or 1 s, 2 s backoff on the injected clock. status null in the
 * failure means the last attempt failed with a network error.
 */
export async function sendWithRetry<T>(
	deps: { fetchFn: FetchFn; clock: Clock },
	url: string,
	init: RequestInit,
	onResponse: (res: Response, body: unknown) => AttemptVerdict<T>
): Promise<RetryResult<T>> {
	let lastStatus: number | null = null
	let lastBody: unknown

	for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
		let res: Response | undefined
		try {
			res = await deps.fetchFn(url, init)
		} catch {
			res = undefined
		}

		let waitMs: number | undefined
		if (res === undefined) {
			lastStatus = null
			lastBody = undefined
		} else {
			const body = await readJson(res)
			const verdict = onResponse(res, body)
			if (verdict.done) {
				return { ok: true, value: verdict.value }
			}
			lastStatus = res.status
			lastBody = body
			waitMs = retryAfterMs(res.headers.get('retry-after'), deps.clock.now())
		}

		if (attempt < MAX_ATTEMPTS) {
			await deps.clock.sleep(waitMs ?? BASE_BACKOFF_MS * 2 ** (attempt - 1))
		}
	}

	return { ok: false, status: lastStatus, body: lastBody }
}
