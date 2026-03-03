/**
 * Locations Index Page
 * Lists all 75 service area cities grouped by state
 */

import { ArrowRight, MapPin } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getLocationsByState } from '@/lib/locations'

export const metadata: Metadata = {
	title: 'Service Locations | Hudson Digital Solutions',
	description:
		'Hudson Digital Solutions serves businesses across the US. Find web development services in your city — Texas, Florida, Georgia, Colorado, and more.',
	openGraph: {
		title: 'Service Locations | Hudson Digital Solutions',
		description: 'Web development services across the US.'
	}
}

export default function LocationsPage() {
	const locationsByState = getLocationsByState()
	const states = Object.keys(locationsByState).sort()
	const totalCities = Object.values(locationsByState).reduce(
		(sum, cities) => sum + cities.length,
		0
	)

	return (
		<main className="min-h-screen bg-background">
			{/* Hero Section */}
			<section className="relative overflow-hidden bg-background">
				<div className="container-wide px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20 text-center">
					<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
						Service Locations
					</p>
					<h1 className="text-page-title text-foreground leading-tight text-balance">
						Serving Businesses Across the US
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6">
						{totalCities} cities across {states.length} states — find web
						development services near you.
					</p>
				</div>
			</section>

			{/* Locations Grid */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="space-y-12">
						{states.map(state => (
							<div key={state}>
								<h2 className="text-h3 text-foreground border-b border-border pb-3 mb-6">
									{state}
								</h2>
								<div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
									{(locationsByState[state] ?? []).map(location => (
										<Link
											key={location.slug}
											href={`/locations/${location.slug}`}
											className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-accent/10 hover:text-accent border border-transparent hover:border-accent/20"
										>
											<MapPin
												className="h-4 w-4 shrink-0 text-accent"
												aria-hidden="true"
											/>
											{location.city}
										</Link>
									))}
								</div>
							</div>
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
								Don&apos;t see your city?
							</h2>
							<p className="text-lead text-muted-foreground mb-10 max-w-2xl mx-auto">
								We work with clients remotely across the entire US. Get in touch
								to discuss your project.
							</p>
							<Button asChild variant="accent" size="xl" trackConversion={true}>
								<Link href="/contact">
									Contact Us
									<ArrowRight className="w-4 h-4" />
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}
