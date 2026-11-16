/**
 * The bounded retry transport shared by the token call (auth.ts) and the
 * Search Console calls (client.ts): Retry-After parsing, JSON body reading,
 * the per-request timeout, the run budget and the attempt loop. Single
 * definition (D7, WR-01).
 */
import {
	BASE_BACKOFF_MS,
	MAX_ATTEMPTS,
	MAX_RETRY_AFTER_MS,
	REQUEST_TIMEOUT_MS,
	RUN_BUDGET_MS
} from './config'
import { GscApiError } from './errors'
import type { Transport } from './types'

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

/** Body text parsed as JSON; undefined when it is not JSON. */
function parseJson(text: string): unknown {
	try {
		return JSON.parse(text)
	} catch {
		return undefined
	}
}

/** The one line printed when the run hits RUN_BUDGET_MS (WR-01). */
export const BUDGET_MESSAGE = `Run stopped at its ${RUN_BUDGET_MS / 60_000} minute time budget because Google is slow or throttling requests. The issue was left unchanged. Re-run the workflow later.`

function budgetError(): GscApiError {
	return new GscApiError(BUDGET_MESSAGE, 'budget', null)
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
 * Sends the request up to MAX_ATTEMPTS times. Each attempt is aborted after
 * REQUEST_TIMEOUT_MS. A network error, a timeout or an unreadable body
 * always retries; a response retries only when onResponse returns
 * done: false. Waits use Retry-After or 1 s, 2 s backoff on the injected
 * clock. No attempt starts and no wait begins past deps.deadlineMs: that
 * throws the budget error instead. status null in the failure means the last
 * attempt failed with a network error.
 */
export async function sendWithRetry<T>(
	deps: Transport,
	url: string,
	init: RequestInit,
	onResponse: (res: Response, body: unknown) => AttemptVerdict<T>
): Promise<RetryResult<T>> {
	let lastStatus: number | null = null
	let lastBody: unknown

	for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
		if (deps.clock.now() >= deps.deadlineMs) {
			throw budgetError()
		}

		let res: Response | undefined
		let text = ''
		try {
			res = await deps.fetchFn(url, {
				...init,
				signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
			})
			text = await res.text()
		} catch {
			res = undefined
		}

		let waitMs: number | undefined
		if (res === undefined) {
			lastStatus = null
			lastBody = undefined
		} else {
			const body = parseJson(text)
			const verdict = onResponse(res, body)
			if (verdict.done) {
				return { ok: true, value: verdict.value }
			}
			lastStatus = res.status
			lastBody = body
			waitMs = retryAfterMs(res.headers.get('retry-after'), deps.clock.now())
		}

		if (attempt < MAX_ATTEMPTS) {
			const delay = waitMs ?? BASE_BACKOFF_MS * 2 ** (attempt - 1)
			if (deps.clock.now() + delay >= deps.deadlineMs) {
				throw budgetError()
			}
			await deps.clock.sleep(delay)
		}
	}

	return { ok: false, status: lastStatus, body: lastBody }
}
