/**
 * Client-side helper that lazily fetches a CSRF token from `/api/csrf` and
 * attaches it as `X-CSRF-Token` on the wrapped fetch call.
 *
 * Tokens last 1 hour (CSRF_SECRET HMAC w/ expiry). We cache the issued
 * token in module memory so repeated form submissions in the same
 * session don't make N round-trips. Concurrent calls with a cold cache
 * dedupe on a shared inflight promise — first arrival wins, others
 * await the same fetch. The retry-after-403 path uses the same
 * `requestFreshToken()` helper so two concurrent forms hitting a CSRF
 * rejection at the same time still only fire one refresh request.
 *
 * Retry-on-403 is narrowed: only "Invalid or missing CSRF token" body
 * triggers a token refresh + retry. Business-logic 403s (expired
 * unsubscribe link, already-submitted testimonial) bubble through as-is
 * so the caller can show a real message.
 */

let cachedToken: string | null = null
let inflight: Promise<string> | null = null

async function fetchTokenInner(): Promise<string> {
	const res = await fetch('/api/csrf', { credentials: 'same-origin' })
	if (!res.ok) {
		throw new Error('Could not get CSRF token')
	}
	const { token } = (await res.json()) as { token: string }
	cachedToken = token
	return token
}

/**
 * Issue a fresh CSRF token, deduping concurrent callers via a shared
 * promise. Used both by getToken() on cold cache and by the retry path
 * after a CSRF-specific 403 — the dedup matters in the retry case
 * because two forms can hit the rejection at the same moment.
 */
function requestFreshToken(): Promise<string> {
	if (inflight) {
		return inflight
	}
	inflight = (async () => {
		try {
			return await fetchTokenInner()
		} finally {
			inflight = null
		}
	})()
	return inflight
}

async function getToken(): Promise<string> {
	if (cachedToken) {
		return cachedToken
	}
	return requestFreshToken()
}

const CSRF_REJECTION_MESSAGE = 'Invalid or missing CSRF token'

/** Inspect a 403 body to decide whether the rejection is a CSRF failure
 *  (not an arbitrary business-logic 403). Reads via `.clone()` so the
 *  caller can still consume the original body. */
async function isCsrfRejection(response: Response): Promise<boolean> {
	if (response.status !== 403) {
		return false
	}
	try {
		const body = (await response.clone().json()) as { error?: string }
		return body?.error === CSRF_REJECTION_MESSAGE
	} catch {
		return false
	}
}

/**
 * Drop-in replacement for `fetch()` that adds an X-CSRF-Token header.
 * Only the URL + init form is supported — the call sites this module
 * replaces all use that shape.
 */
export async function csrfFetch(
	url: string,
	init: RequestInit = {}
): Promise<Response> {
	const headers = new Headers(init.headers ?? {})
	headers.set('X-CSRF-Token', await getToken())

	const response = await fetch(url, {
		...init,
		credentials: init.credentials ?? 'same-origin',
		headers
	})

	// Only refresh + retry on a CSRF-specific 403. Business-logic 403s
	// (expired unsubscribe link, already-submitted token) pass through
	// unchanged so the caller's UX message is accurate. Use the shared
	// `requestFreshToken` so two concurrent retries dedupe on one
	// /api/csrf round-trip.
	if (cachedToken && (await isCsrfRejection(response))) {
		cachedToken = null
		headers.set('X-CSRF-Token', await requestFreshToken())
		return fetch(url, {
			...init,
			credentials: init.credentials ?? 'same-origin',
			headers
		})
	}

	return response
}
