import { ExternalLink, Rocket } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TypewriterText } from '@/components/ui/TypewriterText'
import { Analytics } from '@/components/utilities/Analytics'
import { getShowcaseItems } from '@/lib/showcase'

// Enable ISR with 1-hour revalidation
export const revalidate = 3600

export const metadata: Metadata = {
	title: 'Showcase - Our Work | Hudson Digital Solutions',
	description:
		'Real projects delivering measurable results. From local service businesses to e-commerce shops, see how we help businesses get online and grow.',
	openGraph: {
		title: 'Showcase - Our Work | Hudson Digital Solutions',
		description:
			'Real projects delivering measurable results. From local service businesses to e-commerce shops, see how we help businesses get online and grow.',
		type: 'website'
	}
}

// Async component for dynamic showcase data
async function ShowcaseProjects() {
	const items = await getShowcaseItems()

	return (
		<>
			{/* Stats Section */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/30 rounded-2xl overflow-hidden mb-10">
						{[
							{ value: `${items.length}+`, label: 'Projects Delivered' },
							{ value: '100%', label: 'Client Satisfaction' },
							{ value: 'Proven', label: 'ROI Results' },
							{ value: '24/7', label: 'Support Available' }
						].map((stat, index) => (
							<div
								key={index}
								className="bg-background px-8 py-10 text-center relative overflow-hidden"
							>
								<div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
								<div className="text-4xl lg:text-5xl font-black text-accent mb-2 font-mono tabular-nums">
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

			{/* Showcase Projects */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							Our Work
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							Featured Projects
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							Real projects delivering measurable results for clients across
							industries.
						</p>
					</div>

					{/* Desktop Grid / Mobile Horizontal Scroll */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
						{items.map(item => (
							<Card
								key={item.id}
								variant="project"
								id={item.id}
								slug={item.slug}
								title={item.title}
								description={item.description}
								category={item.category ?? item.industry ?? 'Project'}
								industry={item.industry ?? undefined}
								showcaseType={item.showcaseType}
								featured={item.featured}
								stats={item.metrics}
								tech_stack={item.technologies}
							/>
						))}
					</div>
				</div>
			</section>
		</>
	)
}

export default function ShowcasePage() {
	return (
		<>
			<Analytics />
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
							Our Showcase
						</p>
						<h1 className="text-page-title text-foreground leading-tight">
							<TypewriterText />
						</h1>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6 mb-10">
							From small local businesses to growing e-commerce shops, see how
							we help businesses get online and grow.
						</p>

						<div className="flex flex-col sm:flex-row gap-3 justify-center">
							<Button asChild variant="accent" size="xl" trackConversion={true}>
								<Link href="/contact">
									Start Your Project
									<Rocket className="w-5 h-5" />
								</Link>
							</Button>

							<Button
								asChild
								variant="outline"
								size="xl"
								className="border-2 border-foreground/25 hover:border-accent dark:border-foreground/20"
							>
								<Link href="/services">
									View Services
									<ExternalLink className="w-5 h-5" />
								</Link>
							</Button>
						</div>
					</div>
				</section>

				{/* Dynamic content with Suspense */}
				<Suspense
					fallback={
						<div className="container-wide py-section-sm px-4 text-center">
							<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-border border-t-accent" />
							<p className="text-sm text-muted-foreground mt-4 leading-relaxed">
								Loading projects...
							</p>
						</div>
					}
				>
					<ShowcaseProjects />
				</Suspense>

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
									Ready to create your{' '}
									<span className="text-accent">success story?</span>
								</h2>

								<p className="text-lead text-muted-foreground mb-10 max-w-2xl mx-auto">
									Join these businesses in transforming your digital presence
									into a competitive advantage. Let&apos;s build something
									together.
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
											<Rocket className="w-5 h-5" />
										</Link>
									</Button>

									<Button
										asChild
										variant="outline"
										size="xl"
										className="border-2 border-foreground/25 hover:border-accent dark:border-foreground/20"
									>
										<Link href="/services">
											View Services
											<ExternalLink className="w-5 h-5" />
										</Link>
									</Button>
								</div>
							</div>
						</div>
					</div>
				</section>
			</main>
		</>
	)
}
