/**
 * Text helpers for the document generators: address lines that never print
 * a stray ", " or " | " when a field is blank, US state names for legal
 * text and safe download file names.
 */

const US_STATES: Record<string, string> = {
	AL: 'Alabama',
	AK: 'Alaska',
	AZ: 'Arizona',
	AR: 'Arkansas',
	CA: 'California',
	CO: 'Colorado',
	CT: 'Connecticut',
	DE: 'Delaware',
	DC: 'the District of Columbia',
	FL: 'Florida',
	GA: 'Georgia',
	HI: 'Hawaii',
	ID: 'Idaho',
	IL: 'Illinois',
	IN: 'Indiana',
	IA: 'Iowa',
	KS: 'Kansas',
	KY: 'Kentucky',
	LA: 'Louisiana',
	ME: 'Maine',
	MD: 'Maryland',
	MA: 'Massachusetts',
	MI: 'Michigan',
	MN: 'Minnesota',
	MS: 'Mississippi',
	MO: 'Missouri',
	MT: 'Montana',
	NE: 'Nebraska',
	NV: 'Nevada',
	NH: 'New Hampshire',
	NJ: 'New Jersey',
	NM: 'New Mexico',
	NY: 'New York',
	NC: 'North Carolina',
	ND: 'North Dakota',
	OH: 'Ohio',
	OK: 'Oklahoma',
	OR: 'Oregon',
	PA: 'Pennsylvania',
	RI: 'Rhode Island',
	SC: 'South Carolina',
	SD: 'South Dakota',
	TN: 'Tennessee',
	TX: 'Texas',
	UT: 'Utah',
	VT: 'Vermont',
	VA: 'Virginia',
	WA: 'Washington',
	WV: 'West Virginia',
	WI: 'Wisconsin',
	WY: 'Wyoming'
}

const DEFAULT_STATE = 'Texas'

/**
 * Full state name for legal text: 'TX' and 'texas' both become 'Texas'.
 * Blank input falls back to Texas (the templates' default); anything else
 * that is not a US state prints as typed.
 */
export function legalStateName(input: string): string {
	const trimmed = input.trim()
	if (!trimmed) {
		return DEFAULT_STATE
	}
	const byCode = US_STATES[trimmed.toUpperCase()]
	if (byCode) {
		return byCode
	}
	const byName = Object.values(US_STATES).find(
		name => name.replace(/^the /, '').toLowerCase() === trimmed.toLowerCase()
	)
	return byName ?? trimmed
}

/** True when the state input means Texas (or is blank, the default). */
export function isTexas(input: string): boolean {
	return legalStateName(input) === DEFAULT_STATE
}

/** 'Dallas, TX 75201' with no stray comma or space when parts are blank. */
export function cityStateZip(city: string, state: string, zip: string): string {
	const cityState = [city.trim(), state.trim()].filter(Boolean).join(', ')
	return [cityState, zip.trim()].filter(Boolean).join(' ')
}

/** Join the non-blank parts with a separator. */
export function joinNonBlank(parts: string[], separator: string): string {
	return parts
		.map(part => part.trim())
		.filter(Boolean)
		.join(separator)
}

/** A file-system-safe slug: 'Acme Co. #4' becomes 'acme_co_4'. */
export function toFileSlug(value: string, fallback: string): string {
	const slug = value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_+|_+$/g, '')
		.slice(0, 60)
	return slug || fallback
}
