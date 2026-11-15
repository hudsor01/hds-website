/**
 * Search Console HTTP client for the weekly report: Google error
 * classification, a bounded retry transport, serialized and spaced URL
 * Inspection plus Search Analytics queries, each response validated with Zod
 * (D5, D6, D7, D8, D11, D15 C1).
 *
 * Every thrown message is authored here from the error kind, HTTP status and
 * client_email. Google's error.message (it embeds the project number and can
 * echo request data), response bodies, request bodies and the access token
 * never reach a message (D2, AUTO-06). Requests are strictly sequential.
 */
import { z } from 'zod'
import {
	ANALYTICS_URL,
	INSPECT_URL,
	INSPECTION_SPACING_MS,
	MAX_ATTEMPTS,
	SITE_URL
} from './config'
import { GscApiError } from './errors'
import { BUDGET_MESSAGE, sendWithRetry } from './retry'
import type {
	AnalyticsQuery,
	AnalyticsRow,
	ErrorKind,
	GscContext,
	InspectionOutcome
} from './types'

const ReasonListSchema = z
	.array(z.object({ reason: z.string().optional() }))
	.optional()

// Modern envelope (/v1/urlInspection) carries details[].reason; legacy
// (webmasters/v3) carries errors[].reason. Both are read.
const GoogleErrorSchema = z.object({
	error: z.object({
		code: z.number().optional(),
		status: z.string().optional(),
		details: ReasonListSchema,
		errors: ReasonListSchema
	})
})

const DISABLED_REASONS = new Set(['SERVICE_DISABLED', 'accessNotConfigured'])
const SCOPE_REASON = 'ACCESS_TOKEN_SCOPE_INSUFFICIENT'
const QUOTA_REASONS = new Set([
	'quotaExceeded',
	'dailyLimitExceeded',
	'RESOURCE_QUOTA_EXCEEDED'
])
const RATE_REASONS = new Set([
	'rateLimitExceeded',
	'userRateLimitExceeded',
	'RATE_LIMIT_EXCEEDED'
])

function googleReasons(body: unknown): string[] {
	const parsed = GoogleErrorSchema.safeParse(body)
	if (!parsed.success) {
		return []
	}
	const { details, errors } = parsed.data.error
	return [...(details ?? []), ...(errors ?? [])]
		.map(entry => entry.reason)
		.filter((reason): reason is string => typeof reason === 'string')
}

/**
 * Classifies a non-2xx Google response by its parsed reason first, because
 * 403 is overloaded: rate limits, quota, a disabled API, a bad scope and
 * missing property access all share it (D15 C1).
 */
export function classifyGoogleError(status: number, body: unknown): ErrorKind {
	const reasons = googleReasons(body)
	if (reasons.some(reason => DISABLED_REASONS.has(reason))) {
		return 'disabled'
	}
	if (reasons.includes(SCOPE_REASON)) {
		return 'scope'
	}
	if (reasons.some(reason => QUOTA_REASONS.has(reason))) {
		return 'quota'
	}
	if (
		status === 429 ||
		status >= 500 ||
		reasons.some(reason => RATE_REASONS.has(reason))
	) {
		return 'retry'
	}
	if (status === 401) {
		return 'auth'
	}
	if (status === 403) {
		return 'no_access'
	}
	return 'other'
}

/** One actionable line per kind (D8, D15 C1). */
function errorMessage(
	kind: ErrorKind,
	label: string,
	httpStatus: number | null,
	clientEmail: string
): string {
	switch (kind) {
		case 'no_access':
			return `${clientEmail} has no access to ${SITE_URL}. Add it in Search Console > Settings > Users and permissions as Restricted. If it is already Restricted and inspection still fails, change it to Full.`
		case 'disabled':
			return `The Google Search Console API is not enabled. Enable the Google Search Console API on the Cloud project that owns ${clientEmail}.`
		case 'quota':
			return 'Search Console quota exceeded. The next weekly run will retry.'
		case 'scope':
			return 'Search Console rejected the token scope. This is a bug in scripts/gsc/auth.ts.'
		case 'auth':
			return 'Search Console rejected the access token (HTTP 401). Check GSC_SERVICE_ACCOUNT_JSON and run again.'
		case 'retry':
			return httpStatus === null
				? `${label} failed: network error.`
				: `${label} failed with HTTP ${httpStatus} after ${MAX_ATTEMPTS} attempts.`
		case 'budget':
			return BUDGET_MESSAGE
		case 'other':
			return `${label} failed with HTTP ${httpStatus}.`
	}
}

