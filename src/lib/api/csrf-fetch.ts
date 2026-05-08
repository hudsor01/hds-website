/**
 * Client-side helper that lazily fetches a CSRF token from `/api/csrf` and
 * attaches it as `X-CSRF-Token` on the wrapped fetch call.
 *
 * Tokens last 1 hour (CSRF_SECRET HMAC w/ expiry). We cache the issued
 * token in module memory so repeated form submissions in the same session
 * don't make N round-trips. On 403 (token expired or invalid) we clear the
 * cache and retry once with a fresh token.
 */

let cachedToken: string | null = null

async function fetchToken(): Promise<string> {
	const res = await fetch('/api/csrf', { credentials: 'same-origin' })
	if (!res.ok) {
		throw new Error('Could not get CSRF token')
	}
	const { token } = (await res.json()) as { token: string }
	cachedToken = token
	return token
}

async function getToken(): Promise<string> {
	if (cachedToken) {
		return cachedToken
	}
	return fetchToken()
}

/**
 * Drop-in replacement for `fetch()` that adds an X-CSRF-Token header.
 * Only the first arg form (URL + init) is supported — same shape as the
 * call sites this module replaces.
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

	// Token expired or invalidated — refresh once and retry.
	if (response.status === 403 && cachedToken) {
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
