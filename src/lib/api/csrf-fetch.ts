/**
 * Client-side helper that lazily fetches a CSRF token from `/api/csrf` and
 * attaches it as `X-CSRF-Token` on the wrapped fetch call.
 *
 * Tokens last 1 hour (CSRF_SECRET HMAC w/ expiry). We cache the issued
 * token in module memory so repeated form submissions in the same
 * session don't make N round-trips. Concurrent calls with a cold cache
 * dedupe on a shared inflight promise — first arrival wins, others
 * await the same fetch.
 *
 * Retry-on-403 is narrowed: only "Invalid or missing CSRF token" body
 * triggers a token refresh + retry. Business-logic 403s (expired
 * unsubscribe link, already-submitted testimonial) bubble through as-is
 * so the caller can show a real message.
 */

let cachedToken: string | null = null
let inflight: Promise<string> | null = null

async function fetchToken(): Promise<string> {
	if (inflight) {
		return inflight
	}
	inflight = (async () => {
		try {
			const res = await fetch('/api/csrf', { credentials: 'same-origin' })
			if (!res.ok) {
				throw new Error('Could not get CSRF token')
			}
			const { token } = (await res.json()) as { token: string }
			cachedToken = token
			return token
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
	return fetchToken()
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
	// unchanged so the caller's UX message is accurate.
	if (cachedToken && (await isCsrfRejection(response))) {
		cachedToken = null
		headers.set('X-CSRF-Token', await getToken())
		return fetch(url, {
			...init,
			credentials: init.credentials ?? 'same-origin',
			headers
		})
	}

	return response
}
