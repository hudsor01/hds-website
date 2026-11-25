/**
 * Location Page
 * Dynamic SEO pages for US service areas with Service structured data
 */

import { ArrowRight, CheckCircle, MapPin } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { JsonLd } from '@/components/utilities/JsonLd'
import {
	generateLocationServiceSchema,
	getAllLocationSlugs,
	getLocationBySlug
} from '@/lib/locations'
import { buildMetadata } from '@/lib/seo-config'
import {
	generateBreadcrumbSchema,
	generateLocalBusinessSchema,
	toJsonLdGraph
} from '@/lib/seo-utils'

interface LocationPageProps {
	params: Promise<{ slug: string }>
}

// Hardcoded testimonials dropped per audit #256 — same fabricated
// Sarah Mitchell / Marcus Holt copy as about + services pages. The
// admin/testimonials CRUD seeds real rows when available.

// Every served city is prerendered. "not-found" matching makes any other
// slug a hard 404 instead of a 200 soft 404 (see blog/[slug]/page.tsx).
// Retired city slugs never get here: next.config.ts redirects them.
export const unstable_paramMatching = { slug: 'not-found' }

export function generateStaticParams() {
	return getAllLocationSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({
	params
}: LocationPageProps): Promise<Metadata> {
	const { slug } = await params
	const location = getLocationBySlug(slug)

	if (!location) {
		return {
			title: 'Location Not Found | Hudson Digital',
			description: 'The requested location page could not be found.'
		}
	}

	return buildMetadata({
		title: `Website Design in ${location.city}, ${location.stateCode} | Hudson Digital`,
		description: location.metaDescription,
		path: `/locations/${location.slug}`,
		socialTitle: `Website Design in ${location.city}, ${location.stateCode}`
	})
}

export default async function LocationPage({ params }: LocationPageProps) {
	const { slug } = await params
	const location = getLocationBySlug(slug)

	if (!location) {
		notFound()
	}

	return (
		<div className="min-h-screen bg-background">
			<JsonLd
				data={toJsonLdGraph([
					generateLocationServiceSchema(location),
					generateLocalBusinessSchema(),
					generateBreadcrumbSchema([
						{ name: 'Home', url: 'https://hudsondigitalsolutions.com' },
						{
							name: 'Locations',
							url: 'https://hudsondigitalsolutions.com/locations'
						},
						{
							name: `${location.city}, ${location.stateCode}`,
							url: `https://hudsondigitalsolutions.com/locations/${location.slug}`
						}
					])
				])}
			/>

			{/* Hero */}
			<section className="relative overflow-hidden bg-background">
				<div
					className="absolute inset-0 grid-pattern pointer-events-none"
					aria-hidden="true"
				/>
				<div
					className="hero-spotlight absolute inset-0 pointer-events-none"
					aria-hidden="true"
				/>
				<div className="relative z-10 container-wide px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20 text-center max-w-4xl mx-auto">
					<div className="flex items-center justify-center gap-2 mb-4 text-accent">
						<MapPin className="h-4 w-4" aria-hidden="true" />
						<span className="text-xs font-semibold uppercase tracking-widest">
							{location.city}, {location.stateCode}
						</span>
					</div>
					<h1 className="text-page-title text-foreground leading-tight text-balance mb-6">
						{location.tagline}
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
						{location.description}
					</p>
				</div>
			</section>

			{/* Services */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide max-w-4xl mx-auto">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							What I Offer
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							What I Build in {location.city}
						</h2>
					</div>
					<div className="grid gap-6 sm:grid-cols-3">
						{location.features.map(feature => (
							<div
								key={feature.title}
								className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors"
							>
								<h3 className="text-h3 text-foreground mb-3">
									{feature.title}
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Areas Served */}
			<section className="py-section-sm px-4 sm:px-6 bg-surface-sunken">
				<div className="container-wide max-w-4xl mx-auto">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							Coverage
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							Areas I Serve in {location.city}
						</h2>
					</div>
					<div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
						{location.neighborhoods.map(area => (
							<div
								key={area}
								className="flex items-center gap-2 text-sm text-muted-foreground"
							>
								<CheckCircle
									className="h-4 w-4 text-accent shrink-0"
									aria-hidden="true"
								/>
								{area}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="py-section px-4 sm:px-6">
				<div className="container-wide max-w-4xl mx-auto">
					<div className="relative overflow-hidden rounded-2xl border border-border bg-surface-raised p-10 md:p-16 text-center">
						<div
							className="hero-spotlight absolute inset-0 opacity-60 pointer-events-none"
							aria-hidden="true"
						/>
						<div className="relative z-10">
							<h2 className="text-section-title text-foreground mb-6 max-w-3xl mx-auto text-balance">
								Ready to Grow Your {location.city} Business?
							</h2>
							<p className="text-lead text-muted-foreground mb-10 max-w-2xl mx-auto">
								Tell me about your business. I&apos;ll map out the website it
								needs: pages, timeline and cost.
							</p>
							<Button asChild variant="accent" size="xl">
								<Link href="/contact">
									Get My Free Website Plan
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}
