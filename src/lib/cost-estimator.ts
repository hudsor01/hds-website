/**
 * Website Cost Estimator planning model.
 *
 * Every number here is this tool's own assumption, not market data and
 * not a Hudson Digital quote (each project is priced after scoping it).
 * Pure functions and URL parsers so the page derives the result during
 * render and the math is unit-tested.
 */

import {
	createParser,
	parseAsArrayOf,
	parseAsBoolean,
	parseAsString,
	parseAsStringLiteral
} from 'nuqs'

export const WEBSITE_TYPES = [
	{ value: 'landing-page', label: 'Landing Page', base: 2000, weeks: 4 },
	{
		value: 'business-website',
		label: 'Business Website',
		base: 5000,
		weeks: 4
	},
	{ value: 'e-commerce', label: 'E-Commerce Store', base: 10000, weeks: 8 },
	{ value: 'web-app', label: 'Web Application', base: 15000, weeks: 12 },
	{ value: 'enterprise', label: 'Custom Platform', base: 30000, weeks: 16 }
] as const

export const FEATURES = [
	{ value: 'blog', label: 'Blog/News Section', cost: 1500 },
	{ value: 'contact-forms', label: 'Advanced Contact Forms', cost: 800 },
	{ value: 'payment', label: 'Payment Processing', cost: 3000 },
	{ value: 'user-auth', label: 'User Authentication', cost: 2500 },
	{ value: 'booking', label: 'Booking System', cost: 3500 },
	{ value: 'membership', label: 'Membership Area', cost: 4000 },
	{ value: 'analytics', label: 'Advanced Analytics', cost: 1200 },
	{ value: 'multilingual', label: 'Multi-language Support', cost: 2000 },
	{
		value: 'api-integration',
		label: 'Third-party API Integration',
		cost: 2500
	},
	{ value: 'custom-dashboard', label: 'Custom Dashboard', cost: 5000 }
] as const

export const DESIGN_LEVELS = [
	{ value: 'basic', label: 'Basic template', multiplier: 0.8 },
	{ value: 'standard', label: 'Standard custom design', multiplier: 1 },
	{ value: 'custom', label: 'Fully custom design', multiplier: 1.3 },
	{ value: 'premium', label: 'Premium or luxury design', multiplier: 1.6 }
] as const

export const TIMELINES = [
	{ value: 'normal', label: 'Standard pace' },
	{ value: 'urgent', label: 'Rush (this tool adds 25%)' }
] as const

export type WebsiteType = (typeof WEBSITE_TYPES)[number]['value']
export type Feature = (typeof FEATURES)[number]['value']
export type DesignLevel = (typeof DESIGN_LEVELS)[number]['value']
export type Timeline = (typeof TIMELINES)[number]['value']

const TYPE_VALUES = WEBSITE_TYPES.map(t => t.value)
const FEATURE_VALUES = FEATURES.map(f => f.value)
const DESIGN_VALUES = DESIGN_LEVELS.map(d => d.value)
const TIMELINE_VALUES = TIMELINES.map(t => t.value)

export const MIN_PAGES = 1
export const MAX_PAGES = 100
const INCLUDED_PAGES = 5
const COST_PER_EXTRA_PAGE = 500
const RUSH_MULTIPLIER = 1.25
const RUSH_WEEKS_FACTOR = 0.7
const MAINTENANCE_RATE = 0.15
const RANGE_LOW = 0.8
const RANGE_HIGH = 1.2

const featureListParser = parseAsArrayOf(parseAsStringLiteral(FEATURE_VALUES))

/** Allowlisted, de-duplicated features: unknown values are dropped. */
const featuresParser = createParser<Feature[]>({
	parse: query => {
		const parsed = featureListParser.parse(query)
		return parsed === null ? null : [...new Set(parsed)]
	},
	serialize: values => featureListParser.serialize([...new Set(values)]),
	eq: (a, b) => a.length === b.length && a.every((v, i) => v === b[i])
})

/**
 * URL state. `pages` stays a raw string so the field can be cleared while
 * typing; parsePageCount() validates it.
 */
export const estimatorParsers = {
	type: parseAsStringLiteral(TYPE_VALUES),
	pages: parseAsString.withDefault(String(INCLUDED_PAGES)),
	features: featuresParser.withDefault([]),
	design: parseAsStringLiteral(DESIGN_VALUES).withDefault('standard'),
	timeline: parseAsStringLiteral(TIMELINE_VALUES).withDefault('normal'),
	maint: parseAsBoolean.withDefault(false)
}

/** A whole number from 1 to 100, or null. */
export function parsePageCount(raw: string): number | null {
	const trimmed = raw.trim()
	if (!/^\d+$/.test(trimmed)) {
		return null
	}
	const pages = Number(trimmed)
	return pages >= MIN_PAGES && pages <= MAX_PAGES ? pages : null
}

export interface EstimateInput {
	websiteType: WebsiteType
	pages: number
	features: readonly Feature[]
	design: DesignLevel
	timeline: Timeline
	maintenance: boolean
}

export interface Estimate {
	low: number
	high: number
	midpoint: number
	weeks: number
	/** Null when maintenance is not included */
	annualMaintenance: number | null
	monthlyMaintenance: number | null
}

/**
 * build    = (type base + $500 per page past 5 + features) x design
 * total    = build, x 1.25 for a rush timeline
 * range    = total x 0.8 to total x 1.2
 * upkeep   = 15% of the pre-rush build per year
 */
export function calculateEstimate(input: EstimateInput): Estimate {
	const type = WEBSITE_TYPES.find(t => t.value === input.websiteType)
	const design = DESIGN_LEVELS.find(d => d.value === input.design)
	if (!type || !design) {
		throw new Error(
			`Unknown website type "${input.websiteType}" or design "${input.design}"`
		)
	}
	const features = [...new Set(input.features)]
	const featureCost = features.reduce(
		(sum, value) => sum + (FEATURES.find(f => f.value === value)?.cost ?? 0),
		0
	)
	const extraPages = Math.max(0, input.pages - INCLUDED_PAGES)
	const build =
		(type.base + extraPages * COST_PER_EXTRA_PAGE + featureCost) *
		design.multiplier
	const rush = input.timeline === 'urgent'
	const total = rush ? build * RUSH_MULTIPLIER : build

	const baseWeeks = type.weeks + features.length
	const weeks = rush ? Math.ceil(baseWeeks * RUSH_WEEKS_FACTOR) : baseWeeks

	const annualMaintenance = input.maintenance
		? Math.round(build * MAINTENANCE_RATE)
		: null

	return {
		low: Math.round(total * RANGE_LOW),
		high: Math.round(total * RANGE_HIGH),
		midpoint: Math.round(total),
		weeks,
		annualMaintenance,
		monthlyMaintenance: input.maintenance
			? Math.round((build * MAINTENANCE_RATE) / 12)
			: null
	}
}

const WHOLE_DOLLARS = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
})

export function formatWholeDollars(amount: number): string {
	return WHOLE_DOLLARS.format(amount)
}
