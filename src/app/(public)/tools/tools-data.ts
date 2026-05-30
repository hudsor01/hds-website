import {
	Briefcase,
	Calculator,
	Car,
	Code2,
	DollarSign,
	FileSignature,
	FileText,
	Home,
	Receipt,
	Tags,
	TrendingUp,
	Zap
} from 'lucide-react'
import { TOOL_ROUTES } from '@/lib/constants/routes'

// Not exported: only referenced internally by ToolCategory/ToolEntry below.
// No external module imports it, so keeping it unexported satisfies knip.
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
	}
	// The Testimonial Collector tool is admin-only (gated behind an
	// ADMIN_SECRET bearer). It was de-listed in audit #242 and the
	// route is intentionally left in place so an operator can hit it
	// directly with the token.
] as const
