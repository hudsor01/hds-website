/**
 * Unit tests for the Google Ads offline-conversion module.
 *
 * Covers the parts that can drift silently: the hashing/normalization recipe
 * (Google's "Format user data" spec) and the events:ingest payload shape, plus
 * the two no-op gates (unconfigured, and no Google click ID) that keep the
 * upload from firing for non-Google leads.
 */
import { generateKeyPairSync } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import type { Attribution } from '@/lib/attribution'
import {
	buildIngestPayload,
	hashEmail,
	hashPhone,
	normalizeEmail,
	normalizePhone,
	sendAdConversion
} from '@/lib/ad-conversions'

// Pinned SHA-256 hex vectors (computed independently) to lock the algorithm.
const SHA_TEST_EMAIL =
	'973dfe463ec85785f5f95af5ba3906eedb2d931c24e69824a89ea65dba4e813b' // sha256('test@example.com')
const SHA_TEST_PHONE =
	'8a59780bb8cd2ba022bfa5ba2ea3b6e07af17a7d8b30c1f9b3390e36f69019e4' // sha256('+15551234567')

const TEST_CONFIG = {
	customerId: '1234567890',
	conversionActionId: '987654321',
	serviceAccount: {
		client_email: 'svc@example.iam.gserviceaccount.com',
		private_key: 'unused-in-payload-tests'
	}
}

describe('normalizeEmail', () => {
	it('trims whitespace and lowercases', () => {
		expect(normalizeEmail('  Test@Example.COM ')).toBe('test@example.com')
	})

	it('strips dots from the local part for gmail / googlemail', () => {
		expect(normalizeEmail('foo.bar@gmail.com')).toBe('foobar@gmail.com')
		expect(normalizeEmail('foo.bar@googlemail.com')).toBe('foobar@googlemail.com')
	})

	it('preserves dots for non-gmail domains', () => {
		expect(normalizeEmail('foo.bar@example.com')).toBe('foo.bar@example.com')
	})
})

describe('hashEmail', () => {
	it('matches the pinned SHA-256 hex vector', () => {
		expect(hashEmail('test@example.com')).toBe(SHA_TEST_EMAIL)
	})

	it('is invariant to case and whitespace', () => {
		expect(hashEmail('  Test@Example.com ')).toBe(SHA_TEST_EMAIL)
	})

	it('hashes gmail dotted and undotted to the same value', () => {
		expect(hashEmail('a.b.c@gmail.com')).toBe(hashEmail('abc@gmail.com'))
	})

	it('returns lowercase 64-char hex', () => {
		expect(hashEmail('someone@domain.io')).toMatch(/^[0-9a-f]{64}$/)
	})
})

describe('normalizePhone', () => {
	it('assumes +1 for a bare 10-digit US number', () => {
		expect(normalizePhone('555-123-4567')).toBe('+15551234567')
		expect(normalizePhone('(555) 123 4567')).toBe('+15551234567')
	})

	it('handles an 11-digit number led by the US country code', () => {
		expect(normalizePhone('1-555-123-4567')).toBe('+15551234567')
	})

	it('keeps an already-E.164 international number', () => {
		expect(normalizePhone('+44 20 7946 0958')).toBe('+442079460958')
	})

	it('returns null for un-normalizable junk', () => {
		expect(normalizePhone('abc')).toBeNull()
		expect(normalizePhone('12345')).toBeNull()
	})
})

describe('hashPhone', () => {
	it('matches the pinned SHA-256 hex vector after E.164 normalization', () => {
		expect(hashPhone('555-123-4567')).toBe(SHA_TEST_PHONE)
	})

	it('returns null when the phone cannot be normalized', () => {
		expect(hashPhone('not-a-phone')).toBeNull()
	})
})

