import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ProcessSteps } from '@/components/ui/ProcessSteps'
import { ServicesGrid } from '@/components/ui/ServicesGrid'
import { SEO_CONFIG } from '@/utils/seo'

export const metadata: Metadata = {
	title:
		SEO_CONFIG.services?.title || 'Our Services | Hudson Digital Solutions',
	description:
		SEO_CONFIG.services?.description ||
		'Custom web development, integrations, and business automation for growing businesses.',
	keywords: SEO_CONFIG.services?.keywords || [],
	openGraph: {
		title:
			SEO_CONFIG.services?.ogTitle ??
			SEO_CONFIG.services?.title ??
			'Our Services | Hudson Digital Solutions',
		description:
			SEO_CONFIG.services?.ogDescription ??
			SEO_CONFIG.services?.description ??
			'Website development, tool integrations, and workflow automation.',
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
	{ value: '2-4 wks', label: 'Typical Delivery' },
	{ value: 'Expert', label: 'Development Team' },
	{ value: 'Proven', label: 'ROI Results' },
	{ value: '<24hr', label: 'Response Time' }
]

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

export default function ServicesPage() {
	return (
		<main className="min-h-screen bg-background">
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
						Everything Your Business Needs Online
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6 mb-10">
						From your first website to full business automation — we handle it
						all so you don&apos;t have to.
					</p>
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Button asChild variant="accent" size="xl" trackConversion={true}>
							<Link href="/contact">
								Start Your Project
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
							Services That Grow Your Business
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
							Small business owners trust us to get it done right and on time —
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
							Simple, clear steps from first conversation to live and working —
							no technical jargon required.
						</p>
					</div>
					<ProcessSteps />
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
								Ready to stop doing it{' '}
								<span className="text-accent">manually?</span>
							</h2>

							<p className="text-lead text-muted-foreground mb-10 max-w-2xl mx-auto">
								Tell us what&apos;s taking up your time. We&apos;ll put together
								a plan to build, connect, or automate it — and give you back
								your day.
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
									<Link href="#services-list">Explore Services</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}
