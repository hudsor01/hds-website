/**
 * Tests for scripts/gsc/client.ts: Google error classification, the bounded
 * retry transport with its timeout and run budget, and the fixed operator
 * messages (D7, D8, D15 C1, WR-01). Fetch and
 * clock are injected, so retries and backoff run with zero real waiting.
 */
import { describe, expect, test } from 'bun:test'
import {
	AnalyticsResponseSchema,
	classifyGoogleError,
	createInspector,
	InspectResponseSchema,
	queryAnalytics,
	requestWithRetry
} from '../../scripts/gsc/client'
import { ANALYTICS_URL, INSPECT_URL } from '../../scripts/gsc/config'
import { GscApiError } from '../../scripts/gsc/errors'
import { BUDGET_MESSAGE } from '../../scripts/gsc/retry'
import type { GscContext } from '../../scripts/gsc/types'
import {
	createFakeFetch,
	type FakeCall,
	type FakeClock,
	fakeClock,
	jsonResponse,
	NO_DEADLINE
} from './gsc-fixtures'

const ACCESS_TOKEN = 'ya29.client-test-token-should-never-appear'
const CLIENT_EMAIL = 'gsc-report@hds-test.iam.gserviceaccount.com'
const GOOGLE_MESSAGE = 'Secret project 123456 detail'
const LABEL = 'Search Analytics request'
const PAYLOAD = { startDate: '2026-10-01', endDate: '2026-10-28' }

const NO_ACCESS_LINE = `${CLIENT_EMAIL} has no access to sc-domain:hudsondigitalsolutions.com. Add it in Search Console > Settings > Users and permissions as Restricted. If it is already Restricted and inspection still fails, change it to Full.`
const DISABLED_LINE = `The Google Search Console API is not enabled. Enable the Google Search Console API on the Cloud project that owns ${CLIENT_EMAIL}.`
const QUOTA_LINE =
	'Search Console quota exceeded. The next weekly run will retry.'
const SCOPE_LINE =
	'Search Console rejected the token scope. This is a bug in scripts/gsc/auth.ts.'
const AUTH_LINE =
	'Search Console rejected the access token (HTTP 401). Check GSC_SERVICE_ACCOUNT_JSON and run again.'

/** Modern envelope (/v1/urlInspection): reasons in details[]. */
function modernError(code: number, reason?: string): unknown {
	return {
		error: {
			code,
			message: GOOGLE_MESSAGE,
			status: 'PERMISSION_DENIED',
			details: reason === undefined ? [] : [{ reason }]
		}
	}
}

/** Legacy envelope (webmasters/v3): reasons in errors[]. */
function legacyError(code: number, reason?: string): unknown {
	return {
		error: {
			code,
			message: GOOGLE_MESSAGE,
			errors:
				reason === undefined
					? []
					: [{ reason, message: GOOGLE_MESSAGE, domain: 'usageLimits' }]
		}
	}
}

function makeCtx(
	handler: (call: FakeCall, index: number, clock: FakeClock) => Response,
	expectedUrl: string = ANALYTICS_URL
) {
	const clock = fakeClock()
	let index = 0
	const fake = createFakeFetch(call => {
		if (call.url !== expectedUrl) {
			throw new Error(`unexpected fetch ${call.url}`)
		}
		const res = handler(call, index, clock)
		index++
		return res
	})
	const ctx: GscContext = {
		fetchFn: fake.fetchFn,
		clock,
		deadlineMs: NO_DEADLINE,
		accessToken: ACCESS_TOKEN,
		clientEmail: CLIENT_EMAIL
	}
	return { ctx, clock, calls: fake.calls }
}

/** Runs requestWithRetry and returns the GscApiError it must throw. */
function expectApiError(ctx: GscContext): Promise<GscApiError> {
	return expectRejection(requestWithRetry(ctx, ANALYTICS_URL, PAYLOAD, LABEL))
}

/** Awaits a promise that must reject with a leak-free GscApiError. */
async function expectRejection(
	promise: Promise<unknown>
): Promise<GscApiError> {
	let caught: unknown
	try {
		await promise
	} catch (error) {
		caught = error
	}
	expect(caught).toBeInstanceOf(GscApiError)
	if (!(caught instanceof GscApiError)) {
		throw new Error('expected GscApiError')
	}
	expect(caught.message).not.toContain(GOOGLE_MESSAGE)
	expect(caught.message).not.toContain(ACCESS_TOKEN)
	expect(caught.message).not.toContain('PERMISSION_DENIED')
	return caught
}

