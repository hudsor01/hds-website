import {
	ArrowRight,
	BarChart3,
	Calculator,
	Check,
	Code2,
	Rocket,
	Settings,
	TrendingUp,
	X,
	Zap
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { NewsletterSignup } from '@/components/forms/NewsletterSignup'
import { Button } from '@/components/ui/button'
import { ROUTES, TOOL_ROUTES } from '@/lib/constants/routes'
import { SEO_CONFIG } from '@/utils/seo'

export const metadata: Metadata = {
	title: SEO_CONFIG.home?.title ?? 'Hudson Digital Solutions',
	description:
		SEO_CONFIG.home?.description ??
		'Custom web development with proven ROI results.',
	keywords: SEO_CONFIG.home?.keywords,
	openGraph: {
		title: SEO_CONFIG.home?.title ?? 'Hudson Digital Solutions',
		description:
			SEO_CONFIG.home?.description ??
			'Custom web development with proven ROI results.',
		url: SEO_CONFIG.home?.canonical ?? 'https://hudsondigitalsolutions.com',
		images: SEO_CONFIG.home?.ogImage
			? [{ url: SEO_CONFIG.home.ogImage, alt: SEO_CONFIG.home.title }]
			: []
	},
	twitter: {
		card: 'summary_large_image',
		title: SEO_CONFIG.home?.title ?? 'Hudson Digital Solutions',
		description:
			SEO_CONFIG.home?.description ??
			'Custom web development with proven ROI results.',
		images: SEO_CONFIG.home?.ogImage ? [SEO_CONFIG.home.ogImage] : []
	},
	alternates: {
		canonical:
			SEO_CONFIG.home?.canonical ?? 'https://hudsondigitalsolutions.com'
	}
}

const comparisonRows = [
	{ bad: '3–6 month timelines', good: '2–4 week delivery' },
	{ bad: '$15k+/mo hiring cost', good: '60% less overhead' },
	{ bad: 'Technical debt piles up', good: 'Clean architecture' },
	{ bad: 'Features ship late', good: 'Ships on schedule' },
	{ bad: 'Junior dev oversight', good: '10+ yr engineers' }
]

const solutions = [
	{
		Icon: Code2,
		title: 'Ship Features Faster',
		description:
			'Launch new features in days, not months. We handle the entire technical stack — React/Next.js, API architecture, and 99.9% uptime.',
		stat: '3×',
		statLabel: 'faster delivery'
	},
	{
		Icon: Settings,
		title: 'Fix Revenue Leaks',
		description:
			'Stop losing leads to broken processes. Automate everything that slows you down — CRM integration, lead scoring, real-time analytics.',
		stat: '60%',
		statLabel: 'cost reduction'
	},
	{
		Icon: BarChart3,
		title: 'Scale Without Breaking',
		description:
			'Handle 10× growth without rebuilding. We future-proof your tech from day one — performance audits, infrastructure planning, cost optimisation.',
		stat: '10×',
		statLabel: 'growth ready'
	}
]

const results = [
	{
		metric: '2–4 wks',
		label: 'First delivery',
		period: 'Typical project start'
	},
	{ metric: '40+', label: 'Projects delivered', period: 'Across 3 continents' },
	{
		metric: '10+ yrs',
		label: 'Combined experience',
		period: 'Senior engineers only'
	},
	{ metric: '24/7', label: 'Support available', period: 'When you need us' }
]

export default function HomePage() {
	return (
		<main className="min-h-screen bg-background">
			{/* ── HERO ──────────────────────────────────────────── */}
			<section className="relative flex min-h-[90vh] items-center overflow-hidden bg-background-dark">
				<div
					className="absolute inset-0 grid-pattern-dark pointer-events-none"
					aria-hidden="true"
				/>
				<div
					className="hero-spotlight absolute inset-0 pointer-events-none"
					aria-hidden="true"
				/>
				<div
					className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none"
					aria-hidden="true"
				/>

				<div className="relative z-10 container-wide px-4 sm:px-6 lg:px-8 py-24">
					<div className="grid lg:grid-cols-5 gap-12 xl:gap-16 items-center">
						{/* Left — headline + CTAs */}
						<div className="lg:col-span-3 flex flex-col gap-8">
							{/* Availability badge */}
							<div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-border/50 bg-muted/10 text-sm text-muted-foreground w-fit">
								<span className="relative flex h-2 w-2 shrink-0">
									<span className="animate-ping absolute h-full w-full rounded-full bg-accent opacity-75" />
									<span className="relative flex h-2 w-2 rounded-full bg-accent" />
								</span>
								Limited availability — 3 project spots open for Q1 2026
							</div>

							<h1 className="text-page-title text-foreground leading-tight text-balance">
								Stop Losing Revenue to Technical Bottlenecks
							</h1>

							<p className="text-lead text-muted-foreground max-w-lg text-balance">
								Senior engineering team that eliminates your technical debt,
								ships features in weeks, and scales your stack — without the
								hiring headaches.
							</p>

							<div className="flex flex-col sm:flex-row gap-3">
								<Button
									asChild
									variant="accent"
									size="xl"
									trackConversion={true}
								>
									<Link href={ROUTES.CONTACT}>
										Get Your Free Roadmap
										<ArrowRight className="w-4 h-4" />
									</Link>
								</Button>
								<Button
									asChild
									variant="ghost"
									size="xl"
									trackConversion={true}
									className="text-foreground border border-border/50 hover:bg-muted/20 hover:border-border"
								>
									<Link href={TOOL_ROUTES.ROI_CALCULATOR}>
										Calculate Your Savings
									</Link>
								</Button>
							</div>

							{/* Stats */}
							<div className="flex items-center gap-6">
								<div>
									<div className="text-xl font-black text-foreground tabular-nums">
										2–4 wks
									</div>
									<div className="text-xs text-muted-foreground mt-0.5">
										First delivery
									</div>
								</div>
								<div className="w-px h-8 bg-border/40" />
								<div>
									<div className="text-xl font-black text-foreground tabular-nums">
										40+
									</div>
									<div className="text-xs text-muted-foreground mt-0.5">
										Projects delivered
									</div>
								</div>
								<div className="w-px h-8 bg-border/40" />
								<div>
									<div className="text-xl font-black text-foreground tabular-nums">
										10+ yrs
									</div>
									<div className="text-xs text-muted-foreground mt-0.5">
										Experience
									</div>
								</div>
							</div>
						</div>

						{/* Right — before/after comparison panel */}
						<div className="lg:col-span-2">
							<div className="rounded-2xl border border-border/60 bg-surface-raised/40 backdrop-blur-sm overflow-hidden">
								{/* Column headers */}
								<div className="grid grid-cols-2 border-b border-border/60">
									<div className="px-5 py-3 border-r border-border/60 flex items-center gap-2">
										<X className="w-3.5 h-3.5 text-red-400 shrink-0" />
										<span className="text-xs font-semibold text-red-400 uppercase tracking-widest">
											Without us
										</span>
									</div>
									<div className="px-5 py-3 flex items-center gap-2">
										<Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
										<span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
											With us
										</span>
									</div>
								</div>

								{/* Comparison rows */}
								{comparisonRows.map(row => (
									<div
										key={row.bad}
										className="grid grid-cols-2 border-b border-border/40 last:border-0"
									>
										<div className="px-5 py-3.5 border-r border-border/40 flex items-center gap-2">
											<X className="w-3 h-3 text-red-400/50 shrink-0" />
											<span className="text-sm text-red-400/70">{row.bad}</span>
										</div>
										<div className="px-5 py-3.5 flex items-center gap-2">
											<Check className="w-3 h-3 text-emerald-400 shrink-0" />
											<span className="text-sm text-emerald-400/90">
												{row.good}
											</span>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ── SOLUTIONS ─────────────────────────────────────── */}
			<section className="py-section px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-16">
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							How We Solve Your Biggest Problems
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							Three focused ways we turn technical struggles into competitive
							advantages.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-6">
						{solutions.map(solution => (
							<div
								key={solution.title}
								className="group flex flex-col p-8 rounded-xl bg-surface-raised border border-border hover:border-border-strong transition-colors"
							>
								{/* Icon + stat row */}
								<div className="flex items-start justify-between mb-6">
									<div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
										<solution.Icon className="w-5 h-5 text-accent" />
									</div>
									<div className="text-right">
										<div className="text-2xl font-black text-foreground tabular-nums">
											{solution.stat}
										</div>
										<div className="text-xs text-muted-foreground">
											{solution.statLabel}
										</div>
									</div>
								</div>

								<h3 className="text-h3 text-foreground mb-3">
									{solution.title}
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
									{solution.description}
								</p>

								<Link
									href={ROUTES.CONTACT}
									className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
								>
									Get started
									<ArrowRight className="w-4 h-4" />
								</Link>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── RESULTS / METRICS ─────────────────────────────── */}
			<section className="py-section px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-16">
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							Proven Impact
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							Every engagement is measured. Here&apos;s what our clients see.
						</p>
					</div>

					{/* Metric grid — gap-px trick creates 1px dividers */}
					<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/30 rounded-2xl overflow-hidden">
						{results.map(result => (
							<div
								key={result.metric}
								className="bg-background px-8 py-12 text-center"
							>
								<div className="text-4xl lg:text-5xl font-black text-foreground mb-2 font-mono tabular-nums">
									{result.metric}
								</div>
								<div className="text-sm font-semibold text-foreground mb-1">
									{result.label}
								</div>
								<div className="text-xs text-muted-foreground">
									{result.period}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── FREE TOOLS ──────────────────────────────────────── */}
			<section className="py-section px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-16">
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							Free Business Tools
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							Calculate your potential in 60 seconds. No signup required.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-6">
						{/* ROI Calculator */}
						<Link href={TOOL_ROUTES.ROI_CALCULATOR} className="group block">
							<div className="h-full flex flex-col p-8 rounded-xl border border-border hover:border-accent/40 transition-colors">
								<div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
									<TrendingUp className="w-7 h-7 text-accent" />
								</div>
								<h3 className="text-h3 text-foreground mb-3 group-hover:text-accent transition-colors">
									ROI Calculator
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
									See how much revenue you&apos;re leaving on the table with
									poor conversion rates and technical bottlenecks.
								</p>
								<div className="flex items-center gap-1.5 text-sm font-semibold text-accent">
									Try Calculator
									<ArrowRight className="w-4 h-4" />
								</div>
							</div>
						</Link>

						{/* Cost Estimator */}
						<Link href={TOOL_ROUTES.COST_ESTIMATOR} className="group block">
							<div className="h-full flex flex-col p-8 rounded-xl border border-border hover:border-accent/40 transition-colors">
								<div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
									<Calculator className="w-7 h-7 text-accent" />
								</div>
								<h3 className="text-h3 text-foreground mb-3 group-hover:text-accent transition-colors">
									Cost Estimator
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
									Get instant transparent pricing for your project based on
									features, scope, and complexity.
								</p>
								<div className="flex items-center gap-1.5 text-sm font-semibold text-accent">
									Get Estimate
									<ArrowRight className="w-4 h-4" />
								</div>
							</div>
						</Link>

						{/* Performance Analyzer */}
						<Link
							href={TOOL_ROUTES.PERFORMANCE_CALCULATOR}
							className="group block"
						>
							<div className="h-full flex flex-col p-8 rounded-xl border border-border hover:border-accent/40 transition-colors">
								<div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
									<Zap className="w-7 h-7 text-accent" />
								</div>
								<h3 className="text-h3 text-foreground mb-3 group-hover:text-accent transition-colors">
									Performance Analyzer
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
									Discover how much revenue slow load times are costing you
									every single month.
								</p>
								<div className="flex items-center gap-1.5 text-sm font-semibold text-accent">
									Analyze Site
									<ArrowRight className="w-4 h-4" />
								</div>
							</div>
						</Link>
					</div>

					<div className="text-center mt-10">
						<Link
							href="/tools"
							className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
						>
							View all tools
							<ArrowRight className="w-4 h-4" />
						</Link>
					</div>
				</div>
			</section>

			{/* ── NEWSLETTER ──────────────────────────────────────── */}
			<section className="py-section-sm px-4">
				<div className="container-wide max-w-4xl mx-auto">
					<NewsletterSignup
						dynamic
						variant="inline"
						title="Get Weekly Tech Insights"
						description="Get weekly insights on scaling engineering teams, technical leadership, and development efficiency. No spam, unsubscribe anytime."
					/>
				</div>
			</section>

			{/* ── FINAL CTA ───────────────────────────────────────── */}
			<section className="py-section px-4 sm:px-6">
				<div className="container-wide">
					<div className="relative overflow-hidden rounded-2xl border border-border bg-surface-raised p-16 md:p-24 text-center">
						{/* Subtle amber glow from top */}
						<div
							className="hero-spotlight absolute inset-0 opacity-60 pointer-events-none"
							aria-hidden="true"
						/>

						<div className="relative z-10">
							<div className="w-16 h-16 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-8">
								<Rocket className="w-8 h-8 text-accent" />
							</div>

							<h2 className="text-section-title text-foreground mb-6 max-w-3xl mx-auto text-balance">
								Your competitors ship faster. Why don&apos;t you?
							</h2>

							<p className="text-lead text-muted-foreground mb-10 max-w-2xl mx-auto">
								Every day you wait is revenue lost. Get a custom roadmap to 10×
								your technical velocity in our free 30-minute strategy call.
							</p>

							<div className="flex flex-col sm:flex-row gap-3 justify-center">
								<Button
									asChild
									variant="accent"
									size="xl"
									trackConversion={true}
								>
									<Link href={ROUTES.CONTACT}>
										Get Your Free Roadmap
										<ArrowRight className="w-4 h-4" />
									</Link>
								</Button>
								<Button
									asChild
									variant="ghost"
									size="xl"
									trackConversion={true}
									className="border border-border/50 hover:bg-muted/20 hover:border-border"
								>
									<Link href={ROUTES.PORTFOLIO}>See Proven Results First</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}
