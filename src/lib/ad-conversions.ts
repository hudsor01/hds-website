/**
 * Google Ads offline conversion upload (Enhanced Conversions for Leads).
 *
 * Reports a converted lead back to Google Ads so the campaign can optimize
 * toward real leads, keyed on the gclid captured at click time (see
 * `attribution.ts`) plus hashed first-party data. Uploads via the Google Ads
 * **Data Manager API** (`events:ingest`), NOT the legacy Google Ads API
 * `UploadClickConversions` endpoint - that legacy path is closed to
 * developer tokens created after June 15, 2026, and Data Manager needs no
 * developer token at all.
 *
 * Fully env-gated and self-guarding: `sendAdConversion` is a no-op unless
 * GOOGLE_ADS_* creds are set AND the lead carries a Google click ID. An
 * organic, direct, or Meta-sourced lead is never uploaded to Google. It never
 * throws - it is called from the contact route's post-response `after()` block
 * and must not affect the user-facing response.
 *
 * Auth is a service-account JWT-bearer exchange minted with node:crypto (no
 * extra dependency), matching the native-crypto idiom already used in
 * testimonials.ts / auth/admin.ts.
 *
 * @see https://developers.google.com/data-manager/api/reference/rest/v1/events/ingest
 * @see https://developers.google.com/data-manager/api/devguides/concepts/formatting
 */

import 'server-only'

import { createHash, createSign, randomUUID } from 'node:crypto'
import { z } from 'zod'
import { env } from '@/env'
import type { Attribution } from '@/lib/attribution'
import { logger } from '@/lib/logger'

const INGEST_ENDPOINT = 'https://datamanager.googleapis.com/v1/events:ingest'
const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const DATA_MANAGER_SCOPE = 'https://www.googleapis.com/auth/datamanager'

// ---------------------------------------------------------------------------
// Types (mirrors the Data Manager API IngestEventsRequest shape)
// ---------------------------------------------------------------------------

interface ProductAccount {
	product: 'GOOGLE_ADS'
	accountId: string
}

interface Destination {
	reference: string
	operatingAccount: ProductAccount
	loginAccount?: ProductAccount
	productDestinationId: string
}

interface AdIdentifiers {
	gclid?: string
	wbraid?: string
	gbraid?: string
}

interface UserIdentifier {
	emailAddress?: string
	phoneNumber?: string
}

interface IngestEvent {
	destinationReferences: string[]
	transactionId: string
	eventTimestamp: string
	eventSource: 'WEB'
	adIdentifiers: AdIdentifiers
	userData?: { userIdentifiers: UserIdentifier[] }
	conversionValue?: number
	currency?: string
}

interface IngestPayload {
	destinations: Destination[]
	encoding: 'HEX'
	events: IngestEvent[]
}

interface ServiceAccount {
	client_email: string
	private_key: string
}

interface GoogleAdsConfig {
	customerId: string
	conversionActionId: string
	loginCustomerId?: string
	serviceAccount: ServiceAccount
}

export interface AdConversionParams {
	/** Lead id; doubles as the conversion `transactionId` for dedup/idempotency. */
	leadId?: string
	email?: string
	phone?: string | null
	attribution?: Attribution | null
	/** Conversion value. Omit at form-fill; set when a lead closes with a known value. */
	value?: number
	currency?: string
	/** Conversion time. Defaults to now. */
	occurredAt?: Date
}

// ---------------------------------------------------------------------------
// Config / gating
// ---------------------------------------------------------------------------

const serviceAccountSchema = z.object({
	client_email: z.string().email(),
	private_key: z.string().min(1)
})

/** Cheap presence check - does not parse the SA JSON. */
export function isGoogleAdsConfigured(): boolean {
	return Boolean(
		env.GOOGLE_ADS_CUSTOMER_ID &&
			env.GOOGLE_ADS_CONVERSION_ACTION_ID &&
			env.GOOGLE_ADS_SA_JSON
	)
}

