/**
 * Showcase Detail Page
 * Renders differently based on showcaseType:
 * - 'quick': Portfolio-style view (image, stats, tech stack)
 * - 'detailed': Case-study-style view (challenge/solution/results narrative)
 */

import { ArrowLeft, ArrowRight, Clock, ExternalLink, Users } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import {
	getAllShowcaseSlugs,
	getShowcaseBySlug,
	isDetailedShowcase
} from '@/lib/showcase'

// Generate static params for all showcase items
export async function generateStaticParams() {
	const slugs = await getAllShowcaseSlugs()
	const results = slugs.map(slug => ({ slug }))

	if (results.length === 0) {
		return [{ slug: '__placeholder__' }]
	}

	return results
}

export async function generateMetadata({
	params
}: {
	params: Promise<{ slug: string }>
}): Promise<Metadata> {
	const { slug } = await params
	const item = await getShowcaseBySlug(slug)

	if (!item) {
		return {
			title: 'Project Not Found'
		}
	}

	const typeLabel = isDetailedShowcase(item) ? 'Case Study' : 'Project'
	const pageTitle = `${item.title} | ${typeLabel}`
	const ogImage = item.ogImageUrl ?? '/HDS-Logo.webp'

	return {
		title: pageTitle,
		description: item.description,
		keywords: `${typeLabel.toLowerCase()}, ${item.industry ?? ''}, ${item.projectType ?? ''}, ${item.technologies?.join(', ') || ''}`,
		openGraph: {
			title: pageTitle,
			description: item.description,
			images: [
				{
					url: ogImage,
					width: 1200,
					height: 630,
					alt: item.title
				}
			],
			type: 'article'
		},
		twitter: {
			card: 'summary_large_image',
			title: pageTitle,
			description: item.description,
			images: [ogImage]
		},
		alternates: {
			canonical: `/showcase/${slug}`
		}
	}
}

