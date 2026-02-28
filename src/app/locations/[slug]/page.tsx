/**
 * Location Page
 * Dynamic SEO pages for Texas service areas with LocalBusiness structured data
 */

import { ArrowRight, CheckCircle, MapPin } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { JsonLd } from '@/components/utilities/JsonLd'
import {
	generateLocalBusinessSchema,
	getAllLocationSlugs,
	getLocationBySlug
} from '@/lib/locations'

interface LocationPageProps {
	params: Promise<{ slug: string }>
}

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
			title: 'Location Not Found - Hudson Digital Solutions',
			description: 'The requested location page could not be found.'
		}
	}

	return {
		title: `Web Development in ${location.city}, ${location.stateCode} | Hudson Digital Solutions`,
		description: location.metaDescription,
		openGraph: {
			title: `Web Development in ${location.city}, ${location.stateCode}`,
			description: location.metaDescription
		},
		alternates: {
			canonical: `https://hudsondigitalsolutions.com/locations/${location.slug}`
		}
	}
}

export default async function LocationPage({ params }: LocationPageProps) {
	const { slug } = await params
	const location = getLocationBySlug(slug)

	if (!location) {
		notFound()
	}

	const breadcrumbSchema = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Home',
				item: 'https://hudsondigitalsolutions.com'
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: 'Locations',
				item: 'https://hudsondigitalsolutions.com/locations'
			},
			{
				'@type': 'ListItem',
				position: 3,
				name: `${location.city}, ${location.stateCode}`
			}
		]
	}

	return (
		<main className="min-h-screen bg-background">
			<JsonLd data={generateLocalBusinessSchema(location)} />
			<JsonLd data={breadcrumbSchema} />

			{/* Hero */}
			<section className="relative overflow-hidden bg-background">
				<div className="container-wide px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20 text-center max-w-4xl mx-auto">
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

			{/* Stats */}
			<section className="py-section-sm px-4 sm:px-6 border-b border-border">
				<div className="container-wide max-w-4xl mx-auto">
					<div className="grid gap-px sm:grid-cols-3 bg-border/30 rounded-2xl overflow-hidden">
						<div className="bg-background px-8 py-10 text-center relative overflow-hidden">
							<div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
							<div className="text-4xl font-black text-accent mb-2 tabular-nums">
								{location.stats.businesses}
							</div>
							<div className="text-sm text-muted-foreground">
								Local Businesses Served
							</div>
						</div>
						<div className="bg-background px-8 py-10 text-center relative overflow-hidden">
							<div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
							<div className="text-4xl font-black text-accent mb-2 tabular-nums">
								{location.stats.projects}
							</div>
							<div className="text-sm text-muted-foreground">
								Projects Completed
							</div>
						</div>
						<div className="bg-background px-8 py-10 text-center relative overflow-hidden">
							<div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
							<div className="text-4xl font-black text-accent mb-2 tabular-nums">
								{location.stats.satisfaction}
							</div>
							<div className="text-sm text-muted-foreground">
								Client Satisfaction
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Services */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide max-w-4xl mx-auto">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							What We Offer
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							Our Services in {location.city}
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
							Areas We Serve in {location.city}
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
								Schedule a free consultation to discuss how we can help your
								business thrive online.
							</p>
							<Button asChild variant="accent" size="xl" trackConversion={true}>
								<Link href="/contact">
									Get Started
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}