/**
 * POSTs a JSON payload with the bearer token. Retries 429, 5xx, rate-reason
 * 403, network errors and timeouts up to MAX_ATTEMPTS with Retry-After or
 * 1 s, 2 s backoff on the injected clock; every other failure throws at once
 * (D7). Past the run deadline it throws the budget error (WR-01).
 */
export async function requestWithRetry(
	ctx: GscContext,
	url: string,
	payload: unknown,
	label: string
): Promise<unknown> {
	const init: RequestInit = {
		method: 'POST',
		headers: {
			authorization: `Bearer ${ctx.accessToken}`,
			'content-type': 'application/json'
		},
		body: JSON.stringify(payload)
	}

	const result = await sendWithRetry<unknown>(ctx, url, init, (res, body) => {
		if (res.ok) {
			if (body === undefined) {
				throw new GscApiError(
					`${label} returned an unexpected response.`,
					'other',
					res.status
				)
			}
			return { done: true, value: body }
		}
		const kind = classifyGoogleError(res.status, body)
		if (kind !== 'retry') {
			throw new GscApiError(
				errorMessage(kind, label, res.status, ctx.clientEmail),
				kind,
				res.status
			)
		}
		return { done: false }
	})
	if (result.ok) {
		return result.value
	}
	throw new GscApiError(
		errorMessage('retry', label, result.status, ctx.clientEmail),
		'retry',
		result.status
	)
}

// Every field is an optional string, never a strict enum: Google adds and
// reserves enum values. One new value must not fail the whole run (D11).
const IndexStatusSchema = z.object({
	verdict: z.string().optional(),
	coverageState: z.string().optional(),
	lastCrawlTime: z.string().optional(),
	googleCanonical: z.string().optional(),
	userCanonical: z.string().optional(),
	pageFetchState: z.string().optional(),
	robotsTxtState: z.string().optional(),
	indexingState: z.string().optional()
})

export const InspectResponseSchema = z.object({
	inspectionResult: z.object({
		inspectionResultLink: z.string().optional(),
		indexStatusResult: IndexStatusSchema.optional()
	})
})

// Google omits rows when the window has no data.
export const AnalyticsResponseSchema = z.object({
	rows: z
		.array(
			z.object({
				keys: z.array(z.string()),
				clicks: z.number(),
				impressions: z.number(),
				ctr: z.number(),
				position: z.number()
			})
		)
		.optional()
})

/**
 * Returns a serialized inspector: each call starts at least
 * INSPECTION_SPACING_MS after the previous one on the injected clock (D7).
 * Only a failure that exhausted its retries becomes a per-URL outcome so the
 * report can flag it (D5). Every other error throws and fails the run (D8):
 * access, disabled, scope, auth, quota, budget and any other 4xx, which is a
 * request bug that would hit every URL the same way (WR-02).
 */
export function createInspector(
	ctx: GscContext
): (url: string) => Promise<InspectionOutcome> {
	let lastStart: number | undefined

	return async (url: string): Promise<InspectionOutcome> => {
		if (lastStart !== undefined) {
			await ctx.clock.sleep(
				Math.max(0, lastStart + INSPECTION_SPACING_MS - ctx.clock.now())
			)
		}
		lastStart = ctx.clock.now()

		let body: unknown
		try {
			body = await requestWithRetry(
				ctx,
				INSPECT_URL,
				{ inspectionUrl: url, siteUrl: SITE_URL },
				'URL Inspection request'
			)
		} catch (error) {
			// Only our own GscApiError (authored message) is inspected; anything
			// else is rethrown untouched for the top-level handler.
			if (error instanceof GscApiError && error.kind === 'retry') {
				return { ok: false, httpStatus: error.httpStatus }
			}
			throw error
		}

		const parsed = InspectResponseSchema.safeParse(body)
		if (!parsed.success) {
			return { ok: false, unexpectedResponse: true }
		}
		return { ok: true, status: parsed.data.inspectionResult.indexStatusResult }
	}
}

/**
 * Runs one Search Analytics query. No data state or search type field: the
 * API default is final web data (D6). Any failure throws, because a report
 * without striking distance is broken.
 */
export async function queryAnalytics(
	ctx: GscContext,
	query: AnalyticsQuery
): Promise<AnalyticsRow[]> {
	const body = await requestWithRetry(
		ctx,
		ANALYTICS_URL,
		query,
		'Search Analytics request'
	)
	const parsed = AnalyticsResponseSchema.safeParse(body)
	if (!parsed.success) {
		throw new GscApiError(
			'Search Analytics request returned an unexpected response.',
			'other',
			200
		)
	}
	return parsed.data.rows ?? []
}
