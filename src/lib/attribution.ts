/**
 * First-party marketing attribution.
 *
 * Captures the acquisition touch (UTM params + ad click IDs + referrer +
 * landing page) on page load and persists it in localStorage for 90 days,
 * so a lead who clicks an ad, lands on one page, and converts on another
 * still carries the original campaign + gclid/fbclid. The lead write path
 * reads getAttribution() and stores it on the lead, which is what makes
 * paid-ad spend measurable (offline conversion import keys on gclid/fbclid
 * + the persisted source).
 *
 * Storage is localStorage rather than a cookie on purpose: the server
 * never auto-reads this value (it is injected into the contact POST body
 * explicitly), so a cookie's request-attachment is unused. localStorage is
 * synchronous - so getAttribution() can run inline at form submit - and
 * universally supported, unlike the async, recent-only Cookie Store API.
 *
 * No platform decision required: every common click ID is captured
 * (Google gclid/wbraid/gbraid, Meta fbclid) so the same module works for
 * Google Ads, Meta, or both.
 *
 * Import-safe on the server (the schema + deriveChannel are pure; the
 * capture/get helpers no-op when window is absent).
 */

import { z } from 'zod'

const STR = z.string().trim().max(512).optional()

export const attributionSchema = z.object({
	utmSource: STR,
	utmMedium: STR,
	utmCampaign: STR,
	utmTerm: STR,
	utmContent: STR,
	gclid: STR,
	fbclid: STR,
	wbraid: STR,
	gbraid: STR,
	referrer: STR,
	landingPage: STR,
	// ISO 8601 so a corrupt/non-date value fails validation (and is evicted)
	// rather than silently defeating the TTL via a NaN comparison.
	firstTouchAt: z.iso.datetime().optional(),
	lastTouchAt: z.iso.datetime().optional()
})

export type Attribution = z.infer<typeof attributionSchema>

const STORAGE_KEY = 'hds_attr'
const TTL_MS = 1000 * 60 * 60 * 24 * 90 // 90 days

// URL params that mark a meaningful (paid/campaign) touch. Their presence
// means this visit should overwrite a previously-stored touch (last-click).
const AD_PARAM_KEYS = [
	'utm_source',
	'utm_medium',
	'utm_campaign',
	'utm_term',
	'utm_content',
	'gclid',
	'fbclid',
	'wbraid',
	'gbraid'
] as const

/** Drop empty/undefined entries so the stored object stays compact. */
function compact(input: Record<string, string | undefined>): Attribution {
	const out: Record<string, string> = {}
	for (const [key, value] of Object.entries(input)) {
		if (value && value.length > 0) {
			out[key] = value.slice(0, 512)
		}
	}
	return out as Attribution
}

function externalReferrer(): string | undefined {
	if (typeof document === 'undefined' || !document.referrer) {
		return undefined
	}
	try {
		const ref = new URL(document.referrer)
		// Origin only: the host is the marketing signal; the path/query can
		// carry PII (inbox search strings, CRM deal URLs) we must not store.
		return ref.host === window.location.host ? undefined : ref.origin
	} catch {
		return undefined
	}
}

function readStore(): Attribution | undefined {
	if (typeof window === 'undefined') {
		return undefined
	}
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY)
		if (!raw) {
			return undefined
		}
		const result = attributionSchema.safeParse(JSON.parse(raw))
		if (!result.success) {
			// Corrupt/old-shape record: evict so the next visit recaptures.
			window.localStorage.removeItem(STORAGE_KEY)
			return undefined
		}
		// Expire after the TTL, matching what a 90-day cookie would do.
		const last = result.data.lastTouchAt
		if (last && Date.now() - Date.parse(last) > TTL_MS) {
			window.localStorage.removeItem(STORAGE_KEY)
			return undefined
		}
		return result.data
	} catch {
		return undefined
	}
}

function writeStore(attribution: Attribution): void {
	if (typeof window === 'undefined') {
		return
	}
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution))
	} catch {
		// Storage can be unavailable (private mode / quota exceeded).
		// Attribution is best-effort, so swallow rather than break the page.
	}
}

/**
 * Pure attribution resolution. Given the current visit's params, referrer,
 * and path plus any previously-stored touch, return the touch to persist -
 * or null when a stored paid/campaign touch should be preserved (a later
 * organic or internal visit must not overwrite it). Exported for testing.
 */
export function buildAttributionTouch(
	params: URLSearchParams,
	referrer: string | undefined,
	pathname: string,
	existing: Attribution | undefined,
	now: string
): Attribution | null {
	const hasAdParams = AD_PARAM_KEYS.some(key => params.get(key))

	// Preserve a prior attributed touch on paramless later visits.
	if (existing && !hasAdParams) {
		return null
	}

	return compact({
		utmSource: params.get('utm_source') ?? undefined,
		utmMedium: params.get('utm_medium') ?? undefined,
		utmCampaign: params.get('utm_campaign') ?? undefined,
		utmTerm: params.get('utm_term') ?? undefined,
		utmContent: params.get('utm_content') ?? undefined,
		gclid: params.get('gclid') ?? undefined,
		fbclid: params.get('fbclid') ?? undefined,
		wbraid: params.get('wbraid') ?? undefined,
		gbraid: params.get('gbraid') ?? undefined,
		referrer,
		landingPage: pathname,
		firstTouchAt: existing?.firstTouchAt ?? now,
		lastTouchAt: now
	})
}

/**
 * Capture the current visit's attribution and persist it. Last meaningful
 * (UTM / ad-click) touch wins; a later organic or internal visit never
 * overwrites a stored paid touch. The first visit records a baseline
 * (referrer + landing page) so direct entries still have a first-touch
 * timestamp. Safe to call on every page mount.
 */
export function captureAttribution(): void {
	if (typeof window === 'undefined') {
		return
	}
	const touch = buildAttributionTouch(
		new URLSearchParams(window.location.search),
		externalReferrer(),
		window.location.pathname,
		readStore(),
		new Date().toISOString()
	)
	if (touch) {
		writeStore(touch)
	}
}

/** Read the persisted attribution to attach to a lead submission. */
export function getAttribution(): Attribution | undefined {
	return readStore()
}

// Allowlist of recognized utm_medium values. An arbitrary client-supplied
// medium is collapsed to 'other' so a crafted or misconfigured campaign
// cannot fragment the channel grouping that feeds the admin reporting.
const KNOWN_MEDIUMS = new Set([
	'cpc',
	'ppc',
	'paid',
	'cpm',
	'email',
	'social',
	'paid-social',
	'affiliate',
	'referral',
	'organic',
	'display',
	'video',
	'sms'
])

/**
 * Map an attribution touch to a coarse channel for the admin Touchpoints
 * view / reporting. A click ID is the strongest paid signal.
 */
export function deriveChannel(attribution: Attribution): string {
	if (attribution.gclid || attribution.wbraid || attribution.gbraid) {
		return 'paid_search'
	}
	if (attribution.fbclid) {
		return 'paid_social'
	}
	if (attribution.utmMedium) {
		return KNOWN_MEDIUMS.has(attribution.utmMedium)
			? attribution.utmMedium
			: 'other'
	}
	if (attribution.referrer) {
		return 'referral'
	}
	return 'direct'
}
