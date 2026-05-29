import {
	ArrowRight,
	Calculator,
	Check,
	Clock,
	Code2,
	Settings,
	TrendingUp,
	Zap
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { NewsletterSignup } from '@/components/forms/NewsletterSignup'
import { Button } from '@/components/ui/button'
import { ExitIntentModal } from '@/components/utilities/ExitIntentModal'
import { JsonLd } from '@/components/utilities/JsonLd'
import { ROUTES, TOOL_ROUTES } from '@/lib/constants/routes'
import { SEO_CONFIG } from '@/lib/seo-config'
import { generateLocalBusinessSchema } from '@/lib/seo-utils'

export const metadata: Metadata = {
	title: SEO_CONFIG.home?.title ?? 'Hudson Digital Solutions',
	description:
		SEO_CONFIG.home?.description ??
		'Professional website design for small businesses in Dallas-Fort Worth.',
	openGraph: {
		title: SEO_CONFIG.home?.title ?? 'Hudson Digital Solutions',
		description:
			SEO_CONFIG.home?.description ??
			'Professional website design for small businesses in Dallas-Fort Worth.',
		url: SEO_CONFIG.home?.canonical ?? 'https://hudsondigitalsolutions.com'
	},
	twitter: {
		card: 'summary_large_image',
		title: SEO_CONFIG.home?.title ?? 'Hudson Digital Solutions',
		description:
			SEO_CONFIG.home?.description ??
			'Professional website design for small businesses in Dallas-Fort Worth.'
	},
	alternates: {
		canonical:
			SEO_CONFIG.home?.canonical ?? 'https://hudsondigitalsolutions.com'
	}
}

const websiteOutcomes = [
	{
		trigger: 'Someone Googles your business',
		outcome: 'they find a real website, not a blank space'
	},
	{
		trigger: 'A customer opens it on their phone',
		outcome: 'it looks sharp on every screen'
	},
	{
		trigger: 'Someone wants to reach you',
		outcome: 'the inquiry hits your inbox instantly'
	},
	{
		trigger: 'A customer is ready to book',
		outcome: 'they do it in two taps, any time of day'
	},
	{
		trigger: 'Your hours or prices change',
		outcome: 'you update the site yourself in minutes'
	}
]

// Per-card learn-more links replace the previous repetition of the
// hero / closing "Get My Free Website Plan" CTA inside every card
// (audit #251 — the long CTA appeared 7+ times on the homepage alone
// before this change). Each card now nudges toward the matching
// service section instead of mass-converting.
const solutions = [
	{
		Icon: Code2,
		title: 'A Website That Looks the Part',
		description:
			'A clean, professional design that matches the quality of your work, so first-time visitors trust you before they ever call. Mobile-ready and fast on every device.',
		stat: '1-4 wks',
		statLabel: 'First Delivery',
		ctaLabel: 'See Recent Work',
		ctaHref: ROUTES.SHOWCASE
	},
	{
		Icon: TrendingUp,
		title: 'Found When Customers Search',
		description:
			'Built to show up when people in your area search for what you do. Proper SEO, fast load times, and the local details Google looks for, so your reputation actually gets seen.',
		stat: 'Built in',
		statLabel: 'local SEO',
		ctaLabel: 'Read Our SEO Approach',
		ctaHref: `${ROUTES.SERVICES}#seo`
	},
	{
		Icon: Settings,
		title: 'Yours to Control',
		description:
			'A simple admin panel means you change your hours, prices, photos, and text yourself, in minutes, no developer, no waiting, no invoice.',
		stat: '$0',
		statLabel: 'to make edits',
		ctaLabel: "See What's Included",
		ctaHref: `${ROUTES.SERVICES}#design-build`
	}
]

export default function HomePage() {
	return (
		<div className="min-h-screen bg-background">
			<JsonLd data={generateLocalBusinessSchema()} />
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
								Your business earned the reviews. Now it needs the website.
							</h1>

							<p className="text-lead text-muted-foreground max-w-lg text-balance">
								You&apos;ve got the 5-star ratings and the word-of-mouth. But
								when someone Googles you, there&apos;s no website to send them
								to, or one that doesn&apos;t do you justice. We build small
								businesses a professional website that turns your reputation
								into booked customers.
							</p>

							<div className="flex flex-col sm:flex-row gap-3">
								<Button
									asChild
									variant="accent"
									size="xl"
									trackConversion={true}
								>
									<Link href={ROUTES.CONTACT}>
										Get My Free Website Plan
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
									<Link href={ROUTES.SHOWCASE}>See Recent Work</Link>
								</Button>
							</div>

							{/* Stats */}
							<div className="flex items-center gap-6">
								<div>
									<div className="text-xl font-black text-foreground tabular-nums">
										1-4 wks
									</div>
									<div className="text-xs text-muted-foreground mt-0.5">
										First Delivery
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
										5+ yrs
									</div>
									<div className="text-xs text-muted-foreground mt-0.5">
										Experience
									</div>
								</div>
							</div>
						</div>

						{/* Right — what your website does */}
						<div className="lg:col-span-2">
							<div className="rounded-2xl border border-border/60 bg-surface-raised/40 backdrop-blur-sm overflow-hidden">
								{/* Header */}
								<div className="px-5 py-4 border-b border-border/60">
									<div className="flex items-center gap-2 mb-1">
										<Zap className="w-3.5 h-3.5 text-accent shrink-0" />
										<span className="text-xs font-semibold text-foreground uppercase tracking-widest">
											Everything Your Website Does For You
										</span>
									</div>
									<p className="text-xs text-muted-foreground">
										From the day it goes live
									</p>
								</div>

								{/* Outcome rows */}
								{websiteOutcomes.map(item => (
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
							What You Get
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							A Website That Pulls Its Weight
						</h2>
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

								<h3 className="text-h4 text-foreground mb-3">
									{solution.title}
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
									{solution.description}
								</p>

								<Link
									href={solution.ctaHref}
									className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
								>
									{solution.ctaLabel}
									<ArrowRight className="w-4 h-4" />
								</Link>
							</div>
						))}
					</div>

					<p className="text-sm text-muted-foreground text-center mt-8 max-w-2xl mx-auto">
						Need online booking, payments, or automatic lead follow-up wired in?
						We handle that too, once your site is doing its job.
					</p>
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
								<h3 className="text-h4 text-foreground mb-3 group-hover:text-accent transition-colors">
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

						{/* Website Cost Estimator */}
						<Link href={TOOL_ROUTES.COST_ESTIMATOR} className="group block">
							<div className="h-full flex flex-col p-8 rounded-xl border border-border hover:border-accent/40 transition-colors">
								<div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
									<Calculator className="w-7 h-7 text-accent" />
								</div>
								<h3 className="text-h4 text-foreground mb-3 group-hover:text-accent transition-colors">
									Website Cost Estimator
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

						{/* Performance Savings Calculator */}
						<Link
							href={TOOL_ROUTES.PERFORMANCE_CALCULATOR}
							className="group block"
						>
							<div className="h-full flex flex-col p-8 rounded-xl border border-border hover:border-accent/40 transition-colors">
								<div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
									<Zap className="w-7 h-7 text-accent" />
								</div>
								<h3 className="text-h4 text-foreground mb-3 group-hover:text-accent transition-colors">
									Performance Savings Calculator
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
			<section className="relative py-section px-4 sm:px-6 bg-surface-raised overflow-hidden">
				{/* Soft radial accent for depth — pure CSS, no extra DOM weight */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--color-accent)_12%,transparent),transparent_70%)]"
				/>
				<div className="relative max-w-3xl mx-auto">
					<div className="text-center">
						<div className="inline-flex items-center gap-3 mb-4">
							<span aria-hidden="true" className="h-px w-8 bg-accent/40" />
							<p className="text-xs font-semibold uppercase tracking-widest text-accent">
								Let&apos;s talk
							</p>
							<span aria-hidden="true" className="h-px w-8 bg-accent/40" />
						</div>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							Ready to give your business the website it&apos;s earned?
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							Every month without a real website is another month of customers
							Googling you and finding nothing, or finding a competitor instead.
							Let&apos;s fix that.
						</p>
					</div>

					{/* Primary CTA card — visually contains the action + trust signals */}
					<div className="mt-10 rounded-2xl border border-border bg-background p-6 sm:p-8 shadow-sm">
						<div className="flex flex-col sm:flex-row gap-3 justify-center">
							<Button asChild variant="accent" size="xl" trackConversion={true}>
								<Link href={ROUTES.CONTACT}>
									Get My Free Website Plan
									<ArrowRight className="w-4 h-4" />
								</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								size="xl"
								className="border-2 border-foreground/25 hover:border-accent dark:border-foreground/20"
							>
								<Link href={ROUTES.SHOWCASE}>View Showcase</Link>
							</Button>
						</div>

						<ul
							className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
							role="list"
						>
							<li className="flex items-center gap-1.5">
								<Clock className="w-4 h-4 text-accent" aria-hidden="true" />
								<span>30-minute call</span>
							</li>
							<li className="flex items-center gap-1.5">
								<Check className="w-4 h-4 text-accent" aria-hidden="true" />
								<span>No commitment</span>
							</li>
							<li className="flex items-center gap-1.5">
								<Zap className="w-4 h-4 text-accent" aria-hidden="true" />
								<span>Reply within 2 hours</span>
							</li>
						</ul>
					</div>

					{/* OR divider — tightened per audit #270. Previously full-
					    width tracking-widest lines plus generous gap-4 read as
					    a horizontal rule with a label attached; now narrower
					    line caps and gap-3 nudge the "or" into reading as the
					    soft transition between the two CTAs. */}
					<div
						aria-hidden="true"
						className="mt-10 flex items-center gap-3 max-w-xs mx-auto"
					>
						<span className="h-px flex-1 bg-border/60" />
						<span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
							or
						</span>
						<span className="h-px flex-1 bg-border/60" />
					</div>

					<div className="mt-8">
						<NewsletterSignup dynamic variant="compact" />
					</div>
				</div>
			</section>

			<ExitIntentModal />
		</div>
	)
}
