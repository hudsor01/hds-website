/**
 * Error classes for the Search Console weekly report. Messages are always
 * authored by scripts/gsc code, never copied from a caught error or a
 * response body, so no key material or request data can leak through them
 * (D2).
 */
import type { ErrorKind } from './types'

/** Secret and token problems: the operator fixes setup, not code. */
export class GscSetupError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'GscSetupError'
	}
}

/** A Search Console API call failed; kind drives retry and messaging. */
export class GscApiError extends Error {
	readonly kind: ErrorKind
	readonly httpStatus: number | null

	constructor(message: string, kind: ErrorKind, httpStatus: number | null) {
		super(message)
		this.name = 'GscApiError'
		this.kind = kind
		this.httpStatus = httpStatus
	}
}