describe('classifyGoogleError', () => {
	test('SERVICE_DISABLED in modern details is disabled', () => {
		expect(classifyGoogleError(403, modernError(403, 'SERVICE_DISABLED'))).toBe(
			'disabled'
		)
	})

	test('accessNotConfigured in legacy errors is disabled', () => {
		expect(
			classifyGoogleError(403, legacyError(403, 'accessNotConfigured'))
		).toBe('disabled')
	})

	test('ACCESS_TOKEN_SCOPE_INSUFFICIENT is scope', () => {
		expect(
			classifyGoogleError(
				403,
				modernError(403, 'ACCESS_TOKEN_SCOPE_INSUFFICIENT')
			)
		).toBe('scope')
	})

	test.each([
		['quotaExceeded', legacyError(403, 'quotaExceeded')],
		['dailyLimitExceeded', legacyError(403, 'dailyLimitExceeded')],
		['RESOURCE_QUOTA_EXCEEDED', modernError(429, 'RESOURCE_QUOTA_EXCEEDED')]
	])('%s is quota, even on 429', (_reason, body) => {
		const status = (body as { error: { code: number } }).error.code
		expect(classifyGoogleError(status, body)).toBe('quota')
	})

	test.each([
		[403, legacyError(403, 'rateLimitExceeded')],
		[403, legacyError(403, 'userRateLimitExceeded')],
		[429, modernError(429, 'RATE_LIMIT_EXCEEDED')],
		[429, undefined],
		[500, undefined],
		[503, modernError(503)]
	])('HTTP %i with a rate reason or server error is retry', (status, body) => {
		expect(classifyGoogleError(status, body)).toBe('retry')
	})

	test('401 is auth', () => {
		expect(classifyGoogleError(401, modernError(401))).toBe('auth')
	})

	test('403 with no known reason is no_access', () => {
		expect(classifyGoogleError(403, modernError(403))).toBe('no_access')
		expect(classifyGoogleError(403, legacyError(403, 'forbidden'))).toBe(
			'no_access'
		)
	})

	test('403 with a non-JSON body is no_access', () => {
		expect(classifyGoogleError(403, undefined)).toBe('no_access')
		expect(classifyGoogleError(403, 'Forbidden')).toBe('no_access')
	})

	test('400 and 404 are other', () => {
		expect(classifyGoogleError(400, legacyError(400, 'invalidParameter'))).toBe(
			'other'
		)
		expect(classifyGoogleError(404, undefined)).toBe('other')
	})
})