function getConfig(): GoogleAdsConfig | null {
	const customerId = env.GOOGLE_ADS_CUSTOMER_ID
	const conversionActionId = env.GOOGLE_ADS_CONVERSION_ACTION_ID
	const saJson = env.GOOGLE_ADS_SA_JSON

	if (!customerId || !conversionActionId || !saJson) {
		return null
	}

	let parsed: unknown
	try {
		parsed = JSON.parse(saJson)
	} catch {
		logger.error(
			'GOOGLE_ADS_SA_JSON is not valid JSON; conversion upload disabled'
		)
		return null
	}

	const sa = serviceAccountSchema.safeParse(parsed)
	if (!sa.success) {
		logger.error(
			'GOOGLE_ADS_SA_JSON missing client_email/private_key; conversion upload disabled'
		)
		return null
	}

	return {
		// Google Ads customer / manager IDs are digits only - tolerate dashes.
		customerId: customerId.replace(/-/g, ''),
		conversionActionId,
		loginCustomerId:
			env.GOOGLE_ADS_LOGIN_CUSTOMER_ID?.replace(/-/g, '') || undefined,
		serviceAccount: {
			client_email: sa.data.client_email,
			// Tolerate keys stored with escaped newlines (common in env vars).
			private_key: sa.data.private_key.replace(/\\n/g, '\n')
		}
	}
}

// ---------------------------------------------------------------------------
// Hashing / normalization (Google "Format user data" spec)
// ---------------------------------------------------------------------------

function sha256Hex(value: string): string {
	return createHash('sha256').update(value, 'utf8').digest('hex')
}

/**
 * Trim all whitespace, lowercase, and strip dots from the local part of
 * gmail.com / googlemail.com addresses (still required by Google's spec).
 */
export function normalizeEmail(raw: string): string {
	const email = raw.replace(/\s+/g, '').toLowerCase()
	const atIndex = email.lastIndexOf('@')
	if (atIndex === -1) {
		return email
	}
	const local = email.slice(0, atIndex)
	const domain = email.slice(atIndex + 1)
	if (domain === 'gmail.com' || domain === 'googlemail.com') {
		return `${local.replace(/\./g, '')}@${domain}`
	}
	return email
}

export function hashEmail(raw: string): string {
	return sha256Hex(normalizeEmail(raw))
}

/**
 * Normalize a phone number to E.164. US-centric: a bare 10-digit number is
 * assumed +1 (this business serves US-local customers). Returns null when the
 * input cannot be confidently normalized, so a junk value is dropped rather
 * than hashed into a bad identifier.
 */
export function normalizePhone(raw: string): string | null {
	const hadPlus = raw.trim().startsWith('+')
	const digits = raw.replace(/\D/g, '')

	if (hadPlus) {
		return digits.length >= 7 && digits.length <= 15 ? `+${digits}` : null
	}
	if (digits.length === 10) {
		return `+1${digits}`
	}
	if (digits.length === 11 && digits.startsWith('1')) {
		return `+${digits}`
	}
	return null
}

export function hashPhone(raw: string): string | null {
	const e164 = normalizePhone(raw)
	return e164 ? sha256Hex(e164) : null
}

// ---------------------------------------------------------------------------
// Payload construction (pure - exported for testing)
// ---------------------------------------------------------------------------

function extractClickIds(
	attribution: Attribution | null | undefined
): AdIdentifiers {
	const ids: AdIdentifiers = {}
	if (attribution?.gclid) {
		ids.gclid = attribution.gclid
	}
	if (attribution?.wbraid) {
		ids.wbraid = attribution.wbraid
	}
	if (attribution?.gbraid) {
		ids.gbraid = attribution.gbraid
	}
	return ids
}

/**
 * Build the events:ingest request body, or null when the lead has no Google
 * click ID (not a Google Ads lead, so nothing should be reported to Google).
 */
