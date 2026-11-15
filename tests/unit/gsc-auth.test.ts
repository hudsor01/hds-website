/**
 * Tests for scripts/gsc/auth.ts and scripts/gsc/retry.ts: credential
 * parsing, RS256 JWT signing, token exchange, token error mapping and the
 * D7 retry policy on the token call. Fetch and clock are injected; a fresh
 * RSA key pair is generated per run so no real key is ever involved.
 */
import { beforeAll, describe, expect, test } from 'bun:test'
import { verify } from 'node:crypto'
import {
	buildAssertion,
	fetchAccessToken,
	mapTokenError,
	parseCredential,
	type ServiceAccount
} from '../../scripts/gsc/auth'
import { SCOPE, TOKEN_URL } from '../../scripts/gsc/config'
import { GscApiError, GscSetupError } from '../../scripts/gsc/errors'
import { BUDGET_MESSAGE, retryAfterMs } from '../../scripts/gsc/retry'
import {
	collectPemBodyLines,
	createFakeFetch,
	type FakeCall,
	fakeClock,
	jsonResponse,
	makeKeyPair,
	NO_DEADLINE,
	serviceAccountJson
} from './gsc-fixtures'

const ACCESS_TOKEN = 'ya29.test-access-token-should-never-appear'
const NOW = Date.parse('2026-11-16T12:00:00Z')
const NOT_SET =
	'GSC_SERVICE_ACCOUNT_JSON is not set. Add it in repo Settings > Secrets and variables > Actions.'
const NOT_JSON =
	'GSC_SERVICE_ACCOUNT_JSON is not valid JSON. Store the downloaded key file contents unchanged.'
const BAD_KEY =
	'GSC_SERVICE_ACCOUNT_JSON private_key is not a valid PKCS#8 RSA key. Create a new JSON key.'
const CLOCK_LINE =
	'Token request rejected: the JWT time window is invalid. Check the runner clock; do not rotate the key.'
const DISABLED_LINE =
	'Token request rejected (disabled_client): the service account key is disabled. Re-enable it or create a new JSON key.'
const NETWORK_LINE = 'Token request failed: network error.'

function revokedLine(error: string): string {
	return `Token request rejected (${error}): the key is revoked, deleted or from another project. Create a new JSON key and update GSC_SERVICE_ACCOUNT_JSON.`
}

let privateKey: string
let publicKey: string
let cred: ServiceAccount

beforeAll(() => {
	;({ privateKey, publicKey } = makeKeyPair())
	cred = parseCredential(serviceAccountJson(privateKey))
})

/** Asserts no key material, assertion or token appears in a message. */
function expectNoSecrets(message: string, calls: FakeCall[] = []): void {
	for (const line of collectPemBodyLines(privateKey)) {
		expect(message).not.toContain(line)
	}
	expect(message).not.toContain(ACCESS_TOKEN)
	for (const call of calls) {
		const assertion = new URLSearchParams(call.body).get('assertion')
		if (assertion) {
			expect(message).not.toContain(assertion)
		}
	}
}

function captureSync(fn: () => unknown): GscSetupError {
	try {
		fn()
	} catch (error) {
		if (error instanceof GscSetupError) {
			return error
		}
		throw error
	}
	throw new Error('expected a GscSetupError')
}

async function captureAsync(
	fn: () => Promise<unknown>
): Promise<GscSetupError> {
	try {
		await fn()
	} catch (error) {
		if (error instanceof GscSetupError) {
			return error
		}
		throw error
	}
	throw new Error('expected a GscSetupError')
}

function decodePart(part: string | undefined): unknown {
	if (part === undefined) {
		throw new Error('missing JWT part')
	}
	return JSON.parse(Buffer.from(part, 'base64url').toString())
}

/** Fake token endpoint that replays one response (or throw) per call. */
function tokenSequence(
	steps: Array<Response | 'network'>
): ReturnType<typeof createFakeFetch> {
	let index = 0
	return createFakeFetch(call => {
		if (call.url !== TOKEN_URL) {
			throw new Error(`unexpected fetch ${call.url}`)
		}
		const step = steps[index]
		index += 1
		if (step === undefined) {
			throw new Error('token endpoint called too many times')
		}
		if (step === 'network') {
			throw new TypeError('fetch failed')
		}
		return step
	})
}