describe('requestWithRetry', () => {
	test('sends a Bearer POST with the JSON payload', async () => {
		const { ctx, calls } = makeCtx(() => jsonResponse({ rows: [] }))
		await requestWithRetry(ctx, ANALYTICS_URL, PAYLOAD, LABEL)
		expect(calls).toHaveLength(1)
		const call = calls[0]
		expect(call?.method).toBe('POST')
		expect(call?.headers.get('authorization')).toBe(`Bearer ${ACCESS_TOKEN}`)
		expect(call?.headers.get('content-type')).toBe('application/json')
		expect(JSON.parse(call?.body ?? '')).toEqual(PAYLOAD)
	})

	test('503, 503, 200 retries with 1 s then 2 s backoff', async () => {
		const { ctx, clock, calls } = makeCtx((_call, i) =>
			i < 2 ? jsonResponse(modernError(503), 503) : jsonResponse({ rows: [] })
		)
		const body = await requestWithRetry(ctx, ANALYTICS_URL, PAYLOAD, LABEL)
		expect(body).toEqual({ rows: [] })
		expect(calls).toHaveLength(3)
		expect(clock.sleeps).toEqual([1000, 2000])
	})

	test('429 honors Retry-After seconds', async () => {
		const { ctx, clock, calls } = makeCtx((_call, i) =>
			i === 0
				? jsonResponse(modernError(429), 429, { 'retry-after': '3' })
				: jsonResponse({ ok: 1 })
		)
		expect(await requestWithRetry(ctx, ANALYTICS_URL, PAYLOAD, LABEL)).toEqual({
			ok: 1
		})
		expect(calls).toHaveLength(2)
		expect(clock.sleeps).toEqual([3000])
	})

	test('Retry-After is capped at 60 s', async () => {
		const { ctx, clock } = makeCtx((_call, i) =>
			i === 0
				? jsonResponse(modernError(503), 503, { 'retry-after': '900' })
				: jsonResponse({ ok: 1 })
		)
		await requestWithRetry(ctx, ANALYTICS_URL, PAYLOAD, LABEL)
		expect(clock.sleeps).toEqual([60_000])
	})

	test('Retry-After as an HTTP-date waits until that time', async () => {
		const { ctx, clock } = makeCtx((_call, i) =>
			i === 0
				? jsonResponse(modernError(503), 503, {
						'retry-after': new Date(
							Date.parse('2026-11-16T12:00:05Z')
						).toUTCString()
					})
				: jsonResponse({ ok: 1 })
		)
		await requestWithRetry(ctx, ANALYTICS_URL, PAYLOAD, LABEL)
		expect(clock.sleeps).toEqual([5000])
	})

	test('503 three times throws retry with the label and status', async () => {
		const { ctx, clock, calls } = makeCtx(() =>
			jsonResponse(modernError(503), 503)
		)
		const error = await expectApiError(ctx)
		expect(error.kind).toBe('retry')
		expect(error.httpStatus).toBe(503)
		expect(error.message).toBe(
			'Search Analytics request failed with HTTP 503 after 3 attempts.'
		)
		expect(calls).toHaveLength(3)
		expect(clock.sleeps).toEqual([1000, 2000])
	})

	test('network errors three times throw retry with null status', async () => {
		const clock = fakeClock()
		let calls = 0
		const ctx: GscContext = {
			fetchFn: async () => {
				calls++
				throw new TypeError(`fetch failed ${ACCESS_TOKEN}`)
			},
			clock,
			deadlineMs: NO_DEADLINE,
			accessToken: ACCESS_TOKEN,
			clientEmail: CLIENT_EMAIL
		}
		const error = await expectApiError(ctx)
		expect(error.kind).toBe('retry')
		expect(error.httpStatus).toBeNull()
		expect(error.message).toBe(`${LABEL} failed: network error.`)
		expect(error.message.endsWith('failed: network error.')).toBe(true)
		expect(calls).toBe(3)
		expect(clock.sleeps).toEqual([1000, 2000])
	})

	test('a network error then 200 recovers', async () => {
		const clock = fakeClock()
		let calls = 0
		const ctx: GscContext = {
			fetchFn: async () => {
				calls++
				if (calls === 1) {
					throw new TypeError('fetch failed')
				}
				return jsonResponse({ ok: 1 })
			},
			clock,
			deadlineMs: NO_DEADLINE,
			accessToken: ACCESS_TOKEN,
			clientEmail: CLIENT_EMAIL
		}
		expect(await requestWithRetry(ctx, ANALYTICS_URL, PAYLOAD, LABEL)).toEqual({
			ok: 1
		})
		expect(clock.sleeps).toEqual([1000])
	})

	test('plain 403 fails at once with the access line', async () => {
		const { ctx, clock, calls } = makeCtx(() =>
			jsonResponse(modernError(403), 403)
		)
		const error = await expectApiError(ctx)
		expect(error.kind).toBe('no_access')
		expect(error.httpStatus).toBe(403)
		expect(error.message).toBe(NO_ACCESS_LINE)
		expect(calls).toHaveLength(1)
		expect(clock.sleeps).toEqual([])
	})

	test('403 SERVICE_DISABLED fails at once with the enable line', async () => {
		const { ctx, calls } = makeCtx(() =>
			jsonResponse(modernError(403, 'SERVICE_DISABLED'), 403)
		)
		const error = await expectApiError(ctx)
		expect(error.kind).toBe('disabled')
		expect(error.message).toBe(DISABLED_LINE)
		expect(calls).toHaveLength(1)
	})

	test('403 quotaExceeded fails at once with the quota line', async () => {
		const { ctx, calls } = makeCtx(() =>
			jsonResponse(legacyError(403, 'quotaExceeded'), 403)
		)
		const error = await expectApiError(ctx)
		expect(error.kind).toBe('quota')
		expect(error.message).toBe(QUOTA_LINE)
		expect(calls).toHaveLength(1)
	})

	test('403 scope error fails at once as a code bug', async () => {
		const { ctx, calls } = makeCtx(() =>
			jsonResponse(modernError(403, 'ACCESS_TOKEN_SCOPE_INSUFFICIENT'), 403)
		)
		const error = await expectApiError(ctx)
		expect(error.kind).toBe('scope')
		expect(error.message).toBe(SCOPE_LINE)
		expect(calls).toHaveLength(1)
	})

	test('401 fails at once with the token line', async () => {
		const { ctx, clock, calls } = makeCtx(() =>
			jsonResponse(modernError(401), 401)
		)
		const error = await expectApiError(ctx)
		expect(error.kind).toBe('auth')
		expect(error.httpStatus).toBe(401)
		expect(error.message).toBe(AUTH_LINE)
		expect(calls).toHaveLength(1)
		expect(clock.sleeps).toEqual([])
	})

	test('403 rateLimitExceeded then 200 is retried and succeeds', async () => {
		const { ctx, clock, calls } = makeCtx((_call, i) =>
			i === 0
				? jsonResponse(legacyError(403, 'rateLimitExceeded'), 403)
				: jsonResponse({ ok: 1 })
		)
		expect(await requestWithRetry(ctx, ANALYTICS_URL, PAYLOAD, LABEL)).toEqual({
			ok: 1
		})
		expect(calls).toHaveLength(2)
		expect(clock.sleeps).toEqual([1000])
	})

	test('400 fails at once as other with the status', async () => {
		const { ctx, calls } = makeCtx(() =>
			jsonResponse(legacyError(400, 'invalidParameter'), 400)
		)
		const error = await expectApiError(ctx)
		expect(error.kind).toBe('other')
		expect(error.httpStatus).toBe(400)
		expect(error.message).toBe(`${LABEL} failed with HTTP 400.`)
		expect(calls).toHaveLength(1)
	})

	test('a non-JSON 2xx body fails as an unexpected response', async () => {
		const { ctx, calls } = makeCtx(
			() => new Response(`<html>${GOOGLE_MESSAGE}</html>`, { status: 200 })
		)
		const error = await expectApiError(ctx)
		expect(error.kind).toBe('other')
		expect(error.httpStatus).toBe(200)
		expect(error.message).toBe(`${LABEL} returned an unexpected response.`)
		expect(calls).toHaveLength(1)
	})

	test('every attempt gets its own unaborted timeout signal', async () => {
		const clock = fakeClock()
		const signals: Array<AbortSignal | null | undefined> = []
		const ctx: GscContext = {
			fetchFn: async (_url, init) => {
				signals.push(init.signal)
				return signals.length < 3
					? jsonResponse(modernError(503), 503)
					: jsonResponse({ ok: 1 })
			},
			clock,
			deadlineMs: NO_DEADLINE,
			accessToken: ACCESS_TOKEN,
			clientEmail: CLIENT_EMAIL
		}
		await requestWithRetry(ctx, ANALYTICS_URL, PAYLOAD, LABEL)
		expect(signals).toHaveLength(3)
		for (const signal of signals) {
			expect(signal).toBeInstanceOf(AbortSignal)
			expect(signal?.aborted).toBe(false)
		}
		expect(new Set(signals).size).toBe(3)
	})

	test('a timed-out request retries and then fails as a network error', async () => {
		const clock = fakeClock()
		let calls = 0
		const ctx: GscContext = {
			fetchFn: async () => {
				calls++
				throw new DOMException('The operation timed out.', 'TimeoutError')
			},
			clock,
			deadlineMs: NO_DEADLINE,
			accessToken: ACCESS_TOKEN,
			clientEmail: CLIENT_EMAIL
		}
		const error = await expectApiError(ctx)
		expect(error.kind).toBe('retry')
		expect(error.httpStatus).toBeNull()
		expect(error.message).toBe(`${LABEL} failed: network error.`)
		expect(calls).toBe(3)
		expect(clock.sleeps).toEqual([1000, 2000])
	})

	test('a timeout then 200 recovers', async () => {
		const clock = fakeClock()
		let calls = 0
		const ctx: GscContext = {
			fetchFn: async () => {
				calls++
				if (calls === 1) {
					throw new DOMException('The operation timed out.', 'TimeoutError')
				}
				return jsonResponse({ ok: 1 })
			},
			clock,
			deadlineMs: NO_DEADLINE,
			accessToken: ACCESS_TOKEN,
			clientEmail: CLIENT_EMAIL
		}
		expect(await requestWithRetry(ctx, ANALYTICS_URL, PAYLOAD, LABEL)).toEqual({
			ok: 1
		})
		expect(clock.sleeps).toEqual([1000])
	})

	test('a body that cannot be read retries as a network error', async () => {
		const clock = fakeClock()
		let calls = 0
		const ctx: GscContext = {
			fetchFn: async () => {
				calls++
				if (calls === 1) {
					const res = jsonResponse({ ok: 1 })
					res.text = () => Promise.reject(new Error('stream reset'))
					return res
				}
				return jsonResponse({ ok: 2 })
			},
			clock,
			deadlineMs: NO_DEADLINE,
			accessToken: ACCESS_TOKEN,
			clientEmail: CLIENT_EMAIL
		}
		expect(await requestWithRetry(ctx, ANALYTICS_URL, PAYLOAD, LABEL)).toEqual({
			ok: 2
		})
		expect(calls).toBe(2)
		expect(clock.sleeps).toEqual([1000])
	})

	test('a wait that would pass the deadline throws the budget error', async () => {
		const { ctx, clock, calls } = makeCtx(() =>
			jsonResponse(modernError(503), 503)
		)
		ctx.deadlineMs = clock.now() + 2500
		const error = await expectApiError(ctx)
		expect(error.kind).toBe('budget')
		expect(error.httpStatus).toBeNull()
		expect(error.message).toBe(BUDGET_MESSAGE)
		expect(calls).toHaveLength(2)
		expect(clock.sleeps).toEqual([1000])
		expect(clock.now()).toBeLessThan(ctx.deadlineMs)
	})

	test('no request starts once the deadline has passed', async () => {
		const { ctx, clock, calls } = makeCtx(() => jsonResponse({ ok: 1 }))
		ctx.deadlineMs = clock.now()
		const error = await expectApiError(ctx)
		expect(error.kind).toBe('budget')
		expect(calls).toHaveLength(0)
	})

	test('no message echoes the request body', async () => {
		const { ctx } = makeCtx(() => jsonResponse(modernError(403), 403))
		const error = await expectApiError(ctx)
		expect(error.message).not.toContain(PAYLOAD.startDate)
	})
})

