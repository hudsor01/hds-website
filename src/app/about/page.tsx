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

const testimonials = [
	{
		testimonialId: 1 as const,
		name: 'Sarah Mitchell',
		company: 'Bright Spark Consulting',
		role: 'Founder',
		content:
			'Our lead volume doubled in the first month after launch. The automation alone saves us 12 hours a week.',
		rating: 5 as const,
		service: 'Website Development + Automation',
		highlight: '2x lead volume'
	},
	{
		testimonialId: 2 as const,
		name: 'Marcus Holt',
		company: 'Gulf Coast Roofing',
		role: 'Operations Manager',
		content:
			'We went from manually following up on every quote to having it all run automatically. Game changer.',
		rating: 5 as const,
		service: 'Business Automation',
		highlight: 'Zero manual follow-ups'
	}
] satisfies Array<{
	testimonialId: number
	name: string
	company: string
	role: string
	content: string
	rating: number
	service: string
	highlight: string
}>

export default function AboutPage() {
	return (
		<main className="min-h-screen bg-background">
			{SEO_CONFIG.about?.structuredData && (
				<JsonLd
					data={SEO_CONFIG.about.structuredData as Record<string, unknown>}
				/>
			)}

			{/* Hero Section */}
			<section className="relative overflow-hidden bg-background">
				<div
					className="absolute inset-0 grid-pattern-subtle dark:grid-pattern-dark pointer-events-none"
					aria-hidden="true"
				/>
				<div
					className="hero-spotlight absolute inset-0 pointer-events-none"
					aria-hidden="true"
				/>
				<div className="relative z-10 container-wide px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20 text-center">
					<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
						About Us
					</p>
					<h1 className="text-page-title text-foreground leading-tight text-balance">
						Built Around Your Business
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6">
						Where real business experience meets the technical skill to build
						it. We don&apos;t just build websites — we build the system behind
						them.
					</p>
				</div>
			</section>

			{/* Story Section */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							Our Story
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							Built from Experience, Driven by Results
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							Built from experience, driven by results, and focused on your
							success.
						</p>
					</div>

					<div className="grid lg:grid-cols-2 gap-12 items-start">
						{/* Story Content */}
						<div className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors">
							<h3 className="text-h3 text-foreground mb-4">
								Built in Revenue Operations, Refined in Practice
							</h3>
							<div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
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
						</div>

						{/* Mission & Vision Cards */}
						<div className="space-y-6">
							<div className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors">
								<div className="flex items-center gap-4 mb-4">
									<div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
										<Rocket className="w-5 h-5 text-accent" />
									</div>
									<h3 className="text-h3 text-foreground">Our Mission</h3>
								</div>
								<p className="text-sm text-muted-foreground leading-relaxed">
									Make great websites and automation accessible to growing
									businesses. No more choosing between &quot;affordable but
									mediocre&quot; or &quot;excellent but unaffordable.&quot; Get
									both.
								</p>
							</div>

							<div className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors">
								<div className="flex items-center gap-4 mb-4">
									<div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
										<Eye className="w-5 h-5 text-accent" />
									</div>
									<h3 className="text-h3 text-foreground">Our Guarantee</h3>
								</div>
								<p className="text-sm text-muted-foreground leading-relaxed">
									If your investment doesn&apos;t show measurable ROI within 90
									days, we keep working for free until it does. Your success is
									our only metric.{' '}
									<Link href="/pricing" className="link-primary font-semibold">
										View our pricing
									</Link>
									.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Expertise Section */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							Our Toolkit
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							What We Build With
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							Proven tools. Modern technology. Everything chosen because it
							delivers results for business owners.
						</p>
					</div>

					<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
						<div className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors">
							<div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
								<Code2 className="w-5 h-5 text-accent" />
							</div>
							<h3 className="text-h3 text-foreground mb-3">Development</h3>
							<ul className="text-sm text-muted-foreground space-y-1 leading-relaxed">
								<li>Fast, modern websites</li>
								<li>Mobile-ready by default</li>
								<li>Built to convert visitors</li>
								<li>Optimised for search</li>
							</ul>
						</div>

						<div className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors">
							<div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
								<BarChart3 className="w-5 h-5 text-accent" />
							</div>
							<h3 className="text-h3 text-foreground mb-3">Analytics</h3>
							<ul className="text-sm text-muted-foreground space-y-1 leading-relaxed">
								<li>Revenue Attribution</li>
								<li>Conversion Optimisation</li>
								<li>A/B Testing</li>
								<li>Performance Monitoring</li>
							</ul>
						</div>

						<div className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors">
							<div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
								<Zap className="w-5 h-5 text-accent" />
							</div>
							<h3 className="text-h3 text-foreground mb-3">Operations</h3>
							<ul className="text-sm text-muted-foreground space-y-1 leading-relaxed">
								<li>Process Automation</li>
								<li>CRM Integration</li>
								<li>Email Marketing</li>
								<li>Lead Nurturing</li>
							</ul>
						</div>

						<div className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors">
							<div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
								<ShieldCheck className="w-5 h-5 text-accent" />
							</div>
							<h3 className="text-h3 text-foreground mb-3">Security</h3>
							<ul className="text-sm text-muted-foreground space-y-1 leading-relaxed">
								<li>Bank-Level Security</li>
								<li>GDPR Compliance</li>
								<li>Performance Security</li>
								<li>Vulnerability Assessment</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* The Founder Section */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							The Founder
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							The Business Builder Behind the Work
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							Why trust a former revenue operations professional to build your
							business system? Because they understand something agencies
							don&apos;t: every feature must earn its place by saving you time
							or making you money.
						</p>
					</div>

					<div className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors">
						<div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
							<p className="text-base">
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

							<p className="text-base">
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

							<p className="text-base">
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

							<blockquote className="text-base text-foreground font-bold border-l-4 border-accent pl-6 py-4 bg-accent/5">
								&quot;I don&apos;t care how beautiful your website is if it
								doesn&apos;t save you time or bring in revenue. Build results or
								build nothing.&quot;
							</blockquote>

							<div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-border">
								<div className="text-center">
									<div className="text-3xl font-black text-accent mb-1">5+</div>
									<div className="text-sm text-muted-foreground">
										Years of Experience
									</div>
								</div>
								<div className="text-center">
									<div className="text-3xl font-black text-accent mb-1">
										Proven
									</div>
									<div className="text-sm text-muted-foreground">
										Revenue Impact
									</div>
								</div>
								<div className="text-center">
									<div className="text-3xl font-black text-accent mb-1">
										Strong
									</div>
									<div className="text-sm text-muted-foreground">
										Avg Client ROI
									</div>
								</div>
								<div className="text-center">
									<div className="text-3xl font-black text-accent mb-1">
										Growing
									</div>
									<div className="text-sm text-muted-foreground">
										Businesses Transformed
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Core Values */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							Our Principles
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							How We Work
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							The core beliefs that drive every website we build, every tool we
							connect, and every workflow we automate.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-6">
						<div className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors">
							<div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
								<Lightbulb className="w-5 h-5 text-accent" />
							</div>
							<h3 className="text-h3 text-foreground mb-3">
								Performance First
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Every millisecond matters. We build for speed because fast sites
								convert better, rank higher, and deliver a better experience for
								your customers.
							</p>
						</div>

						<div className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors">
							<div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
								<BarChart3 className="w-5 h-5 text-accent" />
							</div>
							<h3 className="text-h3 text-foreground mb-3">Data Driven</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Assumptions kill businesses. Every decision is backed by data,
								every feature is measured, and every optimisation is validated
								against real results.
							</p>
						</div>

						<div className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors">
							<div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
								<Settings className="w-5 h-5 text-accent" />
							</div>
							<h3 className="text-h3 text-foreground mb-3">
								Built to Grow With You
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								We build for growth. Your website and systems grow with your
								business — no expensive rebuilds when you scale.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							Client Results
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							What Our Clients Say
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							Real businesses. Real results.
						</p>
					</div>
					<div className="grid md:grid-cols-2 gap-6">
						{testimonials.map(t => (
							<Card
								key={t.testimonialId}
								variant="testimonial"
								testimonialId={t.testimonialId}
								name={t.name}
								company={t.company}
								role={t.role}
								content={t.content}
								rating={t.rating}
								service={t.service}
								highlight={t.highlight}
							/>
						))}
					</div>
				</div>
			</section>

			{/* Call to Action */}
			<section className="py-section px-4 sm:px-6">
				<div className="container-wide">
					<div className="relative overflow-hidden rounded-2xl border border-border bg-surface-raised p-10 md:p-16 text-center">
						<div
							className="hero-spotlight absolute inset-0 opacity-60 pointer-events-none"
							aria-hidden="true"
						/>
						<div className="relative z-10">
							<h2 className="text-section-title text-foreground mb-6 max-w-3xl mx-auto text-balance">
								Ready to build{' '}
								<span className="text-accent">your business system?</span>
							</h2>

							<p className="text-lead text-muted-foreground max-w-2xl mx-auto mb-10">
								Stop doing manually what should run automatically. Let&apos;s
								build a website and system that works for you — even when
								you&apos;re not.
							</p>

							<div className="flex flex-col sm:flex-row gap-3 justify-center">
								<Button
									asChild
									variant="accent"
									size="xl"
									trackConversion={true}
								>
									<Link href="/contact">
										Start Your Project
										<ArrowRight className="w-5 h-5" />
									</Link>
								</Button>

								<Button
									asChild
									variant="outline"
									size="xl"
									className="border-2 border-foreground/25 hover:border-accent dark:border-foreground/20"
								>
									<Link href="/services">Explore Services</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}