function okToken(): Response {
	return jsonResponse({
		access_token: ACCESS_TOKEN,
		expires_in: 3600,
		token_type: 'Bearer'
	})
}

describe('parseCredential', () => {
	test('missing secret names the secret and where to add it', () => {
		expect(captureSync(() => parseCredential(undefined)).message).toBe(NOT_SET)
		expect(captureSync(() => parseCredential('')).message).toBe(NOT_SET)
	})

	test('non-JSON secret gets a fixed message with no input tokens', () => {
		const raw =
			'{"type":"service_account","private_key":"-----BEGIN PRIVATE KEY-----\\nMIIEsecretXYZ'
		const error = captureSync(() => parseCredential(raw))
		expect(error.message).toBe(NOT_JSON)
		expect(error.message).not.toContain('MIIEsecretXYZ')
		expect(error.message).not.toContain('JSON Parse error')
	})

	test('bare token input never echoes the token', () => {
		const error = captureSync(() => parseCredential('MIIEsecretXYZ'))
		expect(error.message).toBe(NOT_JSON)
		expect(error.message).not.toContain('MIIEsecretXYZ')
	})

	test('wrong type names the type field only', () => {
		const error = captureSync(() =>
			parseCredential(serviceAccountJson(privateKey, { type: 'user' }))
		)
		expect(error.message).toBe(
			'GSC_SERVICE_ACCOUNT_JSON has a missing or invalid field: type.'
		)
		expectNoSecrets(error.message)
	})

	test('missing client_email is named', () => {
		const error = captureSync(() =>
			parseCredential(
				serviceAccountJson(privateKey, { client_email: undefined })
			)
		)
		expect(error.message).toBe(
			'GSC_SERVICE_ACCOUNT_JSON has a missing or invalid field: client_email.'
		)
	})

	test('non-PEM private_key is named and its value is absent', () => {
		const error = captureSync(() =>
			parseCredential(
				serviceAccountJson(privateKey, { private_key: 'not-a-pem' })
			)
		)
		expect(error.message).toBe(
			'GSC_SERVICE_ACCOUNT_JSON has a missing or invalid field: private_key.'
		)
		expect(error.message).not.toContain('not-a-pem')
	})

	test('foreign token_uri is named and its value is absent', () => {
		const error = captureSync(() =>
			parseCredential(
				serviceAccountJson(privateKey, {
					token_uri: 'https://evil.example/token'
				})
			)
		)
		expect(error.message).toBe(
			'GSC_SERVICE_ACCOUNT_JSON has a missing or invalid field: token_uri.'
		)
		expect(error.message).not.toContain('evil.example')
	})

	test('several bad fields are all named once', () => {
		const error = captureSync(() =>
			parseCredential(
				serviceAccountJson('not-a-pem', { type: 'user', client_email: '' })
			)
		)
		expect(error.message).toBe(
			'GSC_SERVICE_ACCOUNT_JSON has a missing or invalid field: type, client_email, private_key.'
		)
	})

	test('a JSON value that is not an object reports (root)', () => {
		const error = captureSync(() => parseCredential('42'))
		expect(error.message).toBe(
			'GSC_SERVICE_ACCOUNT_JSON has a missing or invalid field: (root).'
		)
	})

	test('valid secret with extra keys parses and strips them', () => {
		const parsed = parseCredential(
			serviceAccountJson(privateKey, {
				client_id: '1234',
				auth_uri: 'https://accounts.google.com/o/oauth2/auth',
				universe_domain: 'googleapis.com'
			})
		)
		expect(parsed).toEqual({
			type: 'service_account',
			client_email: 'gsc-report@hds-test.iam.gserviceaccount.com',
			private_key: privateKey,
			private_key_id: 'kid-test-123',
			token_uri: TOKEN_URL
		})
	})

	test('token_uri is optional', () => {
		const parsed = parseCredential(
			serviceAccountJson(privateKey, { token_uri: undefined })
		)
		expect(parsed.token_uri).toBeUndefined()
	})
})