const POST_URL = 'https://hudsondigitalsolutions.com/blog/test-post'

function inspection(indexStatusResult?: Record<string, string>): unknown {
	return {
		inspectionResult: {
			inspectionResultLink: 'https://search.google.com/search-console/inspect',
			...(indexStatusResult === undefined ? {} : { indexStatusResult })
		}
	}
}

const PASS_STATUS = {
	verdict: 'PASS',
	coverageState: 'Submitted and indexed',
	lastCrawlTime: '2026-11-14T03:12:45.123456789Z',
	googleCanonical: POST_URL,
	userCanonical: POST_URL,
	pageFetchState: 'SUCCESSFUL',
	robotsTxtState: 'ALLOWED',
	indexingState: 'INDEXING_ALLOWED'
}

function inspectCtx(
	handler: (call: FakeCall, index: number, clock: FakeClock) => Response
) {
	return makeCtx(handler, INSPECT_URL)
}

describe('createInspector', () => {
	test('POSTs the inspection URL and property in the JSON body', async () => {
		const { ctx, calls } = inspectCtx(() =>
			jsonResponse(inspection(PASS_STATUS))
		)
		await createInspector(ctx)(POST_URL)
		expect(calls).toHaveLength(1)
		expect(calls[0]?.url).toBe(INSPECT_URL)
		expect(calls[0]?.method).toBe('POST')
		expect(calls[0]?.headers.get('authorization')).toBe(
			`Bearer ${ACCESS_TOKEN}`
		)
		expect(JSON.parse(calls[0]?.body ?? '')).toEqual({
			inspectionUrl: POST_URL,
			siteUrl: 'sc-domain:hudsondigitalsolutions.com'
		})
	})

	test('PASS response returns the index status fields', async () => {
		const { ctx } = inspectCtx(() => jsonResponse(inspection(PASS_STATUS)))
		const outcome = await createInspector(ctx)(POST_URL)
		expect(outcome).toEqual({ ok: true, status: PASS_STATUS })
	})

	test('NEUTRAL crawled-not-indexed has no googleCanonical', async () => {
		const { ctx } = inspectCtx(() =>
			jsonResponse(
				inspection({
					verdict: 'NEUTRAL',
					coverageState: 'Crawled - currently not indexed',
					lastCrawlTime: '2026-11-10T08:00:00Z',
					userCanonical: POST_URL
				})
			)
		)
		const outcome = await createInspector(ctx)(POST_URL)
		expect(outcome.ok).toBe(true)
		if (!outcome.ok) {
			throw new Error('expected ok')
		}
		expect(outcome.status?.verdict).toBe('NEUTRAL')
		expect(outcome.status?.coverageState).toBe(
			'Crawled - currently not indexed'
		)
		expect(outcome.status?.googleCanonical).toBeUndefined()
	})

	test('URL unknown to Google parses without crawl time or canonicals', async () => {
		const { ctx } = inspectCtx(() =>
			jsonResponse(
				inspection({
					verdict: 'NEUTRAL',
					coverageState: 'URL is unknown to Google'
				})
			)
		)
		expect(await createInspector(ctx)(POST_URL)).toEqual({
			ok: true,
			status: { verdict: 'NEUTRAL', coverageState: 'URL is unknown to Google' }
		})
	})

	test('canonical mismatch keeps the Google canonical', async () => {
		const other = 'https://hudsondigitalsolutions.com/blog/other-post'
		const { ctx } = inspectCtx(() =>
			jsonResponse(inspection({ ...PASS_STATUS, googleCanonical: other }))
		)
		const outcome = await createInspector(ctx)(POST_URL)
		if (!outcome.ok) {
			throw new Error('expected ok')
		}
		expect(outcome.status?.googleCanonical).toBe(other)
		expect(outcome.status?.userCanonical).toBe(POST_URL)
	})

	test('missing indexStatusResult returns ok with undefined status', async () => {
		const { ctx } = inspectCtx(() => jsonResponse({ inspectionResult: {} }))
		expect(await createInspector(ctx)(POST_URL)).toEqual({
			ok: true,
			status: undefined
		})
	})

	test('an unknown verdict value is accepted as a string', async () => {
		const { ctx } = inspectCtx(() =>
			jsonResponse(inspection({ verdict: 'BRAND_NEW_VALUE' }))
		)
		expect(await createInspector(ctx)(POST_URL)).toEqual({
			ok: true,
			status: { verdict: 'BRAND_NEW_VALUE' }
		})
	})

	test('a body that fails the schema is a failed inspection (HTTP 200)', async () => {
		const { ctx } = inspectCtx(() => jsonResponse({ foo: 1 }))
		expect(await createInspector(ctx)(POST_URL)).toEqual({
			ok: false,
			httpStatus: 200
		})
	})

	test('a non-JSON 200 body is a failed inspection (HTTP 200)', async () => {
		const { ctx } = inspectCtx(() => new Response('not json', { status: 200 }))
		expect(await createInspector(ctx)(POST_URL)).toEqual({
			ok: false,
			httpStatus: 200
		})
	})

	test('503 three times returns a failed outcome instead of throwing', async () => {
		const { ctx, calls } = inspectCtx(() => jsonResponse(modernError(503), 503))
		expect(await createInspector(ctx)(POST_URL)).toEqual({
			ok: false,
			httpStatus: 503
		})
		expect(calls).toHaveLength(3)
	})

	test('network errors three times return httpStatus null', async () => {
		const clock = fakeClock()
		const ctx: GscContext = {
			fetchFn: async () => {
				throw new TypeError('fetch failed')
			},
			clock,
			deadlineMs: NO_DEADLINE,
			accessToken: ACCESS_TOKEN,
			clientEmail: CLIENT_EMAIL
		}
		expect(await createInspector(ctx)(POST_URL)).toEqual({
			ok: false,
			httpStatus: null
		})
	})

	test('a 404 returns a failed outcome with that status', async () => {
		const { ctx, calls } = inspectCtx(() => jsonResponse(modernError(404), 404))
		expect(await createInspector(ctx)(POST_URL)).toEqual({
			ok: false,
			httpStatus: 404
		})
		expect(calls).toHaveLength(1)
	})

	test('plain 403 throws no_access and fails the run', async () => {
		const { ctx, calls } = inspectCtx(() => jsonResponse(modernError(403), 403))
		const error = await expectRejection(createInspector(ctx)(POST_URL))
		expect(error.kind).toBe('no_access')
		expect(error.message).toBe(NO_ACCESS_LINE)
		expect(calls).toHaveLength(1)
	})

	test('403 quotaExceeded throws quota', async () => {
		const { ctx } = inspectCtx(() =>
			jsonResponse(legacyError(403, 'quotaExceeded'), 403)
		)
		const error = await expectRejection(createInspector(ctx)(POST_URL))
		expect(error.kind).toBe('quota')
	})

	test('403 SERVICE_DISABLED and 401 throw', async () => {
		const disabled = inspectCtx(() =>
			jsonResponse(modernError(403, 'SERVICE_DISABLED'), 403)
		)
		expect(
			(await expectRejection(createInspector(disabled.ctx)(POST_URL))).kind
		).toBe('disabled')
		const auth = inspectCtx(() => jsonResponse(modernError(401), 401))
		expect(
			(await expectRejection(createInspector(auth.ctx)(POST_URL))).kind
		).toBe('auth')
	})

	test('an error that is not a GscApiError is rethrown unchanged', async () => {
		const clock = fakeClock()
		let nowCalls = 0
		const ctx: GscContext = {
			// A 503 makes requestWithRetry read the clock for Retry-After, which
			// throws inside the inspector's try block.
			fetchFn: async () => jsonResponse(modernError(503), 503),
			clock: {
				now: () => {
					nowCalls++
					if (nowCalls > 1) {
						throw new RangeError('clock broke')
					}
					return clock.now()
				},
				sleep: clock.sleep
			},
			deadlineMs: NO_DEADLINE,
			accessToken: ACCESS_TOKEN,
			clientEmail: CLIENT_EMAIL
		}
		await expect(createInspector(ctx)(POST_URL)).rejects.toBeInstanceOf(
			RangeError
		)
		expect(nowCalls).toBe(2)
	})

	test('the budget error fails the run instead of a per-URL outcome', async () => {
		const { ctx, clock, calls } = inspectCtx(() =>
			jsonResponse(modernError(503), 503, { 'retry-after': '60' })
		)
		ctx.deadlineMs = clock.now() + 30_000
		const error = await expectRejection(createInspector(ctx)(POST_URL))
		expect(error.kind).toBe('budget')
		expect(error.message).toBe(BUDGET_MESSAGE)
		expect(calls).toHaveLength(1)
	})

	test('consecutive inspections are spaced 200 ms; the first never sleeps', async () => {
		const { ctx, clock, calls } = inspectCtx(() =>
			jsonResponse(inspection(PASS_STATUS))
		)
		const inspect = createInspector(ctx)
		await inspect(POST_URL)
		expect(clock.sleeps).toEqual([])
		await inspect(POST_URL)
		await inspect(POST_URL)
		expect(clock.sleeps).toEqual([200, 200])
		expect(calls).toHaveLength(3)
	})

	test('fetch latency counts toward the spacing', async () => {
		const { ctx, clock } = inspectCtx((_call, _i, fakeTime) => {
			fakeTime.advance(50)
			return jsonResponse(inspection(PASS_STATUS))
		})
		const inspect = createInspector(ctx)
		await inspect(POST_URL)
		await inspect(POST_URL)
		await inspect(POST_URL)
		expect(clock.sleeps).toEqual([150, 150])
	})

	test('a slow inspection needs no extra wait before the next', async () => {
		const { ctx, clock } = inspectCtx((_call, _i, fakeTime) => {
			fakeTime.advance(500)
			return jsonResponse(inspection(PASS_STATUS))
		})
		const inspect = createInspector(ctx)
		await inspect(POST_URL)
		await inspect(POST_URL)
		expect(clock.sleeps).toEqual([0])
	})

	test('InspectResponseSchema rejects a body without inspectionResult', () => {
		expect(InspectResponseSchema.safeParse({ foo: 1 }).success).toBe(false)
		expect(
			InspectResponseSchema.safeParse(inspection(PASS_STATUS)).success
		).toBe(true)
	})
})

