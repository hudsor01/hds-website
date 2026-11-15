/**
 * Tests for scripts/gsc/client.ts: Google error classification, the bounded
 * retry transport, and the fixed operator messages (D7, D8, D15 C1). Fetch and
 * clock are injected, so retries and backoff run with zero real waiting.
 */
import { describe, expect, test } from 'bun:test'
import { classifyGoogleError, requestWithRetry } from '../../scripts/gsc/client'
import { ANALYTICS_URL } from '../../scripts/gsc/config'
import { GscApiError } from '../../scripts/gsc/errors'
import type { GscContext } from '../../scripts/gsc/types'
import {
	createFakeFetch,
	type FakeCall,
	fakeClock,
	jsonResponse
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

function makeCtx(handler: (call: FakeCall, index: number) => Response) {
	const clock = fakeClock()
	let index = 0
	const fake = createFakeFetch(call => {
		if (call.url !== ANALYTICS_URL) {
			throw new Error(`unexpected fetch ${call.url}`)
		}
		const res = handler(call, index)
		index++
		return res
	})
	const ctx: GscContext = {
		fetchFn: fake.fetchFn,
		clock,
		accessToken: ACCESS_TOKEN,
		clientEmail: CLIENT_EMAIL
	}
	return { ctx, clock, calls: fake.calls }
}

/** Runs requestWithRetry and returns the GscApiError it must throw. */
async function expectApiError(ctx: GscContext): Promise<GscApiError> {
	let caught: unknown
	try {
		await requestWithRetry(ctx, ANALYTICS_URL, PAYLOAD, LABEL)
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

	test('no message echoes the request body', async () => {
		const { ctx } = makeCtx(() => jsonResponse(modernError(403), 403))
		const error = await expectApiError(ctx)
		expect(error.message).not.toContain(PAYLOAD.startDate)
	})
})
