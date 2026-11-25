/**
 * Locations Index Page
 * The Dallas-Fort Worth cities served in person, plus a pointer for
 * everyone else (remote work).
 */

import { ArrowRight, MapPin } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LOCATIONS } from '@/lib/locations'
import { buildMetadata } from '@/lib/seo-config'

export const metadata: Metadata = buildMetadata({
	title: 'Dallas-Fort Worth Service Areas | Hudson Digital',
	description:
		'Web design from a Lewisville studio for small businesses across Dallas-Fort Worth: Lewisville, Dallas, Fort Worth, Arlington and the cities around them.',
	path: '/locations',
	socialDescription:
		'Web design from a Lewisville studio for small businesses across Dallas-Fort Worth.'
})

export default function LocationsPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<section className="relative overflow-hidden bg-background">
				<div
					className="absolute inset-0 grid-pattern pointer-events-none"
					aria-hidden="true"
				/>
				<div
					className="hero-spotlight absolute inset-0 pointer-events-none"
					aria-hidden="true"
				/>
				<div className="relative z-10 container-wide pt-28 pb-16 sm:pt-32 sm:pb-20 text-center">
					<p className="text-xs font-semibold uppercase tracking-widest text-accent-text mb-3">
						Service Locations
					</p>
					<h1 className="text-page-title text-foreground text-balance">
						Web Design Across Dallas-Fort Worth
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6">
						I am based in Lewisville and work in person with small businesses
						across the DFW metroplex.
					</p>
				</div>
			</section>

			{/* Locations Grid */}
			<section className="py-section-sm">
				<div className="container-wide">
					<ul className="grid gap-4 sm:grid-cols-2 max-w-3xl mx-auto">
						{LOCATIONS.map(location => (
							<li key={location.slug}>
								<Link
									href={`/locations/${location.slug}`}
									className="group flex h-full flex-col rounded-xl border border-border bg-surface-raised p-6 transition-colors hover:border-accent"
								>
									<span className="flex items-center gap-2 text-h4 text-foreground group-hover:text-accent-text transition-colors">
										<MapPin
											className="h-5 w-5 shrink-0 text-accent"
											aria-hidden="true"
										/>
										{location.city}, {location.stateCode}
									</span>
									<span className="mt-2 text-sm text-muted-foreground leading-relaxed">
										{location.neighborhoods.slice(0, 4).join(', ')} and nearby
									</span>
								</Link>
							</li>
						))}
					</ul>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-section">
				<div className="container-wide">
					<div className="relative overflow-hidden rounded-2xl border border-border bg-surface-raised p-10 md:p-16 text-center">
						<div
							className="hero-spotlight absolute inset-0 opacity-60 pointer-events-none"
							aria-hidden="true"
						/>
						<div className="relative z-10">
							<h2 className="text-h1 text-foreground mb-6 max-w-3xl mx-auto text-balance">
								Outside North Texas?
							</h2>
							<p className="text-lead text-muted-foreground mb-10 max-w-2xl mx-auto">
								I work with clients remotely too. Tell me what you&apos;re
								building and I&apos;ll tell you how I&apos;d approach it.
							</p>
							<Button asChild variant="accent" size="xl">
								<Link href="/contact">
									Get My Free Website Plan
									<ArrowRight className="w-4 h-4" />
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}
