/**
 * Help Article Page
 * Displays a single help article with markdown content
 */

import { ArrowRight, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
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
import {
	getAdjacentArticles,
	getArticleBySlug,
	getCategoryBySlug,
	helpArticleDate
} from '@/lib/help-articles'
import { buildMetadata, qualifiedTitle } from '@/lib/seo-config'
import {
	BUSINESS_ID,
	generateBreadcrumbSchema,
	toJsonLdGraph
} from '@/lib/seo-utils'

const SITE_URL = 'https://hudsondigitalsolutions.com'

interface PageProps {
	params: Promise<{ category: string; slug: string }>
}

export async function generateStaticParams() {
	// Cache Components requires at least one entry; help articles are
	// content-managed so use a placeholder. Pages render on-demand from
	// the cached help-articles data layer.
	return [{ category: '__placeholder__', slug: '__placeholder__' }]
}

export async function generateMetadata({
	params
}: PageProps): Promise<Metadata> {
	const { category, slug } = await params
	const article = await getArticleBySlug(slug)

	if (!article) {
		return {
			title: 'Article Not Found | Help Center'
		}
	}

	return buildMetadata({
		title: qualifiedTitle(article.title, 'Help Center'),
		description:
			article.excerpt || `Read about ${article.title} in the help center.`,
		path: `/help/${category}/${slug}`,
		// The sitemap cannot date (so does not list) an undated article.
		noindex: !helpArticleDate(article)
	})
}

export default async function HelpArticlePage({ params }: PageProps) {
	const { category, slug } = await params

	const [article, categoryInfo] = await Promise.all([
		getArticleBySlug(slug),
		Promise.resolve(getCategoryBySlug(category))
	])

	if (!article || !categoryInfo || article.category !== category) {
		notFound()
	}

	const { prev, next } = await getAdjacentArticles(slug, category)

	// Format date. A row without one shows no "Last updated" line.
	const updatedDate = article.updated_at
		? new Date(article.updated_at).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			})
		: null

	const articleUrl = `${SITE_URL}/help/${category}/${slug}`

	return (
		<div className="min-h-screen bg-background">
			<JsonLd
				data={toJsonLdGraph([
					{
						'@type': 'TechArticle',
						headline: article.title,
						description: article.excerpt ?? undefined,
						datePublished: article.created_at ?? undefined,
						dateModified: article.updated_at ?? undefined,
						url: articleUrl,
						mainEntityOfPage: articleUrl,
						author: { '@id': BUSINESS_ID },
						publisher: { '@id': BUSINESS_ID }
					},
					generateBreadcrumbSchema([
						{ name: 'Help Center', url: `${SITE_URL}/help` },
						{ name: categoryInfo.name, url: `${SITE_URL}/help/${category}` },
						{ name: article.title, url: articleUrl }
					])
				])}
			/>

			{/* Header / Breadcrumb */}
			<div className="border-b border-border bg-background">
				<div className="container-wide py-6">
					{/* Breadcrumb */}
					<Breadcrumb className="mb-4">
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<Link
										href="/help"
										className="hover:text-foreground transition-colors"
									>
										Help Center
									</Link>
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<Link
										href={`/help/${category}`}
										className="hover:text-foreground transition-colors"
									>
										{categoryInfo.name}
									</Link>
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>{article.title}</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>

					<Link
						href={`/help/${category}`}
						className="inline-flex items-center gap-tight text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<ChevronLeft className="size-4" />
						Back to {categoryInfo.name}
					</Link>
				</div>
			</div>

			{/* Article Content */}
			<section className="py-section-sm">
				<div className="container-content">
					<div className="rounded-xl border border-border bg-card p-8 md:p-10">
						{/* Article Header */}
						<header className="mb-comfortable">
							<h1 className="text-page-title text-foreground text-balance mb-3">
								{article.title}
							</h1>
							{updatedDate && (
								<div className="flex items-center gap-tight text-sm text-muted-foreground">
									<Clock className="size-4" />
									<span>Last updated: {updatedDate}</span>
								</div>
							)}
						</header>

						{/* Article Body */}
						<div className="typography">
							<ReactMarkdown
								components={{
									// .typography owns article prose: links, lists, code and
									// tables. These overrides are behaviour only: internal links
									// route through next/link, external ones open a new tab,
									// wide tables scroll, header cells are column headers.
									a: ({ href, children }) => {
										if (href?.startsWith('/')) {
											return <Link href={href}>{children}</Link>
										}
										return (
											<a
												href={href ?? '#'}
												target="_blank"
												rel="noopener noreferrer"
											>
												{children}
											</a>
										)
									},
									table: ({ children }) => (
										<div className="overflow-x-auto">
											<table>{children}</table>
										</div>
									),
									th: ({ children }) => <th scope="col">{children}</th>
								}}
							>
								{article.content}
							</ReactMarkdown>
						</div>
					</div>

					{/* Navigation */}
					{(prev || next) && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
							{prev ? (
								<Link href={`/help/${category}/${prev.slug}`} className="group">
									<div className="h-full rounded-xl border border-border bg-card p-5 hover:border-border-strong transition-colors">
										<div className="flex items-center gap-tight text-sm text-muted-foreground mb-1">
											<ChevronLeft className="size-4" />
											Previous
										</div>
										<p className="font-medium text-foreground group-hover:text-accent-text transition-colors">
											{prev.title}
										</p>
									</div>
								</Link>
							) : (
								<div />
							)}
							{next && (
								<Link href={`/help/${category}/${next.slug}`} className="group">
									<div className="h-full rounded-xl border border-border bg-card p-5 hover:border-border-strong transition-colors text-right">
										<div className="flex items-center justify-end gap-tight text-sm text-muted-foreground mb-1">
											Next
											<ChevronRight className="size-4" />
										</div>
										<p className="font-medium text-foreground group-hover:text-accent-text transition-colors">
											{next.title}
										</p>
									</div>
								</Link>
							)}
						</div>
					)}

					{/* Help CTA */}
					<div className="mt-6 rounded-xl border border-border bg-card p-8 text-center hover:border-border-strong transition-colors">
						<p className="text-sm text-muted-foreground mb-4">
							Was this article helpful? Need more assistance?
						</p>
						<Button asChild variant="accent">
							<Link href="/contact">
								Contact Support
								<ArrowRight className="size-4" />
							</Link>
						</Button>
					</div>
				</div>
			</section>
		</div>
	)
}
