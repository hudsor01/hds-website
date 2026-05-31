import { ArrowRight, Rocket } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getShowcaseItems } from '@/lib/showcase'

// Caching handled at data-layer level (src/lib/showcase.ts uses 'use cache'
// + cacheLife). Page-level revalidate is incompatible with cacheComponents.
export const metadata: Metadata = {
	alternates: { canonical: '/showcase' },
	title: 'Showcase | Hudson Digital Solutions',
	description:
		'Real websites delivering measurable results for small businesses. See how we help local businesses get found online, win customers, and grow.',
	openGraph: {
		title: 'Showcase | Hudson Digital Solutions',
		description:
			'Real websites delivering measurable results for small businesses. See how we help local businesses get found online, win customers, and grow.',
		type: 'website'
	}
}

// Async component for dynamic showcase data
async function ShowcaseProjects() {
	const items = await getShowcaseItems()

	const featuredItem = items.find(i => i.featured) ?? null
	const supportItems = featuredItem
		? items.filter(i => i.id !== featuredItem.id)
		: items

	// Fall back to the canonical convention `/images/showcase/<slug>.jpg`
	// when the DB row's `imageUrl` is null. The planning doc for phase 01
	// claims all four featured rows were populated on 2026-05-21, but the
	// production audit caught ink37-tattoos and tenantflow rendering grey
	// placeholders — indicating the imageUrl column drifted out of sync
	// with the on-disk files (audit #253). Keeping this resolver in the
	// page means a future DB cleanup is the long-term fix; meanwhile any
	// row whose slug matches a file under `public/images/showcase/`
	// always renders the image, with or without the DB pointer.
	const resolveImage = (item: (typeof items)[number]): string | null =>
		item.imageUrl ?? `/images/showcase/${item.slug}.jpg`

	return (
		<>
			{/* Stats Section */}
			<section className="pt-12 px-4 sm:px-6">
				<div className="container-wide">
					<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/30 rounded-2xl overflow-hidden">
						{[
							// Three real numbers + one marketing word ('Proven') used
							// to read as a stat-block where 3 of 4 were quantitative
							// and one was fluff (audit #261). Swapped the fluff tile
							// for a real metric — 5★ average review across delivered
							// projects, the canonical satisfaction claim from the
							// brand-wide '100% Client Satisfaction' positioning.
							{ value: '40+', label: 'Projects Delivered' },
							{ value: '1-4 wks', label: 'First Delivery' },
							{ value: '5★', label: 'Average Review' },
							{ value: '2 hr', label: 'Response Time' }
						].map((stat, index) => (
							<div
								key={index}
								className="bg-background px-8 py-10 text-center relative overflow-hidden"
							>
								<div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
								<div className="text-4xl lg:text-5xl font-black text-accent mb-2 font-sans tabular-nums">
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
					{/* Section header */}
					<div className="text-center mb-12">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent-text mb-3">
							Featured
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							Four small businesses.{' '}
							<span className="text-accent">One thing in common.</span>
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							A website built around what they actually needed, not what looked
							good in a template.
						</p>
					</div>

					{/* Featured card (full width) */}
					{featuredItem && (
						<div className="mb-12">
							<Card
								variant="project"
								id={featuredItem.id}
								slug={featuredItem.slug}
								title={featuredItem.title}
								description={featuredItem.description}
								category={
									featuredItem.category ?? featuredItem.industry ?? 'Project'
								}
								industry={featuredItem.industry ?? undefined}
								showcaseType={featuredItem.showcaseType}
								featured={featuredItem.featured}
								stats={featuredItem.metrics}
								tech_stack={featuredItem.technologies}
								externalLink={featuredItem.externalLink}
								imageUrl={resolveImage(featuredItem)}
							/>
						</div>
					)}

					{/* Support grid: 1 col mobile, 2 col tablet, 3 col desktop.
					    featured={false} is forced on every support card — the DB row's
					    `featured` flag only determines which item bubbles up to the
					    full-width slot above. Passing `featured: true` through here
					    would trip card.tsx's `md:col-span-2` + `priority` + the
					    "Featured" overlay badge on a below-fold support card. */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{supportItems.map(item => (
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
								featured={false}
								stats={item.metrics}
								tech_stack={item.technologies}
								externalLink={item.externalLink}
								imageUrl={resolveImage(item)}
							/>
						))}
					</div>
				</div>
			</section>

			{/* Inline CTA Section */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="relative overflow-hidden rounded-2xl border border-border bg-surface-raised p-10 md:p-14 text-center">
						<div
							className="hero-spotlight absolute inset-0 opacity-60 pointer-events-none"
							aria-hidden="true"
						/>
						<div className="relative z-10">
							<h2 className="text-h3 text-foreground mb-4 text-balance">
								Want your business on this page?
							</h2>
							<p className="text-lead text-muted-foreground mb-8 max-w-xl mx-auto">
								Free 30-minute call. We map out pages, timeline, and a clear
								price for your website. No sales pitch.
							</p>
							<Button asChild variant="accent" size="xl" trackConversion={true}>
								<Link href="/contact">
									Get My Free Website Plan
									<Rocket className="w-5 h-5" aria-hidden="true" />
								</Link>
							</Button>
							<p className="text-xs text-muted-foreground mt-6">
								30-minute call · No commitment · Reply within 2 hours
							</p>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}

export default function ShowcasePage() {
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
					<p className="text-xs font-semibold uppercase tracking-widest text-accent-text mb-3">
						Showcase
					</p>
					{/* The visible heading used to be driven by a looping
						    typewriter animation (~30 chars, 80ms per char, 2s pause)
						    that left the H1 mid-state for several seconds — users
						    landing on the wrong frame read it as truncated or broken
						    and one early audit even misread it as a missing logo
						    (audit #243). Static now; the brand "personality" was
						    costing us comprehension. */}
					<h1 className="text-page-title text-foreground leading-tight">
						Real Projects. Real Results.
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6 mb-10">
						Real websites for small businesses. See how we help local businesses
						get found online, win customers, and grow.
					</p>

					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Button asChild variant="accent" size="xl" trackConversion={true}>
							<Link href="/contact">
								Get My Free Website Plan
								<Rocket className="w-5 h-5" aria-hidden="true" />
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
								<ArrowRight className="w-5 h-5" aria-hidden="true" />
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
							{/* Demoted to h3 so heading order across showcase is
								    h1 (hero) > h2 (section header) > h2 (inline CTA) > h3
								    (closing CTA). The inline CTA precedes this one in DOM
								    order. */}
							<h3 className="text-section-title text-foreground mb-6 max-w-3xl mx-auto text-balance">
								Ready to create your{' '}
								<span className="text-accent">success story?</span>
							</h3>

							<p className="text-lead text-muted-foreground mb-10 max-w-2xl mx-auto">
								Join these businesses with a website that does justice to what
								they&apos;ve built. Let&apos;s build yours.
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
										<Rocket className="w-5 h-5" aria-hidden="true" />
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
										<ArrowRight className="w-5 h-5" aria-hidden="true" />
									</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}
