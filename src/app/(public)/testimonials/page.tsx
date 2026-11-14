/**
 * Testimonials Page
 * Shows only reviews real clients submitted (via /testimonials/submit or a
 * request link) and the owner published in /admin/testimonials. Review and
 * AggregateRating JSON-LD render only when such reviews exist. With none,
 * the page says so honestly and stays out of the index.
 */

import { ArrowRight, MessageCircle, Star } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { JsonLd } from '@/components/utilities/JsonLd'
import { buildMetadata } from '@/lib/seo-config'
import { generateReviewSchema, toJsonLdGraph } from '@/lib/seo-utils'
import { getApprovedTestimonials } from '@/lib/testimonials'

export async function generateMetadata(): Promise<Metadata> {
	const testimonials = await getApprovedTestimonials()
	return buildMetadata({
		title: 'Client Reviews | Hudson Digital Solutions',
		description:
			'Reviews from Dallas-Fort Worth small business owners I have built websites for, published in their own words after the project.',
		path: '/testimonials',
		// An empty review page is thin content: index it once a real
		// review is published.
		noindex: testimonials.length === 0
	})
}

function StarRating({ rating }: { rating: number }) {
	return (
		<div
			className="flex gap-1"
			role="img"
			aria-label={`Rated ${rating} out of 5 stars`}
		>
			{Array.from({ length: 5 }, (_, i) => (
				<Star
					key={i}
					aria-hidden="true"
					className={`w-5 h-5 ${i < rating ? 'text-accent fill-accent' : 'text-muted-foreground'}`}
				/>
			))}
		</div>
	)
}

export default async function TestimonialsPage() {
	const testimonials = await getApprovedTestimonials()
	const reviewSchema = generateReviewSchema(testimonials)

	return (
		<div className="min-h-screen bg-background">
			{reviewSchema.length > 0 && <JsonLd data={toJsonLdGraph(reviewSchema)} />}

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
						Client Reviews
					</p>
					<h1 className="text-page-title text-foreground leading-tight text-balance">
						What Clients Say
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6">
						Every review here comes from a business owner I built a website for,
						published in their own words.
					</p>
				</div>
			</section>

			{/* Reviews */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					{testimonials.length > 0 ? (
						<ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{testimonials.map(testimonial => (
								<li
									key={testimonial.id}
									className="rounded-xl border border-border bg-surface-raised p-8 flex flex-col"
								>
									<div className="mb-4">
										<StarRating rating={testimonial.rating} />
									</div>
									<blockquote className="mb-6 flex-grow">
										<MessageCircle
											className="w-8 h-8 text-accent/30 mb-3"
											aria-hidden="true"
										/>
										<p className="text-sm text-muted-foreground leading-relaxed">
											&ldquo;{testimonial.content}&rdquo;
										</p>
									</blockquote>
									<div className="border-t border-border pt-6">
										<div className="font-semibold text-foreground text-sm">
											{testimonial.client_name}
										</div>
										{(testimonial.role || testimonial.company) && (
											<div className="text-xs text-muted-foreground mt-0.5">
												{[testimonial.role, testimonial.company]
													.filter(Boolean)
													.join(', ')}
											</div>
										)}
									</div>
								</li>
							))}
						</ul>
					) : (
						<div className="max-w-2xl mx-auto rounded-xl border border-border bg-surface-raised p-10 text-center">
							<h2 className="text-h3 text-foreground mb-3">
								Reviews Are On the Way
							</h2>
							<p className="text-muted-foreground leading-relaxed mb-8">
								I only publish reviews from real clients, so this page fills in
								as projects wrap up. Until then, the work speaks for itself in
								the showcase.
							</p>
							<div className="flex flex-col sm:flex-row gap-3 justify-center">
								<Button asChild variant="accent" size="lg">
									<Link href="/showcase">
										See My Work
										<ArrowRight className="w-4 h-4" aria-hidden="true" />
									</Link>
								</Button>
								<Button asChild variant="outline" size="lg">
									<Link href="/testimonials/submit">
										Worked With Me? Leave a Review
									</Link>
								</Button>
							</div>
						</div>
					)}
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
								<span className="text-accent">brings in work?</span>
							</h2>
							<p className="text-lead text-muted-foreground mb-10 max-w-2xl mx-auto">
								Book a free 30-minute website plan call. You get the timeline
								and a real price, then you decide from there.
							</p>
							<div className="flex flex-col sm:flex-row gap-3 justify-center">
								<Button asChild variant="accent" size="xl">
									<Link href="/contact">
										Get My Free Website Plan
										<ArrowRight className="w-5 h-5" aria-hidden="true" />
									</Link>
								</Button>
								<Button
									asChild
									variant="outline"
									size="xl"
									className="border-2 border-foreground/25 hover:border-accent dark:border-foreground/20"
								>
									<Link href="/showcase">View Showcase</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}