const ENCODED_ANALYTICS_URL =
	'https://searchconsole.googleapis.com/webmasters/v3/sites/sc-domain%3Ahudsondigitalsolutions.com/searchAnalytics/query'

const QUERY = {
	startDate: '2026-10-17',
	endDate: '2026-11-13',
	dimensions: ['query', 'page'] as Array<'date' | 'query' | 'page'>,
	rowLimit: 25_000
}

describe('queryAnalytics', () => {
	test('POSTs to the encoded sc-domain path without dataState', async () => {
		const { ctx, calls } = makeCtx(() => jsonResponse({ rows: [] }))
		await queryAnalytics(ctx, QUERY)
		expect(ANALYTICS_URL).toBe(ENCODED_ANALYTICS_URL)
		expect(calls).toHaveLength(1)
		expect(calls[0]?.url).toBe(ENCODED_ANALYTICS_URL)
		expect(calls[0]?.method).toBe('POST')
		expect(calls[0]?.headers.get('authorization')).toBe(
			`Bearer ${ACCESS_TOKEN}`
		)
		const body: unknown = JSON.parse(calls[0]?.body ?? '')
		expect(body).toEqual({
			startDate: '2026-10-17',
			endDate: '2026-11-13',
			dimensions: ['query', 'page'],
			rowLimit: 25_000
		})
		expect(body).not.toHaveProperty('dataState')
		expect(body).not.toHaveProperty('type')
	})

	test('a response without rows returns an empty list', async () => {
		const { ctx } = makeCtx(() =>
			jsonResponse({ responseAggregationType: 'byPage' })
		)
		expect(await queryAnalytics(ctx, QUERY)).toEqual([])
	})

	test('rows parse to AnalyticsRow values', async () => {
		const rows = [
			{
				keys: ['dfw web design', 'https://hudsondigitalsolutions.com/blog/a'],
				clicks: 3,
				impressions: 120,
				ctr: 0.025,
				position: 8.4
			},
			{
				keys: ['nextjs seo', 'https://hudsondigitalsolutions.com/blog/b'],
				clicks: 0,
				impressions: 40,
				ctr: 0,
				position: 14
			}
		]
		const { ctx } = makeCtx(() =>
			jsonResponse({ rows, responseAggregationType: 'byPage' })
		)
		expect(await queryAnalytics(ctx, QUERY)).toEqual(rows)
	})

	test('a malformed body throws an unexpected response error', async () => {
		const { ctx } = makeCtx(() =>
			jsonResponse({ rows: [{ keys: ['x'], clicks: 'many' }] })
		)
		const error = await expectRejection(queryAnalytics(ctx, QUERY))
		expect(error.kind).toBe('other')
		expect(error.httpStatus).toBe(200)
		expect(error.message).toBe(
			'Search Analytics request returned an unexpected response.'
		)
	})

	test('503 three times throws retry and fails the run', async () => {
		const { ctx, calls } = makeCtx(() => jsonResponse(modernError(503), 503))
		const error = await expectRejection(queryAnalytics(ctx, QUERY))
		expect(error.kind).toBe('retry')
		expect(error.httpStatus).toBe(503)
		expect(error.message).toBe(
			'Search Analytics request failed with HTTP 503 after 3 attempts.'
		)
		expect(calls).toHaveLength(3)
	})

	test('a plain 403 throws the access line', async () => {
		const { ctx } = makeCtx(() => jsonResponse(legacyError(403), 403))
		const error = await expectRejection(queryAnalytics(ctx, QUERY))
		expect(error.kind).toBe('no_access')
		expect(error.message).toBe(NO_ACCESS_LINE)
	})

	test('AnalyticsResponseSchema treats rows as optional', () => {
		expect(AnalyticsResponseSchema.safeParse({}).success).toBe(true)
		expect(
			AnalyticsResponseSchema.safeParse({ rows: [{ keys: [] }] }).success
		).toBe(false)
	})
})
