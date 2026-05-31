/**
 * LocalBusiness JSON-LD schema generator.
 *
 * Builds a schema.org `LocalBusiness` (or subtype) structured-data object
 * from form input and serializes it for pasting into a page <head>.
 *
 * Security: the serialized JSON is meant to live inside a
 * `<script type="application/ld+json">` block, so any value containing
 * `</script>` would otherwise break out of the tag (XSS). serializeSchema
 * escapes `<`, `>`, `&`, U+2028 and U+2029 to their JSON unicode escapes —
 * the same hardening the site's own JsonLd component
 * (src/components/utilities/JsonLd.tsx) applies.
 */

export type LocalBusinessType =
	| 'LocalBusiness'
	| 'ProfessionalService'
	| 'Store'
	| 'Restaurant'
	| 'FoodEstablishment'
	| 'MedicalBusiness'
	| 'HealthAndBeautyBusiness'
	| 'HomeAndConstructionBusiness'
	| 'AutomotiveBusiness'
	| 'LegalService'
	| 'FinancialService'
	| 'EntertainmentBusiness'

interface SchemaAddressInput {
	street?: string
	city?: string
	region?: string
	postalCode?: string
	country?: string
}

interface SchemaGeoInput {
	latitude?: string
	longitude?: string
}

interface OpeningHoursInput {
	days: readonly string[]
	opens: string
	closes: string
}

export interface LocalBusinessInput {
	type?: LocalBusinessType
	name: string
	description?: string
	url?: string
	telephone?: string
	email?: string
	image?: string
	priceRange?: string
	address?: SchemaAddressInput
	geo?: SchemaGeoInput
	openingHours?: readonly OpeningHoursInput[]
	sameAs?: readonly string[]
}

/** Trim a value; return undefined when it is blank. */
function clean(value: string | undefined | null): string | undefined {
	if (typeof value !== 'string') {
		return undefined
	}
	const trimmed = value.trim()
	return trimmed.length > 0 ? trimmed : undefined
}

/**
 * Prepend https:// to a bare domain so URL-typed fields are absolute
 * (Google rejects relative/scheme-less URLs in structured data). Values
 * that already carry a scheme (http:, https:, mailto:, ...) or are
 * protocol-relative (`//cdn...`) are left untouched.
 */
function normalizeUrl(value: string | undefined | null): string | undefined {
	const v = clean(value)
	if (v === undefined) {
		return undefined
	}
	if (/^[a-z][a-z0-9+.-]*:/i.test(v) || v.startsWith('//')) {
		return v
	}
	return `https://${v}`
}

// Decimal-only: a lone optionally-signed integer or decimal. Rejects the
// JS numeric-literal forms Number() would otherwise coerce (hex 0x10,
// binary 0b101, octal 0o17, exponential 1e1) into a plausible-but-wrong
// coordinate.
const COORDINATE_RE = /^[+-]?\d+(\.\d+)?$/

/** Parse a latitude/longitude string into a valid in-range number, else undefined. */
function parseCoordinate(
	value: string | undefined,
	limit: number
): number | undefined {
	const trimmed = clean(value)
	if (trimmed === undefined || !COORDINATE_RE.test(trimmed)) {
		return undefined
	}
	const num = Number(trimmed)
	if (!Number.isFinite(num) || Math.abs(num) > limit) {
		return undefined
	}
	return num
}

function buildAddress(
	address: SchemaAddressInput | undefined
): Record<string, unknown> | undefined {
	if (!address) {
		return undefined
	}
	const streetAddress = clean(address.street)
	const addressLocality = clean(address.city)
	const addressRegion = clean(address.region)
	const postalCode = clean(address.postalCode)
	const addressCountry = clean(address.country)
	if (
		!streetAddress &&
		!addressLocality &&
		!addressRegion &&
		!postalCode &&
		!addressCountry
	) {
		return undefined
	}
	return {
		'@type': 'PostalAddress',
		...(streetAddress ? { streetAddress } : {}),
		...(addressLocality ? { addressLocality } : {}),
		...(addressRegion ? { addressRegion } : {}),
		...(postalCode ? { postalCode } : {}),
		...(addressCountry ? { addressCountry } : {})
	}
}

