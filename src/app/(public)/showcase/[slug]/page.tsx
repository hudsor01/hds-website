/**
 * Showcase Detail Page
 * Renders differently based on showcaseType:
 * - 'quick': Portfolio-style view (image, stats, tech stack)
 * - 'detailed': Case-study-style view (challenge/solution/results narrative)
 */

import { Clock, ExternalLink, Users } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { CTASection } from '@/components/utilities/CTASection'
import { JsonLd } from '@/components/utilities/JsonLd'
import { env } from '@/env'
import { buildMetadata, qualifiedTitle } from '@/lib/seo-config'
import {
	BUSINESS_ID,
	generateBreadcrumbSchema,
	toJsonLdGraph
} from '@/lib/seo-utils'
import {
	getAllShowcaseSlugs,
	getShowcaseBySlug,
	isDetailedShowcase,
	type ShowcaseItem
} from '@/lib/showcase'
import { showcaseStaticParams } from './static-params'

// Every published showcase item is prerendered at build. "not-found" matching
// is the Cache Components replacement for `dynamicParams = false` (same as
// blog/[slug]/page.tsx): any other slug is a hard 404 with no render. Without
// it the showcase loading.tsx shell streams first and an unknown slug answers
// HTTP 200. Tradeoff: a showcase row published after a deploy 404s until the
// next deploy. Showcase content already ships through committed scripts/sql
// plus a deploy, so this matches current practice.
export const unstable_paramMatching = { slug: 'not-found' }

// With a database configured, an empty slug list fails the build instead of
// shipping a deploy where every showcase page 404s (see static-params.ts).
export async function generateStaticParams() {
	return showcaseStaticParams(
		await getAllShowcaseSlugs(),
		Boolean(env.POSTGRES_URL)
	)
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
	const socialTitle = `${item.title} | ${typeLabel}`

	return buildMetadata({
		title: qualifiedTitle(item.title, typeLabel),
		description: item.description,
		path: `/showcase/${slug}`,
		socialTitle,
		images: item.ogImageUrl ? [item.ogImageUrl] : undefined
	})
}

