import {
	ArrowRight,
	Award,
	Calculator,
	Check,
	Clock,
	Code2,
	Rocket,
	Settings,
	TrendingUp,
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

const automationItems = [
	{ trigger: 'Lead submits a form', outcome: 'lands in your CRM instantly' },
	{ trigger: 'New client signs on', outcome: 'onboarding sequence fires' },
	{ trigger: 'Booking confirmed', outcome: 'calendar syncs + texts sent' },
	{ trigger: 'Invoice goes overdue', outcome: 'reminder sequence starts' },
	{ trigger: 'Every Monday morning', outcome: 'digest report hits your inbox' }
]

const solutions = [
	{
		Icon: Code2,
		title: 'A Website That Works For You',
		description:
			'Your digital front door, built to capture leads and represent your business professionally. Mobile-ready, fast, and with an admin panel so you can update it without calling a developer.',
		stat: '2–4 wks',
		statLabel: 'to launch'
	},
	{
		Icon: Zap,
		title: 'All Your Tools, Connected',
		description:
			'We link your site to your CRM, payment processor, calendar, and email so data flows automatically. No more copy-pasting between apps or losing leads in the gaps.',
		stat: '20+',
		statLabel: 'tools we connect'
	},
	{
		Icon: Settings,
		title: 'Workflows That Run Themselves',
		description:
			'Follow-up emails, client onboarding, appointment reminders, invoice chasing — all automated. Your business keeps moving even when you step away.',
		stat: '10+ hrs',
		statLabel: 'saved per week'
	}
]

const results = [
	{
		Icon: Rocket,
		metric: '2–4 wks',
		label: 'First delivery',
		period: 'Typical project start'
	},
	{
		Icon: TrendingUp,
		metric: '40+',
		label: 'Projects delivered',
		period: 'Across 3 continents'
	},
	{
		Icon: Award,
		metric: '10+ yrs',
		label: 'Combined experience',
		period: 'Experienced developers'
	},
	{
		Icon: Clock,
		metric: '<24hr',
		label: 'Response time',
		period: 'Monday through Friday'
	}
]

export default function HomePage() {
	return (
		<main className="min-h-screen bg-background">
			{/* ── HERO ──────────────────────────────────────────── */}
			<section className="relative overflow-hidden bg-background">
				<div
					className="absolute inset-0 grid-pattern-subtle dark:grid-pattern-dark pointer-events-none"
					aria-hidden="true"
				/>
				<div
					className="hero-spotlight absolute inset-0 pointer-events-none"
					aria-hidden="true"
				/>

				<div className="relative z-10 container-wide px-4 sm:px-6 lg:px-8 pt-28 pb-16 sm:pt-32 sm:pb-20">
					<div className="grid lg:grid-cols-5 gap-12 xl:gap-16 items-center">
						{/* Left — headline + CTAs */}
						<div className="lg:col-span-3 flex flex-col gap-8">
							<h1 className="text-page-title text-foreground leading-tight text-balance">
								Web Design &amp; Business Automation for Dallas-Fort Worth Small
								Businesses
							</h1>

							<p className="text-lead text-muted-foreground max-w-lg text-balance">
								Most businesses have a website. Few have a system behind it. We
								build your site, connect your tools, and automate the workflows
								that eat your time — from first lead to closed deal. One
								partner, end to end.
							</p>

							<div className="flex flex-col sm:flex-row gap-3">
								<Button
									asChild
									variant="accent"
									size="xl"
									trackConversion={true}
								>
									<Link href={ROUTES.CONTACT}>
										Get a Free Strategy Call
										<ArrowRight className="w-4 h-4" />
									</Link>
								</Button>
								<Button
									asChild
									variant="outline"
									size="xl"
									trackConversion={true}
									className="border-2 border-foreground/25 hover:border-accent dark:border-foreground/20"
								>
									<Link href={TOOL_ROUTES.ROI_CALCULATOR}>
										<Calculator className="w-4 h-4" />
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

						{/* Right — automation feed */}
						<div className="lg:col-span-2">
							<div className="rounded-2xl border border-border/60 bg-surface-raised/40 backdrop-blur-sm overflow-hidden">
								{/* Header */}
								<div className="px-5 py-4 border-b border-border/60">
									<div className="flex items-center gap-2 mb-1">
										<Zap className="w-3.5 h-3.5 text-accent shrink-0" />
										<span className="text-xs font-semibold text-foreground uppercase tracking-widest">
											What Gets Automated
										</span>
									</div>
									<p className="text-xs text-muted-foreground">
										After we wire up your stack
									</p>
								</div>

								{/* Automation rows */}
								{automationItems.map(item => (
									<div
										key={item.trigger}
										className="px-5 py-3.5 border-b border-border/40 last:border-0 flex items-center gap-3"
									>
										<Check className="w-3.5 h-3.5 text-success-text shrink-0" />
										<p className="text-sm leading-snug">
											<span className="text-muted-foreground">
												{item.trigger}
											</span>
											<span className="text-muted-foreground/40 mx-1.5">→</span>
											<span className="text-foreground font-medium">
												{item.outcome}
											</span>
										</p>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ── SOLUTIONS ─────────────────────────────────────── */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							What We Build
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							One Partner. Three Phases. End to End.
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							Most businesses have a website. Few have the system behind it. We
							handle all three layers so nothing falls through the cracks.
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
									Get Started
									<ArrowRight className="w-4 h-4" />
								</Link>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── RESULTS / METRICS ─────────────────────────────── */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							Track Record
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							By the Numbers
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							Real timelines, real experience, real availability — no agency
							fluff.
						</p>
					</div>

					{/* Metric grid — gap-px trick creates 1px dividers */}
					<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/30 rounded-2xl overflow-hidden">
						{results.map(result => (
							<div
								key={result.metric}
								className="bg-background px-8 py-10 text-center relative overflow-hidden"
							>
								<div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
								<div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
									<result.Icon className="w-5 h-5 text-accent" />
								</div>
								<div className="text-4xl lg:text-5xl font-black text-accent mb-2 font-mono tabular-nums">
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
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							Try For Free
						</p>
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
									See how much business you&apos;re leaving on the table with a
									website that doesn&apos;t convert visitors into customers.
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

			{/* ── CLOSING CTA ────────────────────────────────────── */}
			<section className="py-section px-4 sm:px-6 bg-surface-raised">
				<div className="container-wide text-center">
					<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
						Let&apos;s talk
					</p>
					<h2 className="text-section-title text-foreground mb-comfortable max-w-3xl mx-auto text-balance">
						Ready to stop running your business manually?
					</h2>

					<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
						Every week without automation is another week of manual follow-ups,
						missed leads, and time you won&apos;t get back.
					</p>

					<div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
						<Button asChild variant="accent" size="xl" trackConversion={true}>
							<Link href={ROUTES.CONTACT}>
								Get a Free Strategy Call
								<ArrowRight className="w-4 h-4" />
							</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							size="xl"
							className="border-2 border-foreground/25 hover:border-accent dark:border-foreground/20"
						>
							<Link href={ROUTES.SHOWCASE}>See What We&apos;ve Built</Link>
						</Button>
					</div>

					<div className="mt-12">
						<NewsletterSignup dynamic variant="compact" />
					</div>
				</div>
			</section>
		</main>
	)
}
