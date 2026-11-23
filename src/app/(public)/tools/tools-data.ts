import {
	Briefcase,
	Calculator,
	CalendarClock,
	Car,
	Clock,
	Code2,
	DollarSign,
	FileSignature,
	FileText,
	Home,
	List,
	MapPin,
	Percent,
	Receipt,
	Tags,
	TrendingUp,
	Type,
	Zap
} from 'lucide-react'
import { TOOL_ROUTES } from '@/lib/constants/routes'

// Not exported: only referenced internally by ToolCategory/ToolEntry below.
// No external module imports it, so it stays unexported (no unused-export noise).
type ToolCategoryId = 'website' | 'business' | 'developers'

export interface ToolCategory {
	id: ToolCategoryId
	title: string
	intro: string
}

/**
 * Display order on the tools index. Audit #262: the grid used to mix
 * website tools, generic personal-finance calculators, vendor
 * paperwork, and a dev utility into one stream so a small business
 * owner looking for ROI had to scroll past a mortgage calculator and
 * a JSON formatter. Categories anchor each block.
 */
export const TOOL_CATEGORIES: readonly ToolCategory[] = [
	{
		id: 'website',
		title: 'For Your Website',
		intro:
			'Calculators that quantify what a better website is worth: revenue, performance, scope, SEO.'
	},
	{
		id: 'business',
		title: 'For Your Business',
		intro:
			'Day-to-day paperwork and personal-finance math you can run without spinning up a separate tool.'
	},
	{
		id: 'developers',
		title: 'For Developers',
		intro: 'Quick utilities that save a round trip to a second tab.'
	}
] as const

export interface ToolEntry {
	title: string
	description: string
	href: string
	Icon: React.ComponentType<{ className?: string }>
	benefits: string[]
	cta: string
	category: ToolCategoryId
}

