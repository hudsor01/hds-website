import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProcessSteps } from '@/components/ui/ProcessSteps'
import { ServicesGrid } from '@/components/ui/ServicesGrid'
import { SEO_CONFIG } from '@/lib/seo-config'

export const metadata: Metadata = {
	title:
		SEO_CONFIG.services?.title || 'Our Services | Hudson Digital Solutions',
	description:
		SEO_CONFIG.services?.description ||
		'Professional website design and development for small businesses.',
	openGraph: {
		title:
			SEO_CONFIG.services?.ogTitle ??
			SEO_CONFIG.services?.title ??
			'Our Services | Hudson Digital Solutions',
		description:
			SEO_CONFIG.services?.ogDescription ??
			SEO_CONFIG.services?.description ??
			'Professional website design and development for small businesses.',
		url: SEO_CONFIG.services?.canonical || ''
	},
	alternates: {
		canonical: SEO_CONFIG.services?.canonical || ''
	},
	robots: {
		index: true,
		follow: true,
		'max-snippet': -1,
		'max-image-preview': 'large',
		'max-video-preview': -1
	}
}

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
						Professional Services
					</p>
					<h1 className="text-page-title text-foreground leading-tight text-balance">
						Websites Built for Small Businesses
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6 mb-10">
						A professional website designed, built, and launched for your
						business. Plus the option to connect booking, payments, and
						follow-up when you&apos;re ready.
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
							What We Build
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							A Website, Done Right
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							We handle the tech. You focus on running your business.
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
							Small business owners trust us to get it done right and on time,
							without the technical runaround.
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
							Our Process
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							Simple, clear steps from first conversation to live and working,
							no technical jargon required.
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
								Tell us about your business. We&apos;ll map out the website it
								needs, pages, timeline, and cost, and you decide from there.
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
