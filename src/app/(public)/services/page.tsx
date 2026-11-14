import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProcessSteps } from '@/components/ui/ProcessSteps'
import { ServicesGrid } from '@/components/ui/ServicesGrid'
import { JsonLd } from '@/components/utilities/JsonLd'
import { SERVICES } from '@/lib/constants/services'
import { buildMetadata } from '@/lib/seo-config'
import {
	generateLocalBusinessSchema,
	generateServiceSchema,
	toJsonLdGraph
} from '@/lib/seo-utils'

export const metadata: Metadata = buildMetadata({
	title: 'Small Business Website Design | Hudson Digital',
	description:
		'Professional websites designed and built for small businesses: custom, mobile-ready, fast and easy to find on Google. Free website plan, no obligation.',
	path: '/services',
	socialTitle: 'Website Design for Small Businesses | Hudson Digital',
	socialDescription:
		'Professional websites built for small businesses: custom, fast, mobile-ready, built to bring in customers. Launched in weeks.'
})

interface Stat {
	value: string
	label: string
}

const stats: Stat[] = [
	{ value: '1 to 4 wks', label: 'First Delivery' },
	{ value: 'Expert', label: 'Development' },
	{ value: 'Proven', label: 'Track Record' },
	{ value: '2 hr', label: 'Response Time' }
]

// Hardcoded "Sarah Mitchell" + "Marcus Holt" testimonials dropped per
// audit #256 (see also about/page.tsx). The DB-backed
// admin/testimonials CRUD is the canonical source going forward; the
// section returns when real seeded rows exist.

export default function ServicesPage() {
	return (
		<div className="min-h-screen bg-background">
			<JsonLd
				data={toJsonLdGraph([
					generateLocalBusinessSchema(),
					...SERVICES.map(generateServiceSchema)
				])}
			/>

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
						What I Do
					</p>
					<h1 className="text-page-title text-foreground leading-tight text-balance">
						Websites Built for Small Businesses
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6 mb-10">
						I design, build and launch your website. When you&apos;re ready, I
						wire in booking, payments and follow-up so the site actually brings
						work in instead of just sitting there.
					</p>
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Button asChild variant="accent" size="xl">
							<Link href="/contact">
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
							<Link href="#process">See Our Process</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Services Section */}
			<section id="services-list" className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							What I Build
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							A Website, Done Right
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							I handle the tech. You run your business.
						</p>
					</div>
					<ServicesGrid />
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							Track Record
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							Proven Results
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							Before I built websites, I spent nearly a decade in revenue
							operations running Salesforce, Power BI and HubSpot. I bring that
							same focus on outcomes here: done right, on time, no technical
							runaround.
						</p>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/30 rounded-2xl overflow-hidden">
						{stats.map((stat, index) => (
							<div
								key={index}
								className="bg-background px-8 py-10 text-center relative overflow-hidden"
							>
								<div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
								<div className="text-4xl font-black text-accent mb-2 tabular-nums">
									{stat.value}
								</div>
								<div className="text-sm text-muted-foreground">
									{stat.label}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Process Section */}
			<section id="process" className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							How It Works
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							My Process
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							Clear steps from our first conversation to live and working. No
							jargon, no surprises.
						</p>
					</div>
					<ProcessSteps />
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
								Ready for a website that{' '}
								<span className="text-accent">works as hard as you do?</span>
							</h2>

							<p className="text-lead text-muted-foreground mb-10 max-w-2xl mx-auto">
								Tell me about your business. I&apos;ll map out the website it
								needs with pages, timeline and cost spelled out. Then you decide
								from there.
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
									<Link href="#services-list">View Services</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}