describe('buildAssertion', () => {
	test('header, claims and signature match the Google JWT bearer spec', () => {
		const jwt = buildAssertion(cred, NOW)
		const parts = jwt.split('.')
		expect(parts).toHaveLength(3)
		const [h, c, s] = parts
		expect(decodePart(h)).toEqual({
			alg: 'RS256',
			typ: 'JWT',
			kid: 'kid-test-123'
		})
		expect(decodePart(c)).toEqual({
			iss: 'gsc-report@hds-test.iam.gserviceaccount.com',
			scope: SCOPE,
			aud: TOKEN_URL,
			iat: 1794830400,
			exp: 1794834000
		})
		if (h === undefined || c === undefined || s === undefined) {
			throw new Error('missing JWT part')
		}
		expect(
			verify(
				'RSA-SHA256',
				Buffer.from(`${h}.${c}`),
				publicKey,
				Buffer.from(s, 'base64url')
			)
		).toBe(true)
	})

	test('the signature fails against a different public key', () => {
		const other = makeKeyPair()
		const [h, c, s] = buildAssertion(cred, NOW).split('.')
		if (h === undefined || c === undefined || s === undefined) {
			throw new Error('missing JWT part')
		}
		expect(
			verify(
				'RSA-SHA256',
				Buffer.from(`${h}.${c}`),
				other.publicKey,
				Buffer.from(s, 'base64url')
			)
		).toBe(false)
	})

	test('header has no kid when private_key_id is absent', () => {
		const noKid = parseCredential(
			serviceAccountJson(privateKey, { private_key_id: undefined })
		)
		const [h] = buildAssertion(noKid, NOW).split('.')
		expect(decodePart(h)).toEqual({ alg: 'RS256', typ: 'JWT' })
	})

	test('a PEM-shaped but invalid key gets a fixed message', () => {
		const fake = parseCredential(
			serviceAccountJson(
				'-----BEGIN PRIVATE KEY-----\nAAAAnotakey\n-----END PRIVATE KEY-----\n'
			)
		)
		const error = captureSync(() => buildAssertion(fake, NOW))
		expect(error.message).toBe(BAD_KEY)
		expect(error.message).not.toContain('AAAAnotakey')
	})
})

describe('mapTokenError', () => {
	test('invalid_client and deleted_client say create a new key', () => {
		expect(mapTokenError(401, { error: 'invalid_client' })).toBe(
			revokedLine('invalid_client')
		)
		expect(mapTokenError(400, { error: 'deleted_client' })).toBe(
			revokedLine('deleted_client')
		)
	})

	test('invalid_scope is reported as a code bug', () => {
		expect(mapTokenError(400, { error: 'invalid_scope' })).toBe(
			'Token request rejected (invalid_scope): the requested scope is wrong. This is a bug in scripts/gsc/auth.ts.'
		)
	})

	test('an unknown safe error code is echoed with the status', () => {
		expect(
			mapTokenError(400, {
				error: 'invalid_request',
				error_description: 'Bad Request'
			})
		).toBe('Token request failed with HTTP 400 (invalid_request).')
	})

	test('an unsafe error code and the description are never echoed', () => {
		const message = mapTokenError(400, {
			error: 'Bad <script> MIIEsecret',
			error_description: 'leaked eyJhbGciOi'
		})
		expect(message).toBe('Token request failed with HTTP 400.')
	})
})

