import {
	ArrowRight,
	BarChart3,
	Calculator,
	Code2,
	Rocket,
	Settings,
	TrendingUp,
	Zap
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { NewsletterSignup } from '@/components/forms/NewsletterSignup'
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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

export default function HomePage() {
	const results = [
		{ metric: 'Fast', label: 'Delivery Timeline', period: '2-4 weeks typical' },
		{ metric: 'Proven', label: 'Track Record', period: 'Real client results' },
		{
			metric: 'Expert',
			label: 'Development Team',
			period: '10+ years experience'
		},
		{ metric: '24/7', label: 'Support Available', period: 'When you need us' }
	]

	return (
		<main className="min-h-screen bg-background">
			{/* Hero Section */}
			<section className="relative flex items-center justify-center px-4 sm:px-6 py-section bg-background-dark">
				{/* Static grid texture — no gradient, no animation */}
				<div
					className="absolute inset-0 grid-pattern-minimal pointer-events-none"
					aria-hidden="true"
				/>

				<div className="relative container-narrow text-center">
					<h1 className="text-page-title text-[var(--color-foreground-dark)] leading-tight mb-comfortable text-balance">
						Stop Losing Revenue to Technical Bottlenecks
					</h1>

					<p className="text-lead text-[var(--color-muted-foreground-dark)] mb-content-block max-w-2xl mx-auto text-balance">
						We build and scale your technical operations in weeks, not months.
						No hiring delays. No training costs. Just proven senior talent ready
						to execute.
					</p>

					<div className="flex flex-col sm:flex-row gap-comfortable justify-center">
						<Button asChild variant="accent" size="xl" trackConversion={true}>
							<Link href={ROUTES.CONTACT}>
								See Your ROI in 30 Days
								<ArrowRight className="w-5 h-5" />
							</Link>
						</Button>
						<Button
							asChild
							variant="ghost"
							size="xl"
							trackConversion={true}
							className="text-[var(--color-foreground-dark)] border border-white/20 hover:bg-white/10 hover:border-white/30 hover:text-white"
						>
							<Link href={TOOL_ROUTES.ROI_CALCULATOR}>
								Calculate Your Savings
								<ArrowRight className="w-5 h-5" />
							</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Solutions Section */}
			<section className="py-section px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-content-block">
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							How We Solve Your Biggest Problems
						</h2>
						<p className="text-lead text-muted-foreground max-w-3xl mx-auto">
							Three ways we help businesses go from struggling to scaling.
						</p>
					</div>

					<BentoGrid className="auto-rows-auto">
						<BentoCard
							name="Ship Features Faster"
							description="Launch new features in days, not months. We handle the entire technical stack — React/Next.js, API architecture, and 99.9% uptime."
							Icon={Code2}
							href={ROUTES.CONTACT}
							cta="Get Started"
							background={
								<div className="absolute inset-0" aria-hidden="true" />
							}
							className="col-span-3 md:col-span-2 bg-card border border-border shadow-md"
						/>
						<BentoCard
							name="Fix Revenue Leaks"
							description="Stop losing leads to broken processes. Automate everything that slows you down — CRM integration, lead scoring, real-time analytics."
							Icon={Settings}
							href={ROUTES.CONTACT}
							cta="Learn More"
							background={
								<div className="absolute inset-0" aria-hidden="true" />
							}
							className="col-span-3 md:col-span-1 bg-card border border-border shadow-md"
						/>
						<BentoCard
							name="Scale Without Breaking"
							description="Handle 10x growth without rebuilding. We future-proof your tech from day one — performance audits, infrastructure planning, cost optimization."
							Icon={BarChart3}
							href={ROUTES.CONTACT}
							cta="See How"
							background={
								<div className="absolute inset-0" aria-hidden="true" />
							}
							className="col-span-3 bg-card border border-border shadow-md"
						/>
					</BentoGrid>
				</div>
			</section>

			{/* Results Section */}
			<section className="py-section px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-content-block">
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							Proven Impact
						</h2>

						<p className="text-lead text-muted-foreground max-w-3xl mx-auto">
							Numbers don&apos;t lie - our clients see measurable results that
							transform their businesses
						</p>
					</div>

					<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-sections lg:gap-10">
						{results.map((result, index) => (
							<div key={index} className="text-center">
								<Card
									variant="glassLight"
									size="lg"
									className="relative border border-accent/20 hover:border-accent/40 transition-smooth lg:p-10"
								>
									<div className="mb-heading">
										<div className="text-4xl lg:text-5xl font-black text-foreground mb-subheading font-mono">
											{result.metric}
										</div>
									</div>

									<div className="text-lg font-bold text-muted-foreground mb-3">
										{result.label}
									</div>

									<div className="text-sm text-muted-foreground font-medium px-3 py-1 bg-muted/50 rounded-full border border-border/50">
										{result.period}
									</div>
								</Card>
							</div>
						))}
					</div>

					<div className="text-center mt-16 pt-8 border-t border-border/30">
						<p className="text-muted-foreground text-sm font-medium">
							Join growing businesses who transformed with Hudson Digital
							Solutions
						</p>
					</div>
				</div>
			</section>

			{/* Free Tools Section */}
			<section className="py-section px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-content-block">
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							Free Business Tools
						</h2>

						<p className="text-lead text-muted-foreground max-w-3xl mx-auto">
							Calculate your potential in 60 seconds. No signup required.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-sections">
						{/* ROI Calculator */}
						<Link href={TOOL_ROUTES.ROI_CALCULATOR} className="group block">
							<Card
								variant="glassLight"
								size="lg"
								className="relative border border-accent/20 hover:border-accent/40 transition-smooth"
							>
								<div className="mb-content-block">
									<div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-heading">
										<TrendingUp className="w-8 h-8 text-accent" />
									</div>
									<h3 className="text-h3 text-foreground mb-subheading group-hover:text-accent transition-colors">
										ROI Calculator
									</h3>
									<p className="text-muted-foreground text-sm mb-heading">
										See how much revenue you&apos;re leaving on the table with
										poor conversion rates
									</p>
								</div>

								<ul className="space-y-tight mb-content-block">
									<li className="flex items-center gap-tight text-sm text-secondary-foreground">
										<div className="w-1.5 h-1.5 rounded-full bg-accent" />
										Calculate potential revenue increase
									</li>
									<li className="flex items-center gap-tight text-sm text-secondary-foreground">
										<div className="w-1.5 h-1.5 rounded-full bg-accent" />
										Understand conversion impact
									</li>
									<li className="flex items-center gap-tight text-sm text-secondary-foreground">
										<div className="w-1.5 h-1.5 rounded-full bg-accent" />
										Make data-driven decisions
									</li>
								</ul>

								<div className="flex items-center gap-tight text-accent font-semibold">
									<span>Try Calculator</span>
									<ArrowRight className="w-5 h-5" aria-hidden="true" />
								</div>
							</Card>
						</Link>

						{/* Cost Estimator */}
						<Link href={TOOL_ROUTES.COST_ESTIMATOR} className="group block">
							<Card
								variant="glassLight"
								size="lg"
								className="relative border border-accent/20 hover:border-accent/40 transition-smooth"
							>
								<div className="mb-content-block">
									<div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-heading">
										<Calculator className="w-8 h-8 text-accent" />
									</div>
									<h3 className="text-h3 text-foreground mb-subheading group-hover:text-accent transition-colors">
										Cost Estimator
									</h3>
									<p className="text-muted-foreground text-sm mb-heading">
										Get instant pricing for your website project based on
										features and complexity
									</p>
								</div>

								<ul className="space-y-tight mb-content-block">
									<li className="flex items-center gap-tight text-sm text-secondary-foreground">
										<div className="w-1.5 h-1.5 rounded-full bg-accent" />
										Transparent pricing breakdown
									</li>
									<li className="flex items-center gap-tight text-sm text-secondary-foreground">
										<div className="w-1.5 h-1.5 rounded-full bg-accent" />
										Timeline estimates included
									</li>
									<li className="flex items-center gap-tight text-sm text-secondary-foreground">
										<div className="w-1.5 h-1.5 rounded-full bg-accent" />
										Feature-based pricing
									</li>
								</ul>

								<div className="flex items-center gap-tight text-accent font-semibold">
									<span>Get Estimate</span>
									<ArrowRight className="w-5 h-5" aria-hidden="true" />
								</div>
							</Card>
						</Link>

						{/* Performance Calculator */}
						<Link
							href={TOOL_ROUTES.PERFORMANCE_CALCULATOR}
							className="group block"
						>
							<Card
								variant="glassLight"
								size="lg"
								className="relative border border-accent/20 hover:border-accent/40 transition-smooth"
							>
								<div className="mb-content-block">
									<div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-heading">
										<Zap className="w-8 h-8 text-accent" />
									</div>
									<h3 className="text-h3 text-foreground mb-subheading group-hover:text-accent transition-colors">
										Performance Analyzer
									</h3>
									<p className="text-muted-foreground text-sm mb-heading">
										Discover how much revenue slow performance is costing you
										every month
									</p>
								</div>

								<ul className="space-y-tight mb-content-block">
									<li className="flex items-center gap-tight text-sm text-secondary-foreground">
										<div className="w-1.5 h-1.5 rounded-full bg-accent" />
										Real PageSpeed analysis
									</li>
									<li className="flex items-center gap-tight text-sm text-secondary-foreground">
										<div className="w-1.5 h-1.5 rounded-full bg-accent" />
										Revenue impact calculation
									</li>
									<li className="flex items-center gap-tight text-sm text-secondary-foreground">
										<div className="w-1.5 h-1.5 rounded-full bg-accent" />
										Core Web Vitals insights
									</li>
								</ul>

								<div className="flex items-center gap-tight text-accent font-semibold">
									<span>Analyze Site</span>
									<ArrowRight className="w-5 h-5" aria-hidden="true" />
								</div>
							</Card>
						</Link>
					</div>

					<div className="text-center mt-12">
						<Link
							href="/tools"
							className="inline-flex items-center gap-tight text-accent hover:text-info font-semibold transition-colors"
						>
							View All Tools
							<ArrowRight className="w-5 h-5" aria-hidden="true" />
						</Link>
					</div>
				</div>
			</section>

			{/* Newsletter Signup */}
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

			{/* Final CTA */}
			<section className="py-section px-4 sm:px-6">
				<div className="container-wide text-center">
					<Card variant="glassSection" size="none" className="p-12 md:p-20">
						<div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-comfortable">
							<Rocket className="w-10 h-10 text-accent" />
						</div>

						<h2 className="text-section-title text-foreground mb-content-block max-w-4xl mx-auto text-balance">
							Your competitors ship faster. Why don&apos;t you?
						</h2>

						<p className="text-lead text-muted-foreground mb-12 max-w-3xl mx-auto">
							Every day you wait is revenue lost. Get a custom roadmap to 10x
							your technical velocity in our free 30-minute strategy call.
						</p>

						<div className="flex flex-col sm:flex-row gap-comfortable justify-center">
							<Button asChild variant="accent" size="xl" trackConversion={true}>
								<Link href={ROUTES.CONTACT}>
									Get Your Free Roadmap
									<ArrowRight className="w-4 h-4" />
								</Link>
							</Button>
							<Button asChild variant="ghost" size="xl" trackConversion={true}>
								<Link href={ROUTES.PORTFOLIO}>
									See Proven Results First
									<ArrowRight className="w-4 h-4" />
								</Link>
							</Button>
						</div>
					</Card>
				</div>
			</section>
		</main>
	)
}