export const TOOLS: readonly ToolEntry[] = [
	{
		title: 'ROI Calculator',
		description:
			'Your website is a revenue system. Enter your traffic, conversion rate, order value and the relative lift you expect, plus an optional investment to see ROI and payback.',
		href: TOOL_ROUTES.ROI_CALCULATOR,
		Icon: TrendingUp,
		benefits: [
			'See potential revenue increase',
			'Understand conversion impact',
			'Data-driven decision making'
		],
		cta: 'Calculate ROI',
		category: 'website'
	},
	{
		title: 'Website Cost Estimator',
		description:
			'Pick the type, pages and features and get an illustrative planning range, shown beside published market ranges. A planning model, not a quote: I price every project after a free call.',
		href: TOOL_ROUTES.COST_ESTIMATOR,
		Icon: Calculator,
		benefits: [
			'Illustrative planning range',
			'Planning timeline',
			'Published market ranges for context'
		],
		cta: 'Estimate Cost',
		category: 'website'
	},
	{
		title: 'Site Speed Revenue Calculator',
		description:
			'Run a real mobile PageSpeed test, see your score and lab metrics, then model the revenue at stake with a conversion lift you choose.',
		href: TOOL_ROUTES.PERFORMANCE_CALCULATOR,
		Icon: Zap,
		benefits: [
			'Real PageSpeed score',
			'Lab metrics with good thresholds',
			'Revenue scenario you control'
		],
		cta: 'Analyze Performance',
		category: 'website'
	},
	{
		title: 'Meta Tag Generator',
		description:
			'Get the title, description, Open Graph and Twitter Card tags Google and social feeds actually read. Paste them in and your pages stop looking broken when shared.',
		href: TOOL_ROUTES.META_TAG_GENERATOR,
		Icon: Tags,
		benefits: [
			'Open Graph markup',
			'Twitter Card support',
			'SEO meta tag preview'
		],
		cta: 'Generate Tags',
		category: 'website'
	},
	{
		title: 'LocalBusiness Schema Generator',
		description:
			'Build the schema.org JSON-LD that tells Google what your business is and where it is. This is the markup I use to land DFW clients in the local pack.',
		href: TOOL_ROUTES.SCHEMA_GENERATOR,
		Icon: MapPin,
		benefits: [
			'Valid schema.org JSON-LD',
			'Address, hours, geo, social links',
			'Helps you rank in the local pack'
		],
		cta: 'Generate Schema',
		category: 'website'
	},
	{
		title: 'Texas TTL Calculator',
		description:
			'Buying a vehicle in Texas? Get the tax, title and license fees plus a monthly payment estimate before you sit down at the dealer.',
		href: TOOL_ROUTES.TTL_CALCULATOR,
		Icon: Car,
		benefits: [
			'Tax, title, license fees',
			'Monthly payment estimates',
			'Texas-specific calculations'
		],
		cta: 'Calculate Fees',
		category: 'business'
	},
	{
		title: 'Mortgage Calculator',
		description:
			'See the full monthly mortgage payment, not the teaser number. Conventional, FHA, VA or USDA, with taxes, insurance, PMI or fees, cash to close and extra payments broken out.',
		href: TOOL_ROUTES.MORTGAGE_CALCULATOR,
		Icon: Home,
		benefits: [
			'Conventional, FHA, VA and USDA loans',
			'Cash to close and PMI drop-off',
			'Extra payments and payoff date'
		],
		cta: 'Calculate Payment',
		category: 'business'
	},
	{
		title: 'Tip Calculator',
		description:
			'Figure the tip and split the check evenly across the table. Set the percentage, set the headcount, get the per-person number.',
		href: TOOL_ROUTES.TIP_CALCULATOR,
		Icon: Receipt,
		benefits: [
			'Split bills fairly',
			'Custom tip percentages',
			'Per-person amounts'
		],
		cta: 'Calculate Tip',
		category: 'business'
	},
	{
		title: 'Paystub Calculator',
		description:
			'Run a 2026 payroll breakdown with W-4 based federal withholding, 401(k) and health deductions, state tax and the net pay that actually hits the bank. Useful when you are cutting checks yourself.',
		href: TOOL_ROUTES.PAYSTUB_CALCULATOR,
		Icon: DollarSign,
		benefits: [
			'IRS payroll method with your 2026 W-4',
			'Pre-tax 401(k) and health premiums',
			'CA, NY, IL, PA and MA payroll formulas'
		],
		cta: 'Generate Paystub',
		category: 'business'
	},
	{
		title: 'Profit Margin & Markup Calculator',
		description:
			'Drop in your cost and price to see gross margin, markup and profit per sale. Or work it backward and find the price that hits the margin you want.',
		href: TOOL_ROUTES.PROFIT_MARGIN_CALCULATOR,
		Icon: Percent,
		benefits: [
			'Gross margin and markup',
			'Profit per sale',
			'Price for a target margin'
		],
		cta: 'Calculate Margin',
		category: 'business'
	},
	{
		title: 'Invoice Late Fee Calculator',
		description:
			'Client paying late? Work out the late fee and total owed on an overdue invoice with a flat fee or a percentage rate per day, week or month.',
		href: TOOL_ROUTES.INVOICE_LATE_FEE_CALCULATOR,
		Icon: CalendarClock,
		benefits: [
			'Flat or percentage fees',
			'Daily, weekly or monthly rates',
			'Grace-period support'
		],
		cta: 'Calculate Late Fee',
		category: 'business'
	},
	{
		title: 'Time Card Calculator',
		description:
			'Enter one workweek of clock-in and clock-out times with unpaid meal breaks to total the hours, split overtime at 1.5x under the federal weekly rule and get gross pay.',
		href: TOOL_ROUTES.TIME_CARD_CALCULATOR,
		Icon: Clock,
		benefits: [
			'Daily hours and the weekly total',
			'Overtime split at 1.5x',
			'Optional gross pay'
		],
		cta: 'Total My Hours',
		category: 'business'
	},
	{
		title: 'Contract Generator',
		description:
			'Put together a clean contract you can send for signature today. Set your own terms and download the PDF. No legal-template subscription to cancel later.',
		href: TOOL_ROUTES.CONTRACT_GENERATOR,
		Icon: FileSignature,
		benefits: [
			'Professional contract templates',
			'Downloadable PDF output',
			'Customizable terms'
		],
		cta: 'Generate Contract',
		category: 'business'
	},
	{
		title: 'Invoice Generator',
		description:
			'Build a sharp invoice with line items, tax and totals, then download the PDF and send it. Get paid faster without paying for billing software.',
		href: TOOL_ROUTES.INVOICE_GENERATOR,
		Icon: FileText,
		benefits: [
			'Professional invoice layout',
			'Line item support',
			'PDF download ready'
		],
		cta: 'Create Invoice',
		category: 'business'
	},
	{
		title: 'Proposal Generator',
		description:
			'Send a proposal that closes. Lay out scope, timeline and pricing in a clean PDF clients can read and approve fast.',
		href: TOOL_ROUTES.PROPOSAL_GENERATOR,
		Icon: Briefcase,
		benefits: [
			'Client-ready proposals',
			'Project scope templates',
			'PDF export included'
		],
		cta: 'Create Proposal',
		category: 'business'
	},
	{
		title: 'JSON Formatter',
		description:
			'Format, validate and minify JSON right in the browser. It points to the exact line that broke so you stop guessing where the syntax error is.',
		href: TOOL_ROUTES.JSON_FORMATTER,
		Icon: Code2,
		benefits: [
			'Format and validate JSON',
			'Minify for production',
			'Syntax error detection'
		],
		cta: 'Format JSON',
		category: 'developers'
	},
	{
		title: 'Comma Separator',
		description:
			'Paste a spreadsheet column or any list and get a clean comma-separated string back. Add quotes, drop duplicates, copy it where you need it.',
		href: TOOL_ROUTES.COMMA_SEPARATOR,
		Icon: List,
		benefits: [
			'Spreadsheet column to comma-separated series',
			'Optional single or double quotes',
			'Remove duplicate items'
		],
		cta: 'Separate List',
		category: 'developers'
	},
	{
		title: 'Word & Character Counter',
		description:
			'Counts words, characters, sentences, paragraphs and reading time as you type. Handy for hitting meta description limits, post lengths and content caps.',
		href: TOOL_ROUTES.WORD_COUNTER,
		Icon: Type,
		benefits: [
			'Live word and character counts',
			'Sentence and paragraph counts',
			'Reading-time estimate'
		],
		cta: 'Count Words',
		category: 'developers'
	}
	// The Testimonial Collector tool is admin-only (gated behind an
	// ADMIN_SECRET bearer). It was de-listed in audit #242 and the
	// route is intentionally left in place so an operator can hit it
	// directly with the token.
] as const