export function buildIngestPayload(
	params: AdConversionParams,
	config: GoogleAdsConfig
): IngestPayload | null {
	const adIdentifiers = extractClickIds(params.attribution)
	if (!adIdentifiers.gclid && !adIdentifiers.wbraid && !adIdentifiers.gbraid) {
		return null
	}

	const userIdentifiers: UserIdentifier[] = []
	if (params.email) {
		userIdentifiers.push({ emailAddress: hashEmail(params.email) })
	}
	if (params.phone) {
		const phoneHash = hashPhone(params.phone)
		if (phoneHash) {
			userIdentifiers.push({ phoneNumber: phoneHash })
		}
	}

	const event: IngestEvent = {
		destinationReferences: ['lead'],
		transactionId: params.leadId ?? randomUUID(),
		eventTimestamp: (params.occurredAt ?? new Date()).toISOString(),
		eventSource: 'WEB',
		adIdentifiers
	}
	if (userIdentifiers.length > 0) {
		event.userData = { userIdentifiers }
	}
	if (typeof params.value === 'number') {
		event.conversionValue = params.value
		event.currency = params.currency ?? 'USD'
	}

	const destination: Destination = {
		reference: 'lead',
		operatingAccount: { product: 'GOOGLE_ADS', accountId: config.customerId },
		productDestinationId: config.conversionActionId
	}
	if (config.loginCustomerId) {
		destination.loginAccount = {
			product: 'GOOGLE_ADS',
			accountId: config.loginCustomerId
		}
	}

	return { destinations: [destination], encoding: 'HEX', events: [event] }
}

// ---------------------------------------------------------------------------
// Auth (service-account JWT bearer -> access token)
// ---------------------------------------------------------------------------

function base64url(input: Buffer | string): string {
	const buf = typeof input === 'string' ? Buffer.from(input) : input
	return buf
		.toString('base64')
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '')
}

let tokenCache: { token: string; expiresAt: number } | null = null

async function mintAccessToken(sa: ServiceAccount): Promise<string> {
	// Reuse a cached token with a 60s safety margin.
	if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
		return tokenCache.token
	}

	const issuedAt = Math.floor(Date.now() / 1000)
	const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
	const claims = base64url(
		JSON.stringify({
			iss: sa.client_email,
			scope: DATA_MANAGER_SCOPE,
			aud: OAUTH_TOKEN_URL,
			iat: issuedAt,
			exp: issuedAt + 3600
		})
	)
	const signingInput = `${header}.${claims}`
	const signature = base64url(
		createSign('RSA-SHA256').update(signingInput).sign(sa.private_key)
	)
	const assertion = `${signingInput}.${signature}`

	const res = await fetch(OAUTH_TOKEN_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
			assertion
		})
	})
	if (!res.ok) {
		throw new Error(
			`OAuth token exchange failed: ${res.status} ${await res.text()}`
		)
	}
	const json = (await res.json()) as {
		access_token: string
		expires_in: number
	}
	tokenCache = {
		token: json.access_token,
		expiresAt: Date.now() + json.expires_in * 1000
	}
	return json.access_token
}

// ---------------------------------------------------------------------------
// Public entry
// ---------------------------------------------------------------------------

/**
 * Upload a lead conversion to Google Ads. No-op (and never throws) when creds
 * are unset or the lead has no Google click ID. Safe to call unconditionally
 * from the contact route's `after()` block.
 */
export async function sendAdConversion(
	params: AdConversionParams
): Promise<void> {
	try {
		const config = getConfig()
		if (!config) {
			return
		}

		const payload = buildIngestPayload(params, config)
		if (!payload) {
			// No Google click ID -> not a Google Ads lead; nothing to report.
			return
		}

		const token = await mintAccessToken(config.serviceAccount)
		const res = await fetch(INGEST_ENDPOINT, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		})

		if (!res.ok) {
			logger.error(
				'Google Ads conversion upload failed',
				new Error(`Data Manager API ${res.status}: ${await res.text()}`),
				{ metadata: { leadId: params.leadId } }
			)
			return
		}

		const body = (await res.json().catch(() => ({}))) as { requestId?: string }
		logger.info('Google Ads conversion uploaded', {
			leadId: params.leadId,
			requestId: body.requestId
		})
	} catch (error) {
		logger.error('Google Ads conversion upload threw', error, {
			metadata: { leadId: params.leadId }
		})
	}
}
