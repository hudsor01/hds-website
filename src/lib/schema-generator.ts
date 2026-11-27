/**
 * LocalBusiness JSON-LD schema generator.
 *
 * Builds a schema.org `LocalBusiness` (or subtype) structured-data object
 * from form input and serializes it for pasting into a page <head>.
 *
 * Rules follow Google's LocalBusiness structured data guidelines
 * (developers.google.com/search/docs/appearance/structured-data/local-business):
 * `name` and `address` are required, geo needs at least 5 decimal places,
 * phone numbers should carry the country and area code, priceRange must be
 * shorter than 100 characters and the most specific subtype should be used.
 *
 * Security: the serialized JSON is meant to live inside a
 * `<script type="application/ld+json">` block, so any value containing
 * `</script>` would otherwise break out of the tag (XSS). serializeSchema
 * escapes `<`, `>`, `&`, U+2028 and U+2029 to their JSON unicode escapes,
 * the same hardening the site's own JsonLd component
 * (src/components/utilities/JsonLd.tsx) applies.
 */

/**
 * Supported @type values. Every name is a live schema.org type. The
 * deprecated ProfessionalService and Attorney types are intentionally
 * absent (schema.org points to LegalService instead of Attorney).
 */
export const LOCAL_BUSINESS_TYPES = [
	'LocalBusiness',
	'AutoRepair',
	'AutomotiveBusiness',
	'BeautySalon',
	'DaySpa',
	'Dentist',
	'Electrician',
	'EntertainmentBusiness',
	'FinancialService',
	'FoodEstablishment',
	'HairSalon',
	'HealthAndBeautyBusiness',
	'HomeAndConstructionBusiness',
	'HVACBusiness',
	'LegalService',
	'MedicalBusiness',
	'MedicalClinic',
	'Plumber',
	'RealEstateAgent',
	'Restaurant',
	'RoofingContractor',
	'Store'
] as const

export type LocalBusinessType = (typeof LOCAL_BUSINESS_TYPES)[number]

export const DAYS_OF_WEEK = [
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
	'Sunday'
] as const

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number]

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
	areaServed?: readonly string[]
	sameAs?: readonly string[]
}

export type SchemaField =
	| 'name'
	| 'street'
	| 'city'
	| 'region'
	| 'postalCode'
	| 'country'
	| 'latitude'
	| 'longitude'
	| 'priceRange'

export interface SchemaValidation {
	/** Field problems that block the output. */
	errors: Partial<Record<SchemaField, string>>
	/** Input the output leaves out, shown so nothing is dropped silently. */
	warnings: string[]
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
const COORDINATE_RE = /^([+-]?)(\d+)(?:\.(\d+))?$/

/** Google: "The precision must be at least 5 decimal places." */
const MIN_COORDINATE_DECIMALS = 5

/** Google: priceRange "must be shorter than 100 characters". */
const PRICE_RANGE_MAX_LENGTH = 99

const COUNTRY_RE = /^[A-Za-z]{2}$/

/**
 * A coordinate kept as the text the user typed so serialization does not
 * drop trailing zeros (32.77670 would otherwise print as 32.7767, below
 * Google's 5-decimal minimum). `literal` is a valid JSON number.
 */
class CoordinateLiteral {
	readonly literal: string

	constructor(literal: string) {
		this.literal = literal
	}