describe('buildIngestPayload', () => {
	it('returns null when the lead has no Google click ID', () => {
		const attribution = { fbclid: 'FB123' } as Attribution
		expect(buildIngestPayload({ attribution }, TEST_CONFIG)).toBeNull()
	})

	it('builds a complete events:ingest body from a gclid lead', () => {
		const payload = buildIngestPayload(
			{
				leadId: 'lead-123',
				email: 'test@example.com',
				phone: '555-123-4567',
				attribution: { gclid: 'GCLID_ABC' } as Attribution,
				occurredAt: new Date('2026-06-01T12:00:00.000Z')
			},
			TEST_CONFIG
		)

		expect(payload).not.toBeNull()
		if (!payload) {
			return
		}

		expect(payload.encoding).toBe('HEX')

		const dest = payload.destinations[0]
		const event = payload.events[0]
		if (!dest || !event) {
			throw new Error('expected one destination and one event')
		}

		expect(dest.operatingAccount).toEqual({
			product: 'GOOGLE_ADS',
			accountId: '1234567890'
		})
		expect(dest.productDestinationId).toBe('987654321')
		expect(dest.reference).toBe('lead')
		expect(dest.loginAccount).toBeUndefined()

		expect(event.destinationReferences).toEqual(['lead'])
		expect(event.transactionId).toBe('lead-123')
		expect(event.eventTimestamp).toBe('2026-06-01T12:00:00.000Z')
		expect(event.eventSource).toBe('WEB')
		expect(event.adIdentifiers).toEqual({ gclid: 'GCLID_ABC' })
		expect(event.userData?.userIdentifiers).toEqual([
			{ emailAddress: SHA_TEST_EMAIL },
			{ phoneNumber: SHA_TEST_PHONE }
		])
	})

	it('omits conversionValue/currency at form-fill and includes them when a value is given', () => {
		const base = {
			leadId: 'l1',
			attribution: { gclid: 'G' } as Attribution
		}

		const noValue = buildIngestPayload(base, TEST_CONFIG)
		expect(noValue?.events[0]?.conversionValue).toBeUndefined()
		expect(noValue?.events[0]?.currency).toBeUndefined()

		const withValue = buildIngestPayload(
			{ ...base, value: 1500 },
			TEST_CONFIG
		)
		expect(withValue?.events[0]?.conversionValue).toBe(1500)
		expect(withValue?.events[0]?.currency).toBe('USD')
	})

	it('includes loginAccount when a manager (MCC) id is configured', () => {
		const payload = buildIngestPayload(
			{ leadId: 'l1', attribution: { gclid: 'G' } as Attribution },
			{ ...TEST_CONFIG, loginCustomerId: '5550001111' }
		)
		expect(payload?.destinations[0]?.loginAccount).toEqual({
			product: 'GOOGLE_ADS',
			accountId: '5550001111'
		})
	})

	it('carries wbraid / gbraid click ids through', () => {
		const payload = buildIngestPayload(
			{
				leadId: 'l1',
				attribution: { wbraid: 'W1', gbraid: 'B1' } as Attribution
			},
			TEST_CONFIG
		)
		expect(payload?.events[0]?.adIdentifiers).toEqual({
			wbraid: 'W1',
			gbraid: 'B1'
		})
	})

	it('generates a transactionId when no leadId is supplied', () => {
		const payload = buildIngestPayload(
			{ attribution: { gclid: 'G' } as Attribution },
			TEST_CONFIG
		)
		expect(typeof payload?.events[0]?.transactionId).toBe('string')
		expect(payload?.events[0]?.transactionId.length).toBeGreaterThan(0)
	})
})

describe('sendAdConversion (no-op gates)', () => {
	const env = (globalThis as { __TEST_ENV?: Record<string, unknown> }).__TEST_ENV
	let originalFetch: typeof globalThis.fetch
	let fetchSpy: ReturnType<typeof mock>

	beforeEach(() => {
		originalFetch = globalThis.fetch
		fetchSpy = mock(() =>
			Promise.resolve(
				new Response(JSON.stringify({ requestId: 'r1' }), { status: 200 })
			)
		)
		globalThis.fetch = fetchSpy as unknown as typeof globalThis.fetch
	})

	afterEach(() => {
		globalThis.fetch = originalFetch
		if (env) {
			delete env.GOOGLE_ADS_CUSTOMER_ID
			delete env.GOOGLE_ADS_CONVERSION_ACTION_ID
			delete env.GOOGLE_ADS_SA_JSON
		}
	})

	it('does nothing when GOOGLE_ADS_* env is unset', async () => {
		await sendAdConversion({
			leadId: 'l1',
			email: 'test@example.com',
			attribution: { gclid: 'G' } as Attribution
		})
		expect(fetchSpy).not.toHaveBeenCalled()
	})

	it('does nothing when configured but the lead has no Google click ID', async () => {
		if (env) {
			env.GOOGLE_ADS_CUSTOMER_ID = '1234567890'
			env.GOOGLE_ADS_CONVERSION_ACTION_ID = '987654321'
			env.GOOGLE_ADS_SA_JSON = JSON.stringify({
				client_email: 'svc@example.iam.gserviceaccount.com',
				private_key: 'pk'
			})
		}
		await sendAdConversion({
			leadId: 'l1',
			email: 'test@example.com',
			attribution: { fbclid: 'FB' } as Attribution
		})
		expect(fetchSpy).not.toHaveBeenCalled()
	})

	it('does nothing (and never throws) when SA JSON is not valid JSON', async () => {
		if (env) {
			env.GOOGLE_ADS_CUSTOMER_ID = '1234567890'
			env.GOOGLE_ADS_CONVERSION_ACTION_ID = '987654321'
			env.GOOGLE_ADS_SA_JSON = 'not-json{'
		}
		await sendAdConversion({
			leadId: 'l1',
			email: 'test@example.com',
			attribution: { gclid: 'G' } as Attribution
		})
		expect(fetchSpy).not.toHaveBeenCalled()
	})

	it('does nothing when SA JSON is missing a private_key', async () => {
		if (env) {
			env.GOOGLE_ADS_CUSTOMER_ID = '1234567890'
			env.GOOGLE_ADS_CONVERSION_ACTION_ID = '987654321'
			env.GOOGLE_ADS_SA_JSON = JSON.stringify({
				client_email: 'svc@example.iam.gserviceaccount.com'
			})
		}
		await sendAdConversion({
			leadId: 'l1',
			email: 'test@example.com',
			attribution: { gclid: 'G' } as Attribution
		})
		expect(fetchSpy).not.toHaveBeenCalled()
	})
})