function buildGeo(
	geo: SchemaGeoInput | undefined
): Record<string, unknown> | undefined {
	if (!geo) {
		return undefined
	}
	const latitude = parseCoordinate(geo.latitude, 90)
	const longitude = parseCoordinate(geo.longitude, 180)
	// Both coordinates must be valid; a lone coordinate is meaningless.
	if (latitude === undefined || longitude === undefined) {
		return undefined
	}
	return { '@type': 'GeoCoordinates', latitude, longitude }
}

function buildOpeningHours(
	hours: readonly OpeningHoursInput[] | undefined
): Array<Record<string, unknown>> | undefined {
	if (!hours || hours.length === 0) {
		return undefined
	}
	const entries = hours
		.map(entry => {
			const days = entry.days.map(d => clean(d)).filter(Boolean) as string[]
			const opens = clean(entry.opens)
			const closes = clean(entry.closes)
			if (days.length === 0 || !opens || !closes) {
				return undefined
			}
			return {
				'@type': 'OpeningHoursSpecification',
				dayOfWeek: days,
				opens,
				closes
			}
		})
		.filter(Boolean) as Array<Record<string, unknown>>
	return entries.length > 0 ? entries : undefined
}

function buildSameAs(
	sameAs: readonly string[] | undefined
): string[] | undefined {
	if (!sameAs) {
		return undefined
	}
	const seen = new Set<string>()
	const urls: string[] = []
	for (const raw of sameAs) {
		const url = clean(raw)
		if (url && !seen.has(url)) {
			seen.add(url)
			urls.push(url)
		}
	}
	return urls.length > 0 ? urls : undefined
}

/**
 * Build the LocalBusiness JSON-LD object. Empty/blank fields are omitted
 * so the output is always minimal and valid. `name` is the only field
 * Google requires; callers should ensure it is present.
 */
export function buildLocalBusinessSchema(
	input: LocalBusinessInput
): Record<string, unknown> {
	const name = clean(input.name)
	const description = clean(input.description)
	const url = normalizeUrl(input.url)
	const telephone = clean(input.telephone)
	const email = clean(input.email)
	const image = normalizeUrl(input.image)
	const priceRange = clean(input.priceRange)
	const address = buildAddress(input.address)
	const geo = buildGeo(input.geo)
	const openingHoursSpecification = buildOpeningHours(input.openingHours)
	const sameAs = buildSameAs(input.sameAs)

	return {
		'@context': 'https://schema.org',
		'@type': input.type || 'LocalBusiness',
		...(name ? { name } : {}),
		...(description ? { description } : {}),
		...(url ? { url } : {}),
		...(telephone ? { telephone } : {}),
		...(email ? { email } : {}),
		...(image ? { image } : {}),
		...(priceRange ? { priceRange } : {}),
		...(address ? { address } : {}),
		...(geo ? { geo } : {}),
		...(openingHoursSpecification ? { openingHoursSpecification } : {}),
		...(sameAs ? { sameAs } : {})
	}
}

// Escape characters that are unsafe inside an inline <script> block. Built
// via RegExp() so the source stays ASCII (TS parses literal U+2028/U+2029
// in a regex literal as line terminators).
const SCRIPT_ESCAPE_RE = /[<>&\u2028\u2029]/g

function escapeForScript(ch: string): string {
	switch (ch.charCodeAt(0)) {
		case 0x3c:
			return '\\u003c'
		case 0x3e:
			return '\\u003e'
		case 0x26:
			return '\\u0026'
		case 0x2028:
			return '\\u2028'
		case 0x2029:
			return '\\u2029'
		default:
			return ch
	}
}

export interface SerializeOptions {
	/** Pretty-print with 2-space indentation. Default true. */
	pretty?: boolean
	/** Wrap the JSON in a `<script type="application/ld+json">` block. Default false. */
	scriptTag?: boolean
}

/**
 * Serialize a schema object to a string safe to paste into HTML. Always
 * escapes `<`, `>`, `&`, U+2028 and U+2029 so a value containing
 * `</script>` cannot break out of an inline script tag.
 */
export function serializeSchema(
	schema: Record<string, unknown>,
	options: SerializeOptions = {}
): string {
	const { pretty = true, scriptTag = false } = options
	const json = JSON.stringify(schema, null, pretty ? 2 : undefined).replace(
		SCRIPT_ESCAPE_RE,
		escapeForScript
	)
	if (!scriptTag) {
		return json
	}
	return `<script type="application/ld+json">\n${json}\n</script>`
}