	toJSON(): number {
		return Number(this.literal)
	}
}

type CoordinateParse =
	| { ok: true; value: CoordinateLiteral; decimals: number }
	| { ok: false; reason: 'format' | 'range' }

function parseCoordinate(value: string, limit: number): CoordinateParse {
	const match = COORDINATE_RE.exec(value)
	if (!match) {
		return { ok: false, reason: 'format' }
	}
	const [, sign = '', integer = '0', fraction] = match
	if (Math.abs(Number(value)) > limit) {
		return { ok: false, reason: 'range' }
	}
	// JSON forbids a leading "+" and leading zeros, so normalize those.
	const literal = `${sign === '-' ? '-' : ''}${integer.replace(/^0+(?=\d)/, '')}${
		fraction === undefined ? '' : `.${fraction}`
	}`
	return {
		ok: true,
		value: new CoordinateLiteral(literal),
		decimals: fraction?.length ?? 0
	}
}

function coordinateError(
	raw: string | undefined,
	other: string | undefined,
	limit: number,
	label: 'Latitude' | 'Longitude'
): string | undefined {
	const value = clean(raw)
	if (value === undefined) {
		return clean(other) === undefined
			? undefined
			: `Enter the ${label.toLowerCase()} too. Map coordinates need both values.`
	}
	const parsed = parseCoordinate(value, limit)
	if (!parsed.ok) {
		return parsed.reason === 'format'
			? `Enter a single decimal number. Put latitude and longitude in separate fields.`
			: `${label} must be between -${limit} and ${limit}.`
	}
	if (parsed.decimals < MIN_COORDINATE_DECIMALS) {
		return `Google requires at least ${MIN_COORDINATE_DECIMALS} decimal places.`
	}
	return undefined
}

/**
 * Check the input against Google's LocalBusiness requirements. Errors mean
 * the output would be invalid or silently drop what the user typed.
 */
export function validateLocalBusinessInput(
	input: LocalBusinessInput
): SchemaValidation {
	const errors: SchemaValidation['errors'] = {}
	const address = input.address ?? {}

	if (!clean(input.name)) {
		errors.name = 'Google requires the business name.'
	}
	if (!clean(address.street)) {
		errors.street = 'Google requires the street address.'
	}
	if (!clean(address.city)) {
		errors.city = 'Google requires the city.'
	}
	if (!clean(address.region)) {
		errors.region = 'Enter the state or region.'
	}
	if (!clean(address.postalCode)) {
		errors.postalCode = 'Enter the postal code.'
	}
	const country = clean(address.country)
	if (!country) {
		errors.country = 'Enter the 2-letter country code, for example US.'
	} else if (!COUNTRY_RE.test(country)) {
		errors.country = 'Use the 2-letter country code, for example US.'
	}

	const latitudeError = coordinateError(
		input.geo?.latitude,
		input.geo?.longitude,
		90,
		'Latitude'
	)
	if (latitudeError) {
		errors.latitude = latitudeError
	}
	const longitudeError = coordinateError(
		input.geo?.longitude,
		input.geo?.latitude,
		180,
		'Longitude'
	)
	if (longitudeError) {
		errors.longitude = longitudeError
	}

	const priceRange = clean(input.priceRange)
	if (priceRange && priceRange.length > PRICE_RANGE_MAX_LENGTH) {
		errors.priceRange = `Google requires fewer than 100 characters (now ${priceRange.length}).`
	}

	const warnings: string[] = []
	for (const entry of input.openingHours ?? []) {
		const hasDays = entry.days.some(day => clean(day))
		const hasOpens = Boolean(clean(entry.opens))
		const hasCloses = Boolean(clean(entry.closes))
		if (
			(hasDays || hasOpens || hasCloses) &&
			!(hasDays && hasOpens && hasCloses)
		) {
			warnings.push(
				'Opening hours are left out. Pick at least one day and enter both an opening and a closing time.'
			)
		}
	}

	return { errors, warnings }
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
	const addressCountry = clean(address.country)?.toUpperCase()
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
	const latitudeText = clean(geo?.latitude)
	const longitudeText = clean(geo?.longitude)
	if (latitudeText === undefined || longitudeText === undefined) {
		return undefined
	}
	const latitude = parseCoordinate(latitudeText, 90)
	const longitude = parseCoordinate(longitudeText, 180)
	// Both coordinates must be valid; a lone coordinate is meaningless.
	// validateLocalBusinessInput reports why one was rejected.
	if (!latitude.ok || !longitude.ok) {
		return undefined
	}
	return {
		'@type': 'GeoCoordinates',
		latitude: latitude.value,
		longitude: longitude.value
	}
}

function buildOpeningHours(
	hours: readonly OpeningHoursInput[] | undefined
): Array<Record<string, unknown>> | undefined {
	if (!hours || hours.length === 0) {
		return undefined
	}
	const entries: Array<Record<string, unknown>> = []
	for (const entry of hours) {
		const selected = new Set(
			entry.days.map(day => clean(day)).filter((day): day is string => !!day)
		)
		// Week order, whatever order the days were picked in. Anything that
		// is not a schema.org day name is dropped.
		const days = DAYS_OF_WEEK.filter(day => selected.has(day))
		const opens = clean(entry.opens)
		const closes = clean(entry.closes)
		if (days.length === 0 || !opens || !closes) {
			continue
		}
		entries.push({
			'@type': 'OpeningHoursSpecification',
			dayOfWeek: days,
			opens,
			closes
		})
	}
	return entries.length > 0 ? entries : undefined
}

function buildList(
	values: readonly string[] | undefined,
	normalize: (value: string) => string | undefined
): string[] | undefined {
	if (!values) {
		return undefined
	}
	const seen = new Set<string>()
	const list: string[] = []
	for (const raw of values) {
		const value = normalize(raw)
		if (value && !seen.has(value)) {
			seen.add(value)
			list.push(value)
		}
	}
	return list.length > 0 ? list : undefined
}

/**
 * Build the LocalBusiness JSON-LD object. Empty/blank fields are omitted.
 * Google requires `name` and `address`; run validateLocalBusinessInput
 * before showing the output.
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
	const areaServed = buildList(input.areaServed, clean)
	const sameAs = buildList(input.sameAs, normalizeUrl)

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
		...(areaServed ? { areaServed } : {}),
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

// Placeholder for a CoordinateLiteral during JSON.stringify. The
// private-use characters cannot come from the literal itself (digits,
// "-" and "."), and the swap back only matches this exact shape.
const COORDINATE_MARK = '\uE000coord\uE000'
const COORDINATE_PLACEHOLDER_RE = new RegExp(
	`"${COORDINATE_MARK}(-?\\d+(?:\\.\\d+)?)"`,
	'g'
)

export interface SerializeOptions {
	/** Pretty-print with 2-space indentation. Default true. */
	pretty?: boolean
	/** Wrap the JSON in a `<script type="application/ld+json">` block. Default false. */
	scriptTag?: boolean
}

/**
 * Serialize a schema object to a string safe to paste into HTML. Always
 * escapes `<`, `>`, `&`, U+2028 and U+2029 so a value containing
 * `</script>` cannot break out of an inline script tag. Coordinates are
 * written exactly as entered (as JSON numbers).
 */
export function serializeSchema(
	schema: Record<string, unknown>,
	options: SerializeOptions = {}
): string {
	const { pretty = true, scriptTag = false } = options
	// A function (not an arrow) so `this` is the holder: JSON.stringify has
	// already applied toJSON() to `value`, but `this[key]` is the original.
	function keepCoordinateText(
		this: Record<string, unknown>,
		key: string,
		value: unknown
	): unknown {
		const original = this[key]
		return original instanceof CoordinateLiteral
			? `${COORDINATE_MARK}${original.literal}`
			: value
	}
	const json = JSON.stringify(
		schema,
		keepCoordinateText,
		pretty ? 2 : undefined
	)
		.replace(COORDINATE_PLACEHOLDER_RE, '$1')
		.replace(SCRIPT_ESCAPE_RE, escapeForScript)
	if (!scriptTag) {
		return json
	}
	return `<script type="application/ld+json">\n${json}\n</script>`
}
