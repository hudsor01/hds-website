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
			'Your website is a revenue system. See the dollars a higher conversion rate puts in your pocket, with the math laid out so you can trust the number.',
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
			'Pick the features your business needs and get a real ballpark for your site, no sales call required. Same pricing logic I quote DFW clients.',
		href: TOOL_ROUTES.COST_ESTIMATOR,
		Icon: Calculator,
		benefits: [
			'Transparent pricing breakdown',
			'Timeline estimates',
			'Feature-based pricing'
		],
		cta: 'Estimate Cost',
		category: 'website'
	},
	{
		title: 'Performance Savings Calculator',
		description:
			'A slow site quietly bleeds sales. Run real PageSpeed numbers against your traffic and see the revenue a faster site wins back every month.',
		href: TOOL_ROUTES.PERFORMANCE_CALCULATOR,
		Icon: Zap,
		benefits: [
			'Real performance analysis',
			'Revenue impact calculation',
			'Core Web Vitals insights'
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
			'See the full monthly mortgage payment, not the teaser number. Principal, interest, taxes, insurance and PMI broken out so you know what you are signing up for.',
		href: TOOL_ROUTES.MORTGAGE_CALCULATOR,
		Icon: Home,
		benefits: [
			'Principal and interest breakdown',
			'Includes taxes and insurance',
			'PMI calculations'
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
			'Run a clean payroll breakdown with federal and state withholding and the net pay that actually hits the bank. Useful when you are cutting checks yourself.',
		href: TOOL_ROUTES.PAYSTUB_CALCULATOR,
		Icon: DollarSign,
		benefits: [
			'Federal and state tax withholding',
			'Detailed deduction breakdown',
			'Net pay calculation'
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
			'Client paying late? Work out the late fee and total owed on an overdue invoice with a flat fee or a percentage rate per day, week, or month.',
		href: TOOL_ROUTES.INVOICE_LATE_FEE_CALCULATOR,
		Icon: CalendarClock,
		benefits: [
			'Flat or percentage fees',
			'Daily, weekly, or monthly rates',
			'Grace-period support'
		],
		cta: 'Calculate Late Fee',
		category: 'business'
	},
	{
		title: 'Time Card Calculator',
		description:
			'Punch in clock-in and clock-out times with breaks to total the hours, split overtime at 1.5x and get gross pay. Built for running a small crew.',
		href: TOOL_ROUTES.TIME_CARD_CALCULATOR,
		Icon: Clock,
		benefits: [
			'Total daily and weekly hours',
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
