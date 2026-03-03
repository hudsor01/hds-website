/**
 * Tools Landing Page
 * Showcases all free calculator tools
 */

import {
	ArrowRight,
	Briefcase,
	Calculator,
	Car,
	Code2,
	DollarSign,
	FileSignature,
	FileText,
	Home,
	MessageSquare,
	Receipt,
	Tags,
	TrendingUp,
	Zap
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TOOL_ROUTES } from '@/lib/constants/routes'

export const metadata: Metadata = {
	title: 'Free Business Tools & Calculators | Hudson Digital Solutions',
	description:
		'Free interactive tools for business owners and freelancers. Calculate ROI, generate invoices and contracts, format JSON, analyze performance, and more.',
	openGraph: {
		title: 'Free Business Tools & Calculators',
		description:
			'Interactive tools to help you make data-driven decisions about your website.'
	}
}

const tools = [
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
		cta: 'Calculate ROI'
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
		cta: 'Estimate Cost'
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
		cta: 'Analyze Performance'
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
		cta: 'Calculate Fees'
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
		cta: 'Calculate Payment'
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
		cta: 'Calculate Tip'
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
		cta: 'Generate Paystub'
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
		cta: 'Generate Contract'
	},
	{
		title: 'Invoice Generator',
		description:
			'Create professional invoices with line items, totals, and tax — ready to download as PDF.',
		href: TOOL_ROUTES.INVOICE_GENERATOR,
		Icon: FileText,
		benefits: [
			'Professional invoice layout',
			'Line item support',
			'PDF download ready'
		],
		cta: 'Create Invoice'
	},
	{
		title: 'Proposal Generator',
		description:
			'Create professional project proposals for clients with scope, timeline, and pricing — PDF included.',
		href: TOOL_ROUTES.PROPOSAL_GENERATOR,
		Icon: Briefcase,
		benefits: [
			'Client-ready proposals',
			'Project scope templates',
			'PDF export included'
		],
		cta: 'Create Proposal'
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
		cta: 'Format JSON'
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
		cta: 'Generate Tags'
	},
	{
		title: 'Testimonial Collector',
		description:
			'Generate private collection links to gather client testimonials and manage feedback in one place.',
		href: TOOL_ROUTES.TESTIMONIAL_COLLECTOR,
		Icon: MessageSquare,
		benefits: [
			'Private collection links',
			'Manage client feedback',
			'Shareable testimonial forms'
		],
		cta: 'Collect Testimonials'
	}
]

export default function ToolsPage() {
	return (
		<main className="min-h-screen bg-background">
			{/* Hero Section */}
			<section className="relative overflow-hidden bg-background">
				<div className="container-wide px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20 text-center">
					<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
						Try For Free
					</p>
					<h1 className="text-page-title text-foreground leading-tight text-balance">
						Free Business Tools
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6">
						Make data-driven decisions about your website with our free
						interactive calculators. No credit card required, no signup needed.
					</p>
				</div>
			</section>

			{/* Tools Grid */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{tools.map(tool => (
							<Card
								key={tool.href}
								variant="glassLight"
								size="lg"
								hover={true}
								className="group flex flex-col"
							>
								{/* Icon */}
								<div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
									<tool.Icon className="h-5 w-5 text-accent" />
								</div>

								{/* Content */}
								<h3 className="text-h3 text-foreground mb-3">{tool.title}</h3>

								<p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
									{tool.description}
								</p>

								{/* Benefits */}
								<ul className="mb-6 space-y-2">
									{tool.benefits.map((benefit, index) => (
										<li
											key={index}
											className="flex items-start gap-2 text-sm text-muted-foreground"
										>
											<div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-accent/30 border border-accent/50" />
											{benefit}
										</li>
									))}
								</ul>

								{/* CTA */}
								<Link
									href={tool.href}
									className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
								>
									{tool.cta}
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Trust Signals */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="grid gap-px sm:grid-cols-3 bg-border/30 rounded-2xl overflow-hidden">
						<div className="bg-background px-8 py-10 text-center relative overflow-hidden">
							<div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
							<div className="text-4xl font-black text-accent mb-2 tabular-nums">
								Growing
							</div>
							<div className="text-sm text-muted-foreground">
								Calculations Performed
							</div>
						</div>

						<div className="bg-background px-8 py-10 text-center relative overflow-hidden">
							<div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
							<div className="text-4xl font-black text-accent mb-2 tabular-nums">
								98%
							</div>
							<div className="text-sm text-muted-foreground">Accuracy Rate</div>
						</div>

						<div className="bg-background px-8 py-10 text-center relative overflow-hidden">
							<div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
							<div className="text-4xl font-black text-accent mb-2 tabular-nums">
								100%
							</div>
							<div className="text-sm text-muted-foreground">Free Forever</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-section px-4 sm:px-6">
				<div className="container-wide">
					<div className="relative overflow-hidden rounded-2xl border border-border bg-surface-raised p-10 md:p-16 text-center">
						<div
							className="hero-spotlight absolute inset-0 opacity-60 pointer-events-none"
							aria-hidden="true"
						/>
						<div className="relative z-10">
							<h2 className="text-section-title text-foreground mb-6 max-w-3xl mx-auto text-balance">
								Ready to Take Action?
							</h2>
							<p className="text-lead text-muted-foreground mb-10 max-w-2xl mx-auto">
								These calculators show the potential. Let&apos;s make it
								reality. Schedule a free consultation to discuss your project.
							</p>
							<div className="flex flex-col sm:flex-row gap-3 justify-center">
								<Button
									asChild
									variant="accent"
									size="xl"
									trackConversion={true}
								>
									<Link href="/contact">Schedule Consultation</Link>
								</Button>
								<Button
									asChild
									variant="outline"
									size="xl"
									className="border-2 border-foreground/25 hover:border-accent dark:border-foreground/20"
								>
									<Link href="/services">View Services</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}
