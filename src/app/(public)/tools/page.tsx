/**
 * Tools Landing Page
 * Server shell — metadata + static sections. Catalog (grid + search +
 * categories) lives in ToolsCatalog as a client component so the
 * filter state stays out of the hydration boundary for the static
 * surrounds.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ToolsCatalog from './ToolsCatalog'

export const metadata: Metadata = {
	alternates: { canonical: '/tools' },
	title: 'Free Business Tools & Calculators | Hudson Digital Solutions',
	description:
		'Free interactive tools for business owners and freelancers. Calculate ROI, generate invoices and contracts, format JSON, analyze performance, and more.',
	openGraph: {
		title: 'Free Business Tools & Calculators',
		description:
			'Interactive tools to help you make data-driven decisions about your website.'
	}
}

export default function ToolsPage() {
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
						Try For Free
					</p>
					<h1 className="text-page-title text-foreground leading-tight text-balance">
						Free Business Tools
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6">
						Make data-driven decisions about your website with our free
						interactive calculators. No credit card required, no signup needed.
					</p>
				</div>
			</section>

			{/* Catalog (categories + search) */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<ToolsCatalog />
				</div>
			</section>

			{/* Trust Signals */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="grid gap-px sm:grid-cols-3 bg-border/30 rounded-2xl overflow-hidden">
						<div className="bg-background px-8 py-10 text-center relative overflow-hidden">
							<div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
							<div className="text-4xl font-black text-accent mb-2 tabular-nums">
								Growing
							</div>
							<div className="text-sm text-muted-foreground">
								Calculations Performed
							</div>
						</div>

						<div className="bg-background px-8 py-10 text-center relative overflow-hidden">
							<div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
							<div className="text-4xl font-black text-accent mb-2 tabular-nums">
								98%
							</div>
							<div className="text-sm text-muted-foreground">Accuracy Rate</div>
						</div>

						<div className="bg-background px-8 py-10 text-center relative overflow-hidden">
							<div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
							<div className="text-4xl font-black text-accent mb-2 tabular-nums">
								100%
							</div>
							<div className="text-sm text-muted-foreground">Free Forever</div>
						</div>
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
								Ready to Take Action?
							</h2>
							<p className="text-lead text-muted-foreground mb-10 max-w-2xl mx-auto">
								These calculators show the potential. Let&apos;s make it
								reality. Schedule a free consultation to discuss your project.
							</p>
							<div className="flex flex-col sm:flex-row gap-3 justify-center">
								<Button
									asChild
									variant="accent"
									size="xl"
									trackConversion={true}
								>
									<Link href="/contact">Get My Free Website Plan</Link>
								</Button>
								<Button
									asChild
									variant="outline"
									size="xl"
									className="border-2 border-foreground/25 hover:border-accent dark:border-foreground/20"
								>
									<Link href="/services">View Services</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}
