import {
	ArrowRight,
	BarChart3,
	Code2,
	Eye,
	Lightbulb,
	Rocket,
	Settings,
	ShieldCheck,
	Zap
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BackgroundPattern } from '@/components/ui/BackgroundPattern'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { JsonLd } from '@/components/utilities/JsonLd'
import { SEO_CONFIG } from '@/utils/seo'

// Next.js 15: SSR meta for SEO/TTFB
export const metadata: Metadata = {
	title: SEO_CONFIG.about?.title || 'About Hudson Digital Solutions',
	description:
		SEO_CONFIG.about?.description || 'Learn about Hudson Digital Solutions',
	keywords: SEO_CONFIG.about?.keywords || [],
	openGraph: {
		title:
			SEO_CONFIG.about?.ogTitle ??
			SEO_CONFIG.about?.title ??
			'About Hudson Digital Solutions',
		description:
			SEO_CONFIG.about?.ogDescription ??
			SEO_CONFIG.about?.description ??
			'Learn about Hudson Digital Solutions',
		url: SEO_CONFIG.about?.canonical || '',
		images: [
			{
				url: SEO_CONFIG.about?.ogImage ?? '',
				alt: SEO_CONFIG.about?.title || 'About Hudson Digital Solutions'
			}
		]
	},
	alternates: {
		canonical: SEO_CONFIG.about?.canonical || ''
	},
	robots: {
		index: true,
		follow: true,
		'max-snippet': -1,
		'max-image-preview': 'large',
		'max-video-preview': -1
	}
}