// Synchronous: the parent already awaited and notFound()'d on miss,
// so by the time we render here we know `item` is real. Keeping the
// extraction in its own function makes the JSX-heavy branch readable.
function ShowcaseContent({ item }: { item: ShowcaseItem }) {
	const isDetailed = isDetailedShowcase(item)
	const metrics = Object.entries(item.metrics).map(([label, value]) => ({
		label,
		value
	}))

	return (
		<>
			{/* Hero */}
			<section className="relative overflow-hidden bg-background">
				<div className="container-wide pt-28 pb-16 sm:pt-32 sm:pb-20">
					<div className="mb-4">
						<span className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-accent-text text-sm font-semibold">
							{item.industry ?? item.category}{' '}
							{item.projectType && `\u2022 ${item.projectType}`}
						</span>
					</div>

					<h1 className="text-page-title text-foreground text-balance mb-6">
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
				<section className="py-section-sm">
					<div className="container-wide">
						<div className="grid gap-px md:grid-cols-4 bg-border/30 rounded-2xl overflow-hidden">
							{metrics.map((metric, i) => (
								<div
									key={i}
									className="bg-background px-8 py-10 text-center relative overflow-hidden"
								>
									<div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
									<div className="text-4xl font-black text-accent-text mb-2 tabular-nums">
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
			<section className="py-section-sm">
				<div className="container-wide">
					<div className="grid gap-12">
						{isDetailed ? (
							/* Detailed Case Study View */
							<>
								{item.challenge && (
									<div>
										<h2 className="text-h1 text-foreground mb-comfortable text-balance">
											The Challenge
										</h2>
										<div className="rounded-xl border border-border bg-card p-8">
											<p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
												{item.challenge}
											</p>
										</div>
									</div>
								)}

								{item.solution && (
									<div>
										<h2 className="text-h1 text-foreground mb-comfortable text-balance">
											The Solution
										</h2>
										<div className="rounded-xl border border-border bg-card p-8">
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
										<h2 className="text-h1 text-foreground mb-comfortable text-balance">
											The Results
										</h2>
										<div className="rounded-xl border border-border bg-card p-8">
											<p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
												{item.results}
											</p>

											{item.externalLink && (
												<div className="mt-content-block">
													<a
														href={item.externalLink}
														target="_blank"
														rel="noopener"
														className="inline-flex items-center gap-tight text-accent-text hover:underline underline-offset-4 transition-colors"
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
										<h2 className="text-h1 text-foreground mb-comfortable text-balance">
											About This Project
										</h2>
										<div className="rounded-xl border border-border bg-card p-8">
											<p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
												{item.longDescription}
											</p>
										</div>
									</div>
								)}

								{item.technologies && item.technologies.length > 0 && (
									<div>
										<h2 className="text-h1 text-foreground mb-comfortable text-balance">
											Tech Stack
										</h2>
										<div className="rounded-xl border border-border bg-card p-8">
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
										<h2 className="text-h1 text-foreground mb-comfortable text-balance">
											Links
										</h2>
										<div className="rounded-xl border border-border bg-card p-8">
											<div className="flex flex-wrap gap-content">
												<a
													href={item.externalLink}
													target="_blank"
													rel="noopener"
													className="inline-flex items-center gap-tight text-accent-text hover:underline underline-offset-4 transition-colors"
												>
													View Live Project
													<ExternalLink className="w-4 h-4" />
												</a>
												{item.githubLink && (
													<a
														href={item.githubLink}
														target="_blank"
														rel="noopener noreferrer"
														className="inline-flex items-center gap-tight text-accent-text hover:underline underline-offset-4 transition-colors"
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
								<h2 className="text-h1 text-foreground mb-comfortable text-balance">
									Client Testimonial
								</h2>
								<div className="rounded-xl border border-border bg-card p-8">
									{item.testimonialVideoUrl && (
										<div className="mb-content-block">
											<div className="aspect-video rounded-xl overflow-hidden bg-muted">
												<iframe
													src={item.testimonialVideoUrl.replace(
														'watch?v=',
														'embed/'
													)}
													title={`Video testimonial from ${item.testimonialAuthor}`}
													allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
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
												<span className="text-accent-text font-bold text-2xl">
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

			<CTASection
				title="Want Results Like This?"
				description="Let's discuss how I can help you achieve similar results for your business."
			/>
		</>
	)
}

export default async function ShowcaseDetailPage({
	params
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params

	// Await the DB lookup at the top of the route instead of inside a
	// child Suspense boundary. Previously the Suspense fallback rendered
	// a spinner + "Loading project..." for the duration of the Neon
	// cold start, then notFound() fired, then the 404 page replaced
	// it — leaving a confusing "loading then broken" flash for any
	// unknown slug (audit #241). Awaiting here means the 404 path
	// short-circuits before any UI mounts; the known-slug path still
	// streams normally because Next.js renders the rest of the route
	// only after this promise resolves.
	const item = await getShowcaseBySlug(slug)
	if (!item) {
		notFound()
	}

	const SITE_URL = 'https://hudsondigitalsolutions.com'

	const pageUrl = `${SITE_URL}/showcase/${slug}`
	// Built by the business entity (shared @id), and pointing at the live
	// site, so the case study attaches to the same graph as the rest of the
	// site and parsers can see the work is real.
	const creativeWork = {
		'@type': 'CreativeWork',
		'@id': `${pageUrl}#work`,
		name: item.title,
		description: item.description,
		abstract: item.results ?? undefined,
		image: item.ogImageUrl ?? item.imageUrl ?? undefined,
		creator: { '@id': BUSINESS_ID },
		author: { '@id': BUSINESS_ID },
		...(item.externalLink && { sameAs: item.externalLink }),
		keywords:
			item.technologies.length > 0 ? item.technologies.join(', ') : undefined,
		datePublished: (item.publishedAt ?? item.createdAt)?.toISOString(),
		dateModified: item.updatedAt?.toISOString(),
		url: pageUrl
	}

	const breadcrumb = generateBreadcrumbSchema([
		{ name: 'Home', url: SITE_URL },
		{ name: 'Showcase', url: `${SITE_URL}/showcase` },
		{ name: item.title, url: pageUrl }
	])

	return (
		<>
			<JsonLd data={toJsonLdGraph([creativeWork, breadcrumb])} />
			<div className="min-h-screen bg-background">
				{/* Breadcrumb */}
				<div className="py-8">
					<div className="container-wide">
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbLink asChild>
										<Link
											href="/"
											className="text-muted-foreground hover:text-foreground transition-colors"
										>
											Home
										</Link>
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									<BreadcrumbLink asChild>
										<Link
											href="/showcase"
											className="text-muted-foreground hover:text-foreground transition-colors"
										>
											Showcase
										</Link>
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									<BreadcrumbPage className="text-foreground">
										{item.title}
									</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</div>

				<ShowcaseContent item={item} />
			</div>
		</>
	)
}
