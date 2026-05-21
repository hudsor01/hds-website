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
import { Card } from '@/components/ui/card'
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

const testimonials = [
	{
		testimonialId: 1 as const,
		name: 'Sarah Mitchell',
		company: 'Bright Spark Consulting',
		role: 'Founder',
		content:
			'Within a month of the new site going live, our inquiries had doubled. It finally looks like the company we actually are.',
		rating: 5 as const,
		service: 'Website Design & Development',
		highlight: '2x inquiries'
	},
	{
		testimonialId: 2 as const,
		name: 'Marcus Holt',
		company: 'Gulf Coast Roofing',
		role: 'Operations Manager',
		content:
			'We never had a real website before. Now customers find us on Google, see our work, and book a quote straight from the site.',
		rating: 5 as const,
		service: 'Website Design & Development',
		highlight: 'Found on Google'
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
						About Us
					</p>
					<h1 className="text-page-title text-foreground leading-tight text-balance">
						Built Around Your Business
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6">
						Where real business experience meets the skill to build it. We make
						small businesses a website that does justice to the reputation
						they&apos;ve already earned.
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
							We build websites the way a business owner thinks — every choice
							measured against whether it brings customers in.
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
									<strong className="text-accent">
										hands-on revenue experience
									</strong>{' '}
									across growing businesses, we discovered something agencies
									miss:{' '}
									<strong className="text-info">
										websites fail not because of bad code, but because they were
										never built to bring in customers — just to look nice
									</strong>
									.
								</p>
								<p>
									That&apos;s why our clients see{' '}
									<strong className="text-accent">
										real, measurable results
									</strong>{' '}
									in months, not years. We don&apos;t just launch a{' '}
									<Link href="/services" className="link-primary font-semibold">
										professional website
									</Link>{' '}
									and walk away — every page is built and measured against one
									question:{' '}
									<strong className="text-success-text">
										does this help your business get and keep customers?
									</strong>
								</p>
								<p className="text-foreground font-semibold">
									We&apos;re not another agency selling &quot;beautiful
									websites&quot; that sit there doing nothing. We build websites
									that earn their keep.{' '}
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
									Make a great website accessible to every small business. No
									small business should have to choose between a site
									that&apos;s cheap but embarrassing and one that&apos;s great
									but unaffordable. You get a professional site that brings in
									customers, at a fair price.
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
									If the KPI we agree on at kickoff (typically conversion rate,
									qualified leads per month, or revenue per visitor)
									doesn&apos;t improve over its installed-analytics baseline
									within 90 days, I keep working — up to 3 additional revision
									rounds covering optimization scope — at no extra cost until it
									does. Baseline is measured from analytics installed on day one
									of the engagement.
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
							Why trust a former revenue operations professional to build your
							website? Because they understand something most agencies
							don&apos;t: a website is only worth what it brings in.
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
								Before building for clients, I spent 5+ years in{' '}
								<strong className="text-accent">revenue operations</strong> at
								established companies — close enough to the numbers to see
								exactly which websites{' '}
								<strong className="text-accent">brought in customers</strong>{' '}
								and which just looked nice.
							</p>

							<p className="text-base">
								Here&apos;s what I learned:{' '}
								<strong className="text-info">
									most websites fail not because of bad technology, but because
									they were never built to bring in customers
								</strong>
								. Agencies charge $50K for a beautiful site the owner can&apos;t
								even update. I build small businesses a professional website
								they control — one that turns the reputation they&apos;ve
								already earned into booked customers.
							</p>

							<p className="text-base">
								When I saw how many great local businesses had glowing reviews
								but no website — or one so dated it cost them customers — I knew
								where I could help. Hudson Digital Solutions exists to fix
								exactly that:{' '}
								<strong className="text-accent">
									a professional website, built around how your business
									actually works
								</strong>
								.
							</p>

							<blockquote className="text-base text-foreground font-bold border-l-4 border-accent pl-6 py-4 bg-accent/5">
								&quot;I don&apos;t care how beautiful your website is if it
								doesn&apos;t bring in customers. Build results or build
								nothing.&quot;
							</blockquote>

							<div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-border">
								<div className="text-center">
									<div className="text-3xl font-black text-accent mb-1">5+</div>
									<div className="text-sm text-muted-foreground">
										Years in Rev Ops
									</div>
								</div>
								<div className="text-center">
									<div className="text-3xl font-black text-accent mb-1">
										10+
									</div>
									<div className="text-sm text-muted-foreground">
										Businesses Served
									</div>
								</div>
								<div className="text-center">
									<div className="text-3xl font-black text-accent mb-1">
										Measurable
									</div>
									<div className="text-sm text-muted-foreground">
										Revenue Impact
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
							The core beliefs behind every website we build.
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
								every feature is measured, and every optimization is validated
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
								<span className="text-accent">
									the website you&apos;ve earned?
								</span>
							</h2>

							<p className="text-lead text-muted-foreground max-w-2xl mx-auto mb-10">
								Let&apos;s map out the website your business needs — and build
								you something that turns the reputation you&apos;ve earned into
								booked customers.
							</p>

							<div className="flex flex-col sm:flex-row gap-3 justify-center">
								<Button
									asChild
									variant="accent"
									size="xl"
									trackConversion={true}
								>
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