describe('sendAdConversion (live upload path)', () => {
	const env = (globalThis as { __TEST_ENV?: Record<string, unknown> }).__TEST_ENV
	// A real RSA keypair so createSign('RSA-SHA256') can sign the JWT. The
	// OAuth response is mocked, so the token is never actually verified.
	const { privateKey } = generateKeyPairSync('rsa', {
		modulusLength: 2048,
		publicKeyEncoding: { type: 'spki', format: 'pem' },
		privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
	})
	let originalFetch: typeof globalThis.fetch

	beforeEach(() => {
		originalFetch = globalThis.fetch
		if (env) {
			env.GOOGLE_ADS_CUSTOMER_ID = '1234567890'
			env.GOOGLE_ADS_CONVERSION_ACTION_ID = '987654321'
			env.GOOGLE_ADS_SA_JSON = JSON.stringify({
				client_email: 'svc@example.iam.gserviceaccount.com',
				private_key: privateKey
			})
		}
	})

	afterEach(() => {
		globalThis.fetch = originalFetch
		if (env) {
			delete env.GOOGLE_ADS_CUSTOMER_ID
			delete env.GOOGLE_ADS_CONVERSION_ACTION_ID
			delete env.GOOGLE_ADS_SA_JSON
		}
	})

	it('mints a token and POSTs the conversion with a Bearer header', async () => {
		const calls: { url: string; auth: string | null }[] = []
		globalThis.fetch = mock(
			(input: RequestInfo | URL, init?: RequestInit) => {
				const url = String(input)
				calls.push({
					url,
					auth: new Headers(init?.headers).get('authorization')
				})
				if (url.includes('oauth2.googleapis.com')) {
					return Promise.resolve(
						new Response(
							JSON.stringify({ access_token: 'tok_abc', expires_in: 3600 }),
							{ status: 200 }
						)
					)
				}
				return Promise.resolve(
					new Response(JSON.stringify({ requestId: 'req_1' }), { status: 200 })
				)
			}
		) as unknown as typeof globalThis.fetch

		await sendAdConversion({
			leadId: 'lead-1',
			email: 'test@example.com',
			attribution: { gclid: 'GCLID_LIVE' } as Attribution
		})

		// Assert OUTSIDE the mock: assertions thrown inside fetch would be
		// swallowed by sendAdConversion's never-throws catch and falsely pass.
		const oauth = calls.find(c => c.url.includes('oauth2.googleapis.com'))
		const ingest = calls.find(c => c.url.includes('datamanager.googleapis.com'))
		expect(oauth).toBeDefined()
		expect(ingest).toBeDefined()
		expect(ingest?.auth).toBe('Bearer tok_abc')
	})

	it('never throws when the upload fails (protects the after() block)', async () => {
		globalThis.fetch = mock((input: RequestInfo | URL) => {
			const url = String(input)
			if (url.includes('oauth2.googleapis.com')) {
				return Promise.resolve(
					new Response(
						JSON.stringify({ access_token: 'tok_abc', expires_in: 3600 }),
						{ status: 200 }
					)
				)
			}
			return Promise.reject(new Error('network down'))
		}) as unknown as typeof globalThis.fetch

		await expect(
			sendAdConversion({
				leadId: 'lead-2',
				email: 'test@example.com',
				attribution: { gclid: 'GCLID_LIVE' } as Attribution
			})
		).resolves.toBeUndefined()
	})

	it('never throws when the ingest API returns a non-2xx status', async () => {
		globalThis.fetch = mock((input: RequestInfo | URL) => {
			const url = String(input)
			if (url.includes('oauth2.googleapis.com')) {
				return Promise.resolve(
					new Response(
						JSON.stringify({ access_token: 'tok_abc', expires_in: 3600 }),
						{ status: 200 }
					)
				)
			}
			return Promise.resolve(
				new Response(JSON.stringify({ error: 'bad request' }), { status: 400 })
			)
		}) as unknown as typeof globalThis.fetch

		await expect(
			sendAdConversion({
				leadId: 'lead-3',
				email: 'test@example.com',
				attribution: { gclid: 'GCLID_LIVE' } as Attribution
			})
		).resolves.toBeUndefined()
	})
})
