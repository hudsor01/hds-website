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
			'Calculate how much additional revenue you could generate by improving your website conversion rate.',
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
			'Get an instant estimate for your website project based on your specific requirements and features.',
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
			'Discover how much revenue you are losing due to slow website performance with real PageSpeed analysis.',
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
			'Generate SEO-optimized meta tags, Open Graph, and Twitter Card markup for your web pages.',
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
			'Build schema.org LocalBusiness JSON-LD structured data so Google understands your business and shows you in local results.',
		href: TOOL_ROUTES.SCHEMA_GENERATOR,
		Icon: MapPin,
		benefits: [
			'Valid schema.org JSON-LD',
			'Address, hours, geo, and social links',
			'Helps you rank in the local pack'
		],
		cta: 'Generate Schema',
		category: 'website'
	},
	{
		title: 'Texas TTL Calculator',
		description:
			'Calculate tax, title, and license fees plus monthly payment estimates for vehicle purchases in Texas.',
		href: TOOL_ROUTES.TTL_CALCULATOR,
		Icon: Car,
		benefits: [
			'Tax, title, and license fees',
			'Monthly payment estimates',
			'Texas-specific calculations'
		],
		cta: 'Calculate Fees',
		category: 'business'
	},
	{
		title: 'Mortgage Calculator',
		description:
			'Calculate your monthly mortgage payment including principal, interest, taxes, insurance, and PMI.',
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
			'Calculate tip amounts and split the bill fairly among multiple people for any dining occasion.',
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
			'Generate detailed payroll breakdowns with federal and state tax calculations and net pay.',
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
			'Enter your cost and selling price to get gross margin, markup, and profit, or find the price for a target margin.',
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
			'Work out the late fee and total owed on an overdue invoice, using a flat fee or a percentage rate per day, week, or month.',
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
			'Add clock-in and clock-out times with breaks to total hours, split overtime, and calculate gross pay.',
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
			'Create professional contracts ready for signature with customizable terms and PDF download.',
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
			'Create professional invoices with line items, totals, and tax, ready to download as PDF.',
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
			'Create professional project proposals for clients with scope, timeline, and pricing. PDF included.',
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
			'Format, validate, and minify JSON data online with syntax error detection and instant feedback.',
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
			'Convert a column of values into a comma-separated series. Paste a spreadsheet column or any space-separated list and get clean, comma-separated output.',
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
			'Count words, characters, sentences, paragraphs, and reading time as you type. Handy for meta descriptions, tweets, and content limits.',
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