export default function AboutPage() {
	return (
		<main className="min-h-screen bg-background">
			{SEO_CONFIG.about?.structuredData && (
				<JsonLd
					data={SEO_CONFIG.about.structuredData as Record<string, unknown>}
				/>
			)}
			{/* Hero Section */}
			<section className="relative min-h-screen flex-center overflow-hidden">
				<BackgroundPattern variant="hero" />

				<div className="relative z-sticky container-wide text-center">
					<div className="space-y-sections">
						<div>
							<h1 className="text-responsive-lg font-black text-foreground leading-none tracking-tight text-balance">
								<span className="inline-block mr-4">Built Around</span>
								<span className="inline-block mr-4 text-accent">
									Your Business
								</span>
							</h1>
						</div>

						<div className="typography">
							<p className="text-lg text-muted-foreground container-wide leading-relaxed text-pretty">
								Where real business experience meets the technical skill to
								build it. We don&apos;t just build websites — we build the
								system behind them.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Story Section */}
			<section className="relative section-spacing page-padding-x">
				<div className="container-wide">
					<div className="text-center mb-16">
						<h2 className="text-responsive-lg font-black text-foreground mb-content-block text-balance">
							<span className="text-accent">Our Story</span>
						</h2>
						<div className="typography">
							<p className="text-xl text-muted-foreground container-narrow text-pretty">
								Built from experience, driven by results, and focused on your
								success.
							</p>
						</div>
					</div>

					<div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
						{/* Story Content */}
						<Card variant="glassLight" size="lg" hover className="group">
							<h3 className="text-h3 text-foreground mb-content-block group-hover:text-accent transition-smooth">
								Built in Revenue Operations, Refined in Practice
							</h3>
							<div className="space-y-comfortable text-muted-foreground leading-relaxed typography">
								<p>
									Most agencies learned web development in bootcamps. We learned
									it in the trenches of revenue operations — where every
									decision either moves the business forward or holds it back.
								</p>
								<p>
									With{' '}
									<strong className="text-accent">proven revenue impact</strong>{' '}
									across growing businesses, we discovered something agencies
									miss:{' '}
									<strong className="text-info">
										websites don&apos;t fail because of bad code — they fail
										because they&apos;re not connected to how the business
										actually runs
									</strong>
									.
								</p>
								<p>
									That&apos;s why our clients see{' '}
									<strong className="text-accent">proven ROI results</strong> in
									months, not years. We don&apos;t just launch websites. We
									build{' '}
									<Link href="/services" className="link-primary font-semibold">
										connected business systems
									</Link>{' '}
									backed by analytics, automation, and relentless optimisation.
									Every page, every integration, every workflow is measured
									against one metric:{' '}
									<strong className="text-success-text">
										does this help your business grow?
									</strong>
								</p>
								<p className="text-foreground font-semibold">
									We&apos;re not another agency promising &quot;beautiful
									websites.&quot; We&apos;re business builders who happen to
									write beautiful code.{' '}
									<Link href="/contact" className="link-primary">
										Let&apos;s talk about your project
									</Link>
									.
								</p>
							</div>
						</Card>

						{/* Mission & Vision Cards */}
						<div className="space-y-sections">
							<Card variant="glassLight" size="lg" hover className="group">
								<div className="flex-center gap-content mb-heading">
									<div className="p-3 rounded-xl bg-muted-br-20 border border-primary/30">
										<Rocket className="w-8 h-8 text-accent" />
									</div>
									<h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-smooth">
										Our Mission
									</h3>
								</div>
								<p className="text-muted-foreground group-hover:text-foreground transition-smooth">
									Make great websites and automation accessible to growing
									businesses. No more choosing between &quot;affordable but
									mediocre&quot; or &quot;excellent but unaffordable.&quot; Get
									both.
								</p>
							</Card>

							<Card variant="glassLight" size="lg" hover className="group">
								<div className="flex-center gap-content mb-heading">
									<div className="p-3 rounded-xl bg-info/20 border border-info/30">
										<Eye className="w-8 h-8 text-info" />
									</div>
									<h3 className="text-xl font-bold text-foreground group-hover:text-info transition-smooth">
										Our Guarantee
									</h3>
								</div>
								<p className="text-muted-foreground group-hover:text-foreground transition-smooth">
									If your investment doesn&apos;t show measurable ROI within 90
									days, we keep working for free until it does. Your success is
									our only metric.{' '}
									<Link href="/pricing" className="link-primary font-semibold">
										View our pricing
									</Link>
									.
								</p>
							</Card>
						</div>
					</div>
				</div>
			</section>

			{/* Expertise Section */}
			<section className="relative section-spacing page-padding-x">
				<div className="container-wide">
					<div className="text-center mb-16">
						<h2 className="text-clamp-xl font-black text-foreground mb-content-block text-balance">
							<span className="text-accent">What We Build With</span>
						</h2>
						<p className="text-xl text-muted-foreground container-narrow text-pretty">
							Proven tools. Modern technology. Everything chosen because it
							delivers results for business owners.
						</p>
					</div>

					<div className="grid-4">
						<Card variant="glassLight" size="sm" hover className="group">
							<div className="flex-center gap-3 mb-heading">
								<div className="p-3 rounded-xl bg-muted-br-20 border border-primary/30">
									<Code2 className="w-6 h-6 text-accent" />
								</div>
								<h3 className="text-lg font-bold text-foreground group-hover:text-accent transition-smooth">
									Development
								</h3>
							</div>
							<ul className="text-muted-foreground space-y-tight text-sm group-hover:text-foreground transition-smooth">
								<li>• Fast, modern websites</li>
								<li>• Mobile-ready by default</li>
								<li>• Built to convert visitors</li>
								<li>• Optimised for search</li>
							</ul>
						</Card>

						<Card variant="glassLight" size="sm" hover className="group">
							<div className="flex-center gap-3 mb-heading">
								<div className="p-3 rounded-xl bg-muted-br-20 border border-success/30">
									<BarChart3 className="w-6 h-6 text-success-text" />
								</div>
								<h3 className="text-lg font-bold text-foreground group-hover:text-success-text transition-smooth">
									Analytics
								</h3>
							</div>
							<ul className="text-muted-foreground space-y-tight text-sm group-hover:text-foreground transition-smooth">
								<li>• Revenue Attribution</li>
								<li>• Conversion Optimisation</li>
								<li>• A/B Testing</li>
								<li>• Performance Monitoring</li>
							</ul>
						</Card>

						<Card variant="glassLight" size="sm" hover className="group">
							<div className="flex-center gap-3 mb-heading">
								<div className="p-3 rounded-xl bg-muted border border-muted-foreground/30">
									<Zap className="w-6 h-6 text-orange-text" />
								</div>
								<h3 className="text-lg font-bold text-foreground group-hover:text-orange-text transition-smooth">
									Operations
								</h3>
							</div>
							<ul className="text-muted-foreground space-y-tight text-sm group-hover:text-foreground transition-smooth">
								<li>• Process Automation</li>
								<li>• CRM Integration</li>
								<li>• Email Marketing</li>
								<li>• Lead Nurturing</li>
							</ul>
						</Card>

						<Card variant="glassLight" size="sm" hover className="group">
							<div className="flex-center gap-3 mb-heading">
								<div className="p-3 rounded-xl bg-info/20 border border-info/30">
									<ShieldCheck className="w-6 h-6 text-info" />
								</div>
								<h3 className="text-lg font-bold text-foreground group-hover:text-info transition-smooth">
									Security
								</h3>
							</div>
							<ul className="text-muted-foreground space-y-tight text-sm group-hover:text-foreground transition-smooth">
								<li>• Bank-Level Security</li>
								<li>• GDPR Compliance</li>
								<li>• Performance Security</li>
								<li>• Vulnerability Assessment</li>
							</ul>
						</Card>
					</div>
				</div>
			</section>

			{/* The Founder Section */}
			<section className="relative section-spacing page-padding-x">
				<div className="container-wide">
					<div className="text-center mb-16">
						<h2 className="text-clamp-xl font-black text-foreground mb-content-block text-balance">
							<span className="text-accent">
								The Business Builder Behind the Work
							</span>
						</h2>
						<p className="text-xl text-muted-foreground container-narrow text-pretty">
							Why trust a former revenue operations professional to build your
							business system? Because they understand something agencies
							don&apos;t: every feature must earn its place by saving you time
							or making you money.
						</p>
					</div>

					<Card variant="glassLight" size="lg" hover className="group">
						<div className="space-y-sections text-muted-foreground leading-relaxed">
							<p className="text-lg group-hover:text-foreground transition-smooth">
								Before building for clients, I spent 5+ years as a{' '}
								<strong className="text-accent">
									revenue operations professional
								</strong>{' '}
								at established companies. I didn&apos;t just build websites — I
								built the processes behind them that generated{' '}
								<strong className="text-accent">
									measurable revenue impact
								</strong>
								.
							</p>

							<p className="text-lg group-hover:text-foreground transition-smooth">
								Here&apos;s what I learned:{' '}
								<strong className="text-info">
									most websites fail not because of bad technology, but because
									they&apos;re disconnected from how the business actually
									operates
								</strong>
								. Agencies charge $50K for a beautiful site that no one can
								manage. We build connected systems that save you hours every
								week and convert visitors into paying customers.
							</p>

							<p className="text-lg group-hover:text-foreground transition-smooth">
								When I saw how many small business owners were drowning in
								manual work — copying data between tools, chasing leads by hand,
								updating spreadsheets — I knew there was a better way. Hudson
								Digital Solutions exists to fix that:{' '}
								<strong className="text-accent">
									websites, integrations, and automation built around how your
									business actually works
								</strong>
								.
							</p>

							<p className="text-xl text-foreground font-bold border-l-4 border-accent pl-6 py-4 bg-accent/5">
								&quot;I don&apos;t care how beautiful your website is if it
								doesn&apos;t save you time or bring in revenue. Build results or
								build nothing.&quot;
							</p>

							<div className="grid md:grid-cols-4 gap-sections mt-12 pt-8 border-t border-white/20">
								<div className="text-center">
									<div className="text-3xl font-black text-accent mb-subheading group-hover:text-foreground transition-smooth">
										5+
									</div>
									<div className="text-sm text-muted-foreground group-hover:text-muted-foreground transition-smooth">
										Years of Experience
									</div>
								</div>
								<div className="text-center">
									<div className="text-3xl font-black text-info mb-subheading group-hover:text-foreground transition-smooth">
										Proven
									</div>
									<div className="text-sm text-muted-foreground group-hover:text-muted-foreground transition-smooth">
										Revenue Impact
									</div>
								</div>
								<div className="text-center">
									<div className="text-3xl font-black text-accent mb-subheading group-hover:text-foreground transition-smooth">
										Strong
									</div>
									<div className="text-sm text-muted-foreground group-hover:text-muted-foreground transition-smooth">
										Avg Client ROI
									</div>
								</div>
								<div className="text-center">
									<div className="text-3xl font-black text-success-text mb-subheading group-hover:text-foreground transition-smooth">
										Growing
									</div>
									<div className="text-sm text-muted-foreground group-hover:text-muted-foreground transition-smooth">
										Businesses Transformed
									</div>
								</div>
							</div>
						</div>
					</Card>
				</div>
			</section>

			{/* Core Values */}
			<section className="relative section-spacing page-padding-x">
				<div className="container-wide">
					<div className="text-center mb-16">
						<h2 className="text-clamp-xl font-black text-foreground mb-content-block text-balance">
							<span className="text-accent">How We Work</span>
						</h2>
						<p className="text-xl text-muted-foreground container-narrow text-pretty">
							The core beliefs that drive every website we build, every tool we
							connect, and every workflow we automate.
						</p>
					</div>

					<div className="grid-3">
						<Card variant="glassLight" size="lg" hover className="group">
							<div className="flex items-center gap-content mb-content-block">
								<div className="p-4 rounded-2xl bg-muted-br-20 border border-primary/30">
									<Lightbulb className="w-8 h-8 text-accent" />
								</div>
								<h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-smooth">
									Performance First
								</h3>
							</div>
							<p className="text-muted-foreground group-hover:text-foreground transition-smooth">
								Every millisecond matters. We build for speed because fast sites
								convert better, rank higher, and deliver a better experience for
								your customers.
							</p>
						</Card>

						<Card variant="glassLight" size="lg" hover className="group">
							<div className="flex items-center gap-content mb-content-block">
								<div className="p-4 rounded-2xl bg-muted-br-20 border border-success/30">
									<BarChart3 className="w-8 h-8 text-success-text" />
								</div>
								<h3 className="text-xl font-bold text-foreground group-hover:text-success-text transition-smooth">
									Data Driven
								</h3>
							</div>
							<p className="text-muted-foreground group-hover:text-foreground transition-smooth">
								Assumptions kill businesses. Every decision is backed by data,
								every feature is measured, and every optimisation is validated
								against real results.
							</p>
						</Card>

						<Card variant="glassLight" size="lg" hover className="group">
							<div className="flex items-center gap-content mb-content-block">
								<div className="p-4 rounded-2xl bg-muted border border-muted-foreground/30">
									<Settings className="w-8 h-8 text-orange-text" />
								</div>
								<h3 className="text-xl font-bold text-foreground group-hover:text-orange-text transition-smooth">
									Built to Grow With You
								</h3>
							</div>
							<p className="text-muted-foreground group-hover:text-foreground transition-smooth">
								We build for growth. Your website and systems grow with your
								business — no expensive rebuilds when you scale.
							</p>
						</Card>
					</div>
				</div>
			</section>

			{/* Call to Action */}
			<section className="relative section-spacing page-padding-x">
				<div className="container-wide">
					<Card
						variant="glassSection"
						size="md"
						className="relative z-sticky text-center"
					>
						<h2 className="text-clamp-xl font-black text-foreground mb-content-block text-balance">
							Ready to build
							<span className="text-accent"> your business system?</span>
						</h2>

						<p className="text-xl text-muted-foreground container-narrow mb-10 text-pretty">
							Stop doing manually what should run automatically. Let&apos;s
							build a website and system that works for you — even when
							you&apos;re not.
						</p>

						<div className="flex flex-col sm:flex-row flex-center gap-content">
							<Button asChild variant="accent" size="xl" trackConversion={true}>
								<Link href="/contact">
									Start Your Project
									<ArrowRight className="w-5 h-5" />
								</Link>
							</Button>

							<Button asChild variant="outline" size="xl">
								<Link href="/services">
									Explore Services
									<ArrowRight className="w-5 h-5" />
								</Link>
							</Button>
						</div>
					</Card>
				</div>
			</section>
		</main>
	)
}
