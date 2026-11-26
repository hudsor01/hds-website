/**
 * Service Page
 * One indexable page per service in SERVICES, with Service, FAQPage and
 * BreadcrumbList structured data. Links out to related blog posts and the
 * other services so the blog and the money pages reinforce each other.
 */

import { ArrowRight, CheckCircle } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BlogPostCard } from '@/components/blog/BlogPostCard'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { JsonLd } from '@/components/utilities/JsonLd'
import { getPostsByTag } from '@/lib/blog'
import { getServiceBySlug, SERVICES } from '@/lib/constants/services'
import { buildMetadata } from '@/lib/seo-config'
import {
	generateBreadcrumbSchema,
	generateFaqSchema,
	generateLocalBusinessSchema,
	generateServiceSchema,
	toJsonLdGraph
} from '@/lib/seo-utils'

interface ServicePageProps {
	params: Promise<{ slug: string }>
}

const SITE_URL = 'https://hudsondigitalsolutions.com'
const RELATED_POST_LIMIT = 3

// Every service is prerendered. "not-found" matching makes any other slug a
// hard 404 instead of a 200 soft 404 (see blog/[slug]/page.tsx).
export const unstable_paramMatching = { slug: 'not-found' }

export function generateStaticParams() {
	return SERVICES.map(service => ({ slug: service.slug }))
}

export async function generateMetadata({
	params
}: ServicePageProps): Promise<Metadata> {
	const { slug } = await params
	const service = getServiceBySlug(slug)
	if (!service) {
		return {}
	}

	return buildMetadata({
		title: service.metaTitle,
		description: service.metaDescription,
		path: `/services/${service.slug}`
	})
}