describe('fetchAccessToken', () => {
	test('POSTs the JWT bearer grant once to TOKEN_URL and returns the token', async () => {
		const clock = fakeClock()
		const { fetchFn, calls } = tokenSequence([okToken()])
		const token = await fetchAccessToken(cred, {
			fetchFn,
			clock,
			deadlineMs: NO_DEADLINE
		})
		expect(token).toBe(ACCESS_TOKEN)
		expect(calls).toHaveLength(1)
		const call = calls[0]
		expect(call?.url).toBe(TOKEN_URL)
		expect(call?.method).toBe('POST')
		expect(call?.headers.get('content-type')).toBe(
			'application/x-www-form-urlencoded'
		)
		const form = new URLSearchParams(call?.body ?? '')
		expect(form.get('grant_type')).toBe(
			'urn:ietf:params:oauth:grant-type:jwt-bearer'
		)
		expect(form.get('assertion')).toBe(buildAssertion(cred, NOW))
		expect(clock.sleeps).toEqual([])
	})

	test('never fetches token_uri from the secret', async () => {
		const { fetchFn, calls } = tokenSequence([okToken()])
		await fetchAccessToken(cred, {
			fetchFn,
			clock: fakeClock(),
			deadlineMs: NO_DEADLINE
		})
		expect(calls.map(c => c.url)).toEqual([TOKEN_URL])
	})

	test('400 invalid_grant with a bad signature says create a new key', async () => {
		const clock = fakeClock()
		const { fetchFn, calls } = tokenSequence([
			jsonResponse(
				{ error: 'invalid_grant', error_description: 'Invalid JWT Signature.' },
				400
			)
		])
		const error = await captureAsync(() =>
			fetchAccessToken(cred, { fetchFn, clock, deadlineMs: NO_DEADLINE })
		)
		expect(error.message).toBe(revokedLine('invalid_grant'))
		expect(calls).toHaveLength(1)
		expect(clock.sleeps).toEqual([])
		expectNoSecrets(error.message, calls)
	})

	test('400 invalid_grant about the time window gets the clock line', async () => {
		const { fetchFn, calls } = tokenSequence([
			jsonResponse(
				{
					error: 'invalid_grant',
					error_description:
						'Invalid JWT: Token must be a short-lived token (60 minutes) and in a reasonable timeframe'
				},
				400
			)
		])
		const error = await captureAsync(() =>
			fetchAccessToken(cred, {
				fetchFn,
				clock: fakeClock(),
				deadlineMs: NO_DEADLINE
			})
		)
		expect(error.message).toBe(CLOCK_LINE)
		expectNoSecrets(error.message, calls)
	})

	test('401 disabled_client gets the disabled line without retrying', async () => {
		const clock = fakeClock()
		const { fetchFn, calls } = tokenSequence([
			jsonResponse({ error: 'disabled_client' }, 401)
		])
		const error = await captureAsync(() =>
			fetchAccessToken(cred, { fetchFn, clock, deadlineMs: NO_DEADLINE })
		)
		expect(error.message).toBe(DISABLED_LINE)
		expect(calls).toHaveLength(1)
		expect(clock.sleeps).toEqual([])
		expectNoSecrets(error.message, calls)
	})

	test('403 with no body fails once with the HTTP status line', async () => {
		const clock = fakeClock()
		const { fetchFn, calls } = tokenSequence([
			new Response(null, { status: 403 })
		])
		const error = await captureAsync(() =>
			fetchAccessToken(cred, { fetchFn, clock, deadlineMs: NO_DEADLINE })
		)
		expect(error.message).toBe('Token request failed with HTTP 403.')
		expect(calls).toHaveLength(1)
		expect(clock.sleeps).toEqual([])
	})

	test('200 without an access token fails without retrying', async () => {
		const clock = fakeClock()
		const { fetchFn, calls } = tokenSequence([jsonResponse({})])
		const error = await captureAsync(() =>
			fetchAccessToken(cred, { fetchFn, clock, deadlineMs: NO_DEADLINE })
		)
		expect(error.message).toBe(
			'Token response did not include an access token.'
		)
		expect(calls).toHaveLength(1)
		expect(clock.sleeps).toEqual([])
	})

	test('500 non-JSON three times fails after exactly 3 attempts', async () => {
		const clock = fakeClock()
		const { fetchFn, calls } = tokenSequence([
			new Response('oops', { status: 500 }),
			new Response('oops', { status: 500 }),
			new Response('oops', { status: 500 })
		])
		const error = await captureAsync(() =>
			fetchAccessToken(cred, { fetchFn, clock, deadlineMs: NO_DEADLINE })
		)
		expect(error.message).toBe('Token request failed with HTTP 500.')
		expect(calls).toHaveLength(3)
		expect(clock.sleeps).toEqual([1000, 2000])
		expectNoSecrets(error.message, calls)
	})

	test('network error three times fails after exactly 3 attempts', async () => {
		const clock = fakeClock()
		const { fetchFn, calls } = tokenSequence(['network', 'network', 'network'])
		const error = await captureAsync(() =>
			fetchAccessToken(cred, { fetchFn, clock, deadlineMs: NO_DEADLINE })
		)
		expect(error.message).toBe(NETWORK_LINE)
		expect(calls).toHaveLength(3)
		expect(clock.sleeps).toEqual([1000, 2000])
		expectNoSecrets(error.message, calls)
	})

	test('503, 503, 200 retries with 1 s then 2 s backoff', async () => {
		const clock = fakeClock()
		const { fetchFn, calls } = tokenSequence([
			new Response('', { status: 503 }),
			new Response('', { status: 503 }),
			okToken()
		])
		expect(
			await fetchAccessToken(cred, { fetchFn, clock, deadlineMs: NO_DEADLINE })
		).toBe(ACCESS_TOKEN)
		expect(calls).toHaveLength(3)
		expect(clock.sleeps).toEqual([1000, 2000])
	})

	test('429 then 200 retries once with 1 s backoff', async () => {
		const clock = fakeClock()
		const { fetchFn, calls } = tokenSequence([
			jsonResponse({ error: 'rate_limited' }, 429),
			okToken()
		])
		expect(
			await fetchAccessToken(cred, { fetchFn, clock, deadlineMs: NO_DEADLINE })
		).toBe(ACCESS_TOKEN)
		expect(calls).toHaveLength(2)
		expect(clock.sleeps).toEqual([1000])
	})

	test('network, network, 200 retries and returns the token', async () => {
		const clock = fakeClock()
		const { fetchFn, calls } = tokenSequence(['network', 'network', okToken()])
		expect(
			await fetchAccessToken(cred, { fetchFn, clock, deadlineMs: NO_DEADLINE })
		).toBe(ACCESS_TOKEN)
		expect(calls).toHaveLength(3)
		expect(clock.sleeps).toEqual([1000, 2000])
	})

	test('429 with Retry-After 3 waits 3 s before retrying', async () => {
		const clock = fakeClock()
		const { fetchFn, calls } = tokenSequence([
			new Response('', { status: 429, headers: { 'retry-after': '3' } }),
			okToken()
		])
		expect(
			await fetchAccessToken(cred, { fetchFn, clock, deadlineMs: NO_DEADLINE })
		).toBe(ACCESS_TOKEN)
		expect(calls).toHaveLength(2)
		expect(clock.sleeps).toEqual([3000])
	})

	test('every retry reuses the one assertion built at the start', async () => {
		const { fetchFn, calls } = tokenSequence([
			new Response('', { status: 503 }),
			okToken()
		])
		await fetchAccessToken(cred, {
			fetchFn,
			clock: fakeClock(),
			deadlineMs: NO_DEADLINE
		})
		const assertions = calls.map(c =>
			new URLSearchParams(c.body).get('assertion')
		)
		expect(assertions).toHaveLength(2)
		expect(assertions[0]).toBe(assertions[1] ?? '')
	})

	test('a passed run deadline stops the token call before any request', async () => {
		const { fetchFn, calls } = createFakeFetch(() =>
			jsonResponse({ access_token: ACCESS_TOKEN })
		)
		const clock = fakeClock(NOW)
		let caught: unknown
		try {
			await fetchAccessToken(cred, { fetchFn, clock, deadlineMs: NOW })
		} catch (error) {
			caught = error
		}
		if (!(caught instanceof GscApiError)) {
			throw new Error('expected GscApiError')
		}
		expect(caught.kind).toBe('budget')
		expect(caught.message).toBe(BUDGET_MESSAGE)
		expect(calls).toHaveLength(0)
	})
})

describe('retryAfterMs', () => {
	test('integer seconds convert to milliseconds', () => {
		expect(retryAfterMs('2', NOW)).toBe(2000)
		expect(retryAfterMs('0', NOW)).toBe(0)
	})

	test('large values are capped at MAX_RETRY_AFTER_MS', () => {
		expect(retryAfterMs('120', NOW)).toBe(60_000)
	})

	test('an HTTP-date is measured from now', () => {
		expect(retryAfterMs(new Date(NOW + 5000).toUTCString(), NOW)).toBe(5000)
		expect(retryAfterMs(new Date(NOW + 600_000).toUTCString(), NOW)).toBe(
			60_000
		)
	})

	test('null, garbage, negative and past dates give undefined', () => {
		expect(retryAfterMs(null, NOW)).toBeUndefined()
		expect(retryAfterMs('soon', NOW)).toBeUndefined()
		expect(retryAfterMs('-5', NOW)).toBeUndefined()
		expect(
			retryAfterMs(new Date(NOW - 5000).toUTCString(), NOW)
		).toBeUndefined()
	})
})
