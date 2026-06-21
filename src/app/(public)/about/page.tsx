import {
	ArrowRight,
	BarChart3,
	Code2,
	Eye,
	Lightbulb,
	Phone,
	Rocket,
	Settings,
	ShieldCheck,
	Zap
} from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { JsonLd } from '@/components/utilities/JsonLd'
import { BUSINESS_INFO } from '@/lib/constants/business'
import { SEO_CONFIG } from '@/lib/seo-config'

// Next.js 15: SSR meta for SEO/TTFB
export const metadata: Metadata = {
	title: SEO_CONFIG.about?.title || 'About Hudson Digital Solutions',
	description:
		SEO_CONFIG.about?.description || 'Learn about Hudson Digital Solutions',
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

// Hardcoded "Sarah Mitchell" + "Marcus Holt" testimonials were dropped
// per audit #256 — they predate the DB-backed admin/testimonials CRUD
// and were unverifiable (no posted_at, no company URL, no commit
// history naming them as real clients). The DB schema
// (`src/lib/schemas/content.ts:15-38`) is the canonical source going
// forward; the public testimonials section returns when admin seeds
// real rows. Removing fabricated copy reads more honest than
// maintaining it.

export default function AboutPage() {
	return (
		<div className="min-h-screen bg-background">
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
						About Me
					</p>
					<h1 className="text-page-title text-foreground leading-tight text-balance">
						Built Around Your Business
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6">
						I spent nearly a decade in revenue operations before I built
						websites. Now I build DFW small businesses a site that earns its
						keep and does justice to the reputation you already have.
					</p>
				</div>
			</section>

			{/* Story Section */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							My Story
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							The Experience Behind Your Website
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							I build the way a business owner thinks. Every choice gets
							measured against one thing: does it bring customers in.
						</p>
					</div>

					<div className="grid lg:grid-cols-2 gap-12 items-start">
						{/* Story Content */}
						<div className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors">
							<h3 className="text-h3 text-foreground mb-4">
								Nearly a Decade in Revenue Operations First
							</h3>
							<div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
								<p>
									Most agencies learned web development in a bootcamp. I learned
									revenue first. I spent nearly a decade in revenue operations
									running Salesforce, Power BI, Workato and HubSpot, where every
									decision either moved the number or it did not.
								</p>
								<p>
									Working that close to the{' '}
									<strong className="text-accent">numbers</strong> taught me
									something most agencies miss:{' '}
									<strong className="text-info">
										websites do not fail on bad code. They fail because nobody
										built them to bring in customers. They were built to look
										nice
									</strong>
									.
								</p>
								<p>
									So my clients see{' '}
									<strong className="text-accent">measurable results</strong> in
									months, not years. I do not launch a{' '}
									<Link href="/services" className="link-primary font-semibold">
										professional website
									</Link>{' '}
									and walk away. Every page gets measured against one question:{' '}
									<strong className="text-success-text">
										does this help you get and keep customers?
									</strong>
								</p>
								<p className="text-foreground font-semibold">
									I am not another agency selling &quot;beautiful websites&quot;
									that sit there doing nothing. I build a website that earns its
									keep.{' '}
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
									<h3 className="text-h3 text-foreground">My Mission</h3>
								</div>
								<p className="text-sm text-muted-foreground leading-relaxed">
									Put a real website in reach of every small business. No owner
									should have to pick between a site that is cheap and
									embarrassing and one that is great and unaffordable. You get a
									professional site that brings in customers, at a fair price.
								</p>
							</div>

							<div className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors">
								<div className="flex items-center gap-4 mb-4">
									<div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
										<Eye className="w-5 h-5 text-accent" />
									</div>
									<h3 className="text-h3 text-foreground">My Guarantee</h3>
								</div>
								<p className="text-sm text-muted-foreground leading-relaxed">
									We agree on one KPI at kickoff (usually conversion rate,
									qualified leads per month, or revenue per visitor). If it does
									not beat its installed-analytics baseline within 90 days, I
									keep working at no extra cost until it does, up to 3 added
									revision rounds covering optimization scope. The baseline is
									measured from analytics installed on day one of the
									engagement.
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
							My Toolkit
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							What I Build With
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							Proven tools, modern tech. I pick each one because it gets results
							for the owner, not because it is trendy.
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
								<li>Optimized for search</li>
							</ul>
						</div>

						<div className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors">
							<div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
								<BarChart3 className="w-5 h-5 text-accent" />
							</div>
							<h3 className="text-h3 text-foreground mb-3">Analytics</h3>
							<ul className="text-sm text-muted-foreground space-y-1 leading-relaxed">
								<li>Revenue Attribution</li>
								<li>Conversion Optimization</li>
								<li>A/B Testing</li>
								<li>Performance Monitoring</li>
							</ul>
						</div>

						<div className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors">
							<div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
								<Zap className="w-5 h-5 text-accent" />
							</div>
							<h3 className="text-h3 text-foreground mb-3">
								Launch &amp; Support
							</h3>
							<ul className="text-sm text-muted-foreground space-y-1 leading-relaxed">
								<li>Local SEO Setup</li>
								<li>Content Updates</li>
								<li>Booking &amp; Payment Setup</li>
								<li>Customer Follow-Up</li>
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
							The Builder Behind the Work
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							Why hand your website to a former revenue operations guy? Because
							I know something most agencies do not: a website is only worth
							what it brings in.
						</p>
					</div>

					<div className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors">
						<div className="flex flex-col items-center mb-8">
							<Image
								src="/images/founder.jpg"
								alt="Richard Hudson, Founder of Hudson Digital Solutions"
								width={160}
								height={160}
								className="rounded-full border-4 border-accent/20 shadow-lg"
								priority
							/>
							<p className="mt-4 text-base font-bold text-foreground">
								Richard Hudson
							</p>
							<p className="text-sm text-muted-foreground">
								Founder &amp; Web Designer
							</p>
						</div>
						<div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
							<p className="text-base">
								Before I built for clients, I spent nearly a decade in{' '}
								<strong className="text-accent">revenue operations</strong> at
								established companies. Salesforce, Power BI, Workato, HubSpot.
								Close enough to the numbers to see exactly which sites{' '}
								<strong className="text-accent">brought in customers</strong>{' '}
								and which just looked nice.
							</p>

							<p className="text-base">
								Same job, same lesson every time:{' '}
								<strong className="text-info">
									most websites fail not on the technology but because nobody
									built them to bring in customers
								</strong>
								. Agencies charge $50K for a pretty site the owner cannot even
								update. I build a professional website you control, one that
								turns the reputation you already have into booked customers.
							</p>

							<p className="text-base">
								I kept seeing great DFW businesses with glowing reviews and no
								website, or one so dated it was costing them customers. That is
								the gap I fill. Hudson Digital Solutions exists to fix it:{' '}
								<strong className="text-accent">
									a professional website, built around how your business
									actually works
								</strong>
								.
							</p>

							<blockquote className="text-base text-foreground font-bold border-l-4 border-accent pl-6 py-4 bg-accent/5">
								&quot;I do not care how pretty your website is if it does not
								bring in customers. Build results or build nothing.&quot;
							</blockquote>

							<div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-border">
								<div className="text-center">
									<div className="text-3xl font-black text-accent mb-1">
										2,200%
									</div>
									<div className="text-sm text-muted-foreground">
										Partner growth scaled
									</div>
								</div>
								<div className="text-center">
									<div className="text-3xl font-black text-accent mb-1">
										95%
									</div>
									<div className="text-sm text-muted-foreground">
										Forecast accuracy
									</div>
								</div>
								<div className="text-center">
									<div className="text-3xl font-black text-accent mb-1">
										$3.7M
									</div>
									<div className="text-sm text-muted-foreground">
										Pipeline driven
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
							My Principles
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							How I Work
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							The rules I build every website by.
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
								Every millisecond counts. I build for speed because fast sites
								convert better, rank higher and feel better to your customers.
							</p>
						</div>

						<div className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors">
							<div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
								<BarChart3 className="w-5 h-5 text-accent" />
							</div>
							<h3 className="text-h3 text-foreground mb-3">Data Driven</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Guessing kills businesses. Data backs every decision, every
								feature gets measured and every change is checked against real
								results.
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
								I build for growth. Your site and your booking and payment
								systems scale with the business, so no costly rebuild when you
								get bigger.
							</p>
						</div>
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
								<span className="text-accent">
									the website you&apos;ve earned?
								</span>
							</h2>

							<p className="text-lead text-muted-foreground max-w-2xl mx-auto mb-10">
								Let&apos;s map out the website your business actually needs and
								build you something that turns the reputation you have into
								booked customers.
							</p>

							<div className="flex flex-col sm:flex-row gap-3 justify-center">
								<Button asChild variant="accent" size="xl">
									<Link href="/contact">
										Get My Free Website Plan
										<ArrowRight className="w-5 h-5" />
									</Link>
								</Button>

								<Button
									asChild
									variant="outline"
									size="xl"
									className="border-2 border-foreground/25 hover:border-accent dark:border-foreground/20"
								>
									<Link href="/services">View Services</Link>
								</Button>

								{BUSINESS_INFO.phone && (
									<Button
										asChild
										variant="outline"
										size="xl"
										className="border-2 border-foreground/25 hover:border-accent dark:border-foreground/20"
									>
										<a href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}>
											<Phone className="w-5 h-5" />
											{BUSINESS_INFO.phone}
										</a>
									</Button>
								)}
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}