// Async component for showcase content
async function ShowcaseContent({ slug }: { slug: string }) {
	const item = await getShowcaseBySlug(slug)

	if (!item) {
		notFound()
	}

	const isDetailed = isDetailedShowcase(item)
	const metrics = Object.entries(item.metrics).map(([label, value]) => ({
		label,
		value
	}))

	return (
		<>
			{/* Hero */}
			<section className="relative overflow-hidden bg-background">
				<div className="container-wide px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20">
					<div className="mb-4">
						<span className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-accent text-sm font-semibold">
							{item.industry ?? item.category}{' '}
							{item.projectType && `\u2022 ${item.projectType}`}
						</span>
					</div>

					<h1 className="text-page-title text-foreground leading-tight text-balance mb-6">
						{item.title}
					</h1>

					<p className="text-lead text-muted-foreground mb-comfortable max-w-4xl">
						{item.description}
					</p>

					{(item.projectDuration || item.teamSize) && (
						<div className="flex gap-comfortable text-muted-foreground">
							{item.projectDuration && (
								<div className="flex items-center gap-tight">
									<Clock className="w-5 h-5" />
									<span>{item.projectDuration}</span>
								</div>
							)}
							{item.teamSize && (
								<div className="flex items-center gap-tight">
									<Users className="w-5 h-5" />
									<span>{item.teamSize} team members</span>
								</div>
							)}
						</div>
					)}
				</div>
			</section>

			{/* Metrics Showcase */}
			{metrics.length > 0 && (
				<section className="py-section-sm px-4 sm:px-6 border-b border-border">
					<div className="container-wide">
						<div className="grid gap-px md:grid-cols-4 bg-border/30 rounded-2xl overflow-hidden">
							{metrics.map((metric, i) => (
								<div
									key={i}
									className="bg-background px-8 py-10 text-center relative overflow-hidden"
								>
									<div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
									<div className="text-4xl font-black text-accent mb-2 tabular-nums">
										{metric.value}
									</div>
									<div className="text-sm text-muted-foreground">
										{metric.label}
									</div>
								</div>
							))}
						</div>
					</div>
				</section>
			)}

			{/* Main Content - Type-aware rendering */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide max-w-5xl">
					<div className="grid gap-12">
						{isDetailed ? (
							/* Detailed Case Study View */
							<>
								{item.challenge && (
									<div>
										<h2 className="text-section-title text-foreground mb-comfortable text-balance">
											The Challenge
										</h2>
										<div className="rounded-xl border border-border bg-surface-raised p-8">
											<p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
												{item.challenge}
											</p>
										</div>
									</div>
								)}

								{item.solution && (
									<div>
										<h2 className="text-section-title text-foreground mb-comfortable text-balance">
											Our Solution
										</h2>
										<div className="rounded-xl border border-border bg-surface-raised p-8">
											<p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
												{item.solution}
											</p>

											{item.technologies && item.technologies.length > 0 && (
												<div className="mt-content-block">
													<h3 className="text-h4 text-foreground mb-heading">
														Technologies Used
													</h3>
													<div className="flex flex-wrap gap-tight">
														{item.technologies.map((tech, i) => (
															<span
																key={i}
																className="px-3 py-1 bg-muted/50 border border-border rounded-full text-muted-foreground text-sm"
															>
																{tech}
															</span>
														))}
													</div>
												</div>
											)}
										</div>
									</div>
								)}

								{item.results && (
									<div>
										<h2 className="text-section-title text-foreground mb-comfortable text-balance">
											The Results
										</h2>
										<div className="rounded-xl border border-border bg-surface-raised p-8">
											<p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
												{item.results}
											</p>

											{item.externalLink && (
												<div className="mt-content-block">
													<a
														href={item.externalLink}
														target="_blank"
														rel="noopener noreferrer"
														className="inline-flex items-center gap-tight text-accent hover:text-accent/80 transition-colors"
													>
														View Live Project
														<ExternalLink className="w-4 h-4" />
													</a>
												</div>
											)}
										</div>
									</div>
								)}
							</>
						) : (
							/* Quick Portfolio View */
							<>
								{item.longDescription && (
									<div>
										<h2 className="text-section-title text-foreground mb-comfortable text-balance">
											About This Project
										</h2>
										<div className="rounded-xl border border-border bg-surface-raised p-8">
											<p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
												{item.longDescription}
											</p>
										</div>
									</div>
								)}

								{item.technologies && item.technologies.length > 0 && (
									<div>
										<h2 className="text-section-title text-foreground mb-comfortable text-balance">
											Tech Stack
										</h2>
										<div className="rounded-xl border border-border bg-surface-raised p-8">
											<div className="flex flex-wrap gap-tight">
												{item.technologies.map((tech, i) => (
													<span
														key={i}
														className="px-4 py-2 bg-muted/50 border border-border rounded-full text-muted-foreground"
													>
														{tech}
													</span>
												))}
											</div>
										</div>
									</div>
								)}

								{item.externalLink && (
									<div>
										<h2 className="text-section-title text-foreground mb-comfortable text-balance">
											Links
										</h2>
										<div className="rounded-xl border border-border bg-surface-raised p-8">
											<div className="flex flex-wrap gap-content">
												<a
													href={item.externalLink}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-tight text-accent hover:text-accent/80 transition-colors"
												>
													View Live Project
													<ExternalLink className="w-4 h-4" />
												</a>
												{item.githubLink && (
													<a
														href={item.githubLink}
														target="_blank"
														rel="noopener noreferrer"
														className="inline-flex items-center gap-tight text-accent hover:text-accent/80 transition-colors"
													>
														View Source Code
														<ExternalLink className="w-4 h-4" />
													</a>
												)}
											</div>
										</div>
									</div>
								)}
							</>
						)}

						{/* Testimonial - shown for both types if available */}
						{item.testimonialText && (
							<div>
								<h2 className="text-section-title text-foreground mb-comfortable text-balance">
									Client Testimonial
								</h2>
								<div className="rounded-xl border border-border bg-surface-raised p-8">
									{item.testimonialVideoUrl && (
										<div className="mb-content-block">
											<div className="aspect-video rounded-lg overflow-hidden bg-muted">
												<iframe
													src={item.testimonialVideoUrl.replace(
														'watch?v=',
														'embed/'
													)}
													title={`Video testimonial from ${item.testimonialAuthor}`}
													allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
													allowFullScreen
													className="w-full h-full"
												/>
											</div>
										</div>
									)}

									<blockquote className="text-2xl text-muted-foreground italic mb-content-block">
										&ldquo;{item.testimonialText}&rdquo;
									</blockquote>

									{item.testimonialAuthor && (
										<div className="flex items-center gap-content">
											<div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
												<span className="text-accent font-bold text-2xl">
													{item.testimonialAuthor.charAt(0)}
												</span>
											</div>
											<div>
												<div className="font-bold text-foreground text-lg">
													{item.testimonialAuthor}
												</div>
												{item.testimonialRole && (
													<div className="text-muted-foreground">
														{item.testimonialRole}
													</div>
												)}
												{item.clientName && (
													<div className="text-muted-foreground">
														{item.clientName}
													</div>
												)}
											</div>
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="py-section px-4 sm:px-6">
				<div className="container-wide">
					<div className="relative overflow-hidden rounded-2xl border border-border bg-surface-raised p-10 md:p-16 text-center">
						<div
							className="hero-spotlight absolute inset-0 opacity-60 pointer-events-none"
							aria-hidden="true"
						/>
						<div className="relative z-10">
							<h2 className="text-section-title text-foreground mb-6 max-w-3xl mx-auto text-balance">
								Want Results Like This?
							</h2>
							<p className="text-lead text-muted-foreground mb-10 max-w-2xl mx-auto">
								Let&apos;s discuss how we can help you achieve similar results
								for your business.
							</p>
							<Button asChild variant="accent" size="xl" trackConversion={true}>
								<Link href="/contact">
									Start Your Project
									<ArrowRight className="w-4 h-4" />
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}

export default async function ShowcaseDetailPage({
	params
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params

	return (
		<main className="min-h-screen bg-background">
			{/* Back Button */}
			<div className="py-8 px-4 sm:px-6">
				<div className="container-wide">
					<Link
						href="/showcase"
						className="inline-flex items-center gap-tight text-accent hover:text-accent/80 transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Showcase
					</Link>
				</div>
			</div>

			{/* Dynamic content with Suspense */}
			<Suspense
				fallback={
					<div className="container-wide py-section text-center">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-border border-t-accent" />
						<p className="text-muted-foreground text-lg mt-4">
							Loading project...
						</p>
					</div>
				}
			>
				<ShowcaseContent slug={slug} />
			</Suspense>
		</main>
	)
}