export default async function ServicePage({ params }: ServicePageProps) {
	const { slug } = await params
	const service = getServiceBySlug(slug)
	if (!service) {
		notFound()
	}

	const relatedPosts = (await getPostsByTag(service.blogTag)).slice(
		0,
		RELATED_POST_LIMIT
	)
	const otherServices = SERVICES.filter(other => other.slug !== service.slug)

	return (
		<div className="min-h-screen bg-background">
			<JsonLd
				data={toJsonLdGraph([
					generateServiceSchema(service),
					generateLocalBusinessSchema(),
					generateFaqSchema(service.faqs),
					generateBreadcrumbSchema([
						{ name: 'Home', url: SITE_URL },
						{ name: 'Services', url: `${SITE_URL}/services` },
						{
							name: service.title,
							url: `${SITE_URL}/services/${service.slug}`
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
				<div className="relative z-10 container-content pt-28 pb-16 sm:pt-32 sm:pb-20">
					<Breadcrumb className="mb-8">
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
										href="/services"
										className="text-muted-foreground hover:text-foreground transition-colors"
									>
										Services
									</Link>
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage className="text-foreground">
									{service.title}
								</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>

					<div className="text-center">
						<p className="text-eyebrow mb-3">{service.title}</p>
						<h1 className="text-page-title text-foreground text-balance mb-6">
							<Headline text={service.headline} />
						</h1>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto mb-10">
							{service.description}
						</p>
						<div className="flex flex-col sm:flex-row gap-3 justify-center">
							<Button asChild variant="accent" size="xl">
								<Link href="/contact">
									Get My Free Website Plan
									<ArrowRight className="w-4 h-4" aria-hidden="true" />
								</Link>
							</Button>
							<Button asChild variant="outline-strong" size="xl">
								<Link href="#included">See What&apos;s Included</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Overview */}
			<section className="py-section-sm">
				<div className="container-content">
					<h2 className="text-h1 text-foreground mb-comfortable text-balance">
						{service.overviewHeading}
					</h2>
					<div className="space-y-4">
						{service.overview.map(paragraph => (
							<p key={paragraph} className="text-lead text-muted-foreground">
								{paragraph}
							</p>
						))}
					</div>
				</div>
			</section>

			{/* Included */}
			<section id="included" className="py-section-sm bg-muted scroll-mt-24">
				<div className="container-wide">
					<div className="text-center mb-10">
						<p className="text-eyebrow mb-3">What You Get</p>
						<h2 className="text-h1 text-foreground mb-comfortable text-balance">
							What&apos;s Included
						</h2>
					</div>
					<ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{service.included.map(detail => (
							<li
								key={detail.title}
								className="rounded-xl border border-border bg-card p-8"
							>
								<div className="flex items-start gap-3 mb-3">
									<CheckCircle
										className="h-5 w-5 text-accent shrink-0 mt-0.5"
										aria-hidden="true"
									/>
									<h3 className="text-lg font-semibold leading-snug text-foreground">
										{detail.title}
									</h3>
								</div>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{detail.body}
								</p>
							</li>
						))}
					</ul>
				</div>
			</section>

			{/* FAQ */}
			<section className="py-section-sm">
				<div className="container-content">
					<div className="text-center mb-10">
						<p className="text-eyebrow mb-3">Questions</p>
						<h2 className="text-h1 text-foreground mb-comfortable text-balance">
							Common Questions
						</h2>
					</div>
					<div className="divide-y divide-border">
						{service.faqs.map(faq => (
							<div key={faq.question} className="py-6">
								<h3 className="text-h4 text-foreground mb-2">{faq.question}</h3>
								<p className="text-muted-foreground leading-relaxed">
									{faq.answer}
								</p>
							</div>
						))}
					</div>
					<p className="text-sm text-muted-foreground text-center mt-8">
						More answers on the{' '}
						<Link href="/faq" className="link-primary">
							FAQ page
						</Link>
						.
					</p>
				</div>
			</section>

			{/* Related posts */}
			{relatedPosts.length > 0 && (
				<section className="py-section-sm bg-muted">
					<div className="container-wide">
						<div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-comfortable">
							<h2 className="text-h1 text-foreground text-balance">
								From the Blog
							</h2>
							<Link
								href={`/blog/tag/${service.blogTag}`}
								className="text-accent-text hover:underline inline-flex items-center gap-1"
							>
								More posts on this topic
								<ArrowRight className="h-4 w-4" aria-hidden="true" />
							</Link>
						</div>
						<div className="grid gap-sections lg:grid-cols-3">
							{relatedPosts.map(post => (
								<BlogPostCard key={post.id} post={post} />
							))}
						</div>
					</div>
				</section>
			)}

			{/* Other services */}
			<section className="py-section-sm">
				<div className="container-content">
					<h2 className="text-h1 text-foreground mb-comfortable text-center text-balance">
						Other Services
					</h2>
					<div className="grid gap-6 sm:grid-cols-2">
						{otherServices.map(other => (
							<Link
								key={other.slug}
								href={`/services/${other.slug}`}
								className="group rounded-xl border border-border bg-card p-8 hover:border-accent transition-colors"
							>
								<h3 className="text-h4 text-foreground mb-2 group-hover:text-accent-text transition-colors">
									{other.title}
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{other.description}
								</p>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="py-section">
				<div className="container-content">
					<div className="relative overflow-hidden rounded-2xl border border-border bg-card p-10 md:p-16 text-center">
						<div
							className="hero-spotlight absolute inset-0 opacity-60 pointer-events-none"
							aria-hidden="true"
						/>
						<div className="relative z-10">
							<h2 className="text-h1 text-foreground mb-6 max-w-3xl mx-auto text-balance">
								Let&apos;s Talk About Your Site
							</h2>
							<p className="text-lead text-muted-foreground mb-10 max-w-2xl mx-auto">
								Book a free 30-minute website plan call. You get the timeline
								and a real price, then you decide from there.
							</p>
							<Button asChild variant="accent" size="xl">
								<Link href="/contact">
									Get My Free Website Plan
									<ArrowRight className="h-4 w-4" aria-hidden="true" />
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}

const REGION = 'Dallas-Fort Worth'

/**
 * Keeps "Dallas-Fort Worth" on one line from the sm breakpoint up, so the
 * headline never breaks at the hyphen. Phones still wrap it, where the
 * whole name would overflow at page-title size.
 */
function Headline({ text }: { text: string }) {
	const [before, after] = text.split(REGION)
	if (after === undefined) {
		return text
	}
	return (
		<>
			{before}
			<span className="sm:whitespace-nowrap">{REGION}</span>
			{after}
		</>
	)
}
