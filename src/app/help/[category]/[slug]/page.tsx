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
import {
	getAdjacentArticles,
	getArticleBySlug,
	getCategoryBySlug
} from '@/lib/help-articles'

interface PageProps {
	params: Promise<{ category: string; slug: string }>
}

// Force dynamic rendering since articles come from database
export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
	// Return empty array - pages will be generated on-demand
	return []
}

export async function generateMetadata({
	params
}: PageProps): Promise<Metadata> {
	const { slug } = await params
	const article = await getArticleBySlug(slug)

	if (!article) {
		return {
			title: 'Article Not Found | Help Center'
		}
	}

	return {
		title: `${article.title} | Help Center | Hudson Digital Solutions`,
		description:
			article.excerpt || `Read about ${article.title} in our help center.`
	}
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

	// Format date
	const updatedDate = new Date(article.updated_at).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	})

	return (
		<main className="min-h-screen bg-background">
			{/* Header / Breadcrumb */}
			<div className="border-b border-border bg-background">
				<div className="container-wide px-4 sm:px-6 py-6">
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
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide max-w-4xl mx-auto">
					<div className="rounded-xl border border-border bg-surface-raised p-8 md:p-10">
						{/* Article Header */}
						<header className="mb-comfortable">
							<h1 className="text-page-title text-foreground leading-tight text-balance mb-3">
								{article.title}
							</h1>
							<div className="flex items-center gap-tight text-sm text-muted-foreground">
								<Clock className="size-4" />
								<span>Last updated: {updatedDate}</span>
							</div>
						</header>

						{/* Article Body */}
						<div className="typography">
							<ReactMarkdown
								components={{
									// Custom link component to handle internal links
									a: ({ href, children }) => {
										const isInternal = href?.startsWith('/')
										if (isInternal && href) {
											return (
												<Link
													href={href}
													className="text-accent hover:underline"
												>
													{children}
												</Link>
											)
										}
										return (
											<a
												href={href ?? '#'}
												target="_blank"
												rel="noopener noreferrer"
												className="text-accent hover:underline"
											>
												{children}
											</a>
										)
									},
									// Custom heading styles
									h2: ({ children }) => (
										<h2 className="text-xl md:text-2xl font-semibold text-foreground mt-heading mb-heading pb-2 border-b border-border">
											{children}
										</h2>
									),
									h3: ({ children }) => (
										<h3 className="text-lg md:text-xl font-semibold text-foreground mt-content-block mb-3">
											{children}
										</h3>
									),
									// Custom list styles
									ul: ({ children }) => (
										<ul className="list-disc pl-6 space-y-tight my-4">
											{children}
										</ul>
									),
									ol: ({ children }) => (
										<ol className="list-decimal pl-6 space-y-tight my-4">
											{children}
										</ol>
									),
									// Paragraph styles
									p: ({ children }) => (
										<p className="text-foreground/90 leading-relaxed mb-heading">
											{children}
										</p>
									),
									// Code styles
									code: ({ children }) => (
										<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
											{children}
										</code>
									),
									// Strong/Bold styles
									strong: ({ children }) => (
										<strong className="font-semibold text-foreground">
											{children}
										</strong>
									),
									// Table styles
									table: ({ children }) => (
										<div className="overflow-x-auto my-6">
											<table className="w-full border-collapse border border-border">
												{children}
											</table>
										</div>
									),
									th: ({ children }) => (
										<th className="border border-border bg-muted px-4 py-2 text-left font-semibold">
											{children}
										</th>
									),
									td: ({ children }) => (
										<td className="border border-border px-4 py-2">
											{children}
										</td>
									)
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
									<div className="h-full rounded-xl border border-border bg-surface-raised p-5 hover:border-border-strong transition-colors">
										<div className="flex items-center gap-tight text-sm text-muted-foreground mb-1">
											<ChevronLeft className="size-4" />
											Previous
										</div>
										<p className="font-medium text-foreground group-hover:text-accent transition-colors">
											{prev.title}
										</p>
									</div>
								</Link>
							) : (
								<div />
							)}
							{next && (
								<Link href={`/help/${category}/${next.slug}`} className="group">
									<div className="h-full rounded-xl border border-border bg-surface-raised p-5 hover:border-border-strong transition-colors text-right">
										<div className="flex items-center justify-end gap-tight text-sm text-muted-foreground mb-1">
											Next
											<ChevronRight className="size-4" />
										</div>
										<p className="font-medium text-foreground group-hover:text-accent transition-colors">
											{next.title}
										</p>
									</div>
								</Link>
							)}
						</div>
					)}

					{/* Help CTA */}
					<div className="mt-6 rounded-xl border border-border bg-surface-raised p-8 text-center hover:border-border-strong transition-colors">
						<p className="text-sm text-muted-foreground mb-4">
							Was this article helpful? Need more assistance?
						</p>
						<Button asChild variant="accent" trackConversion={true}>
							<Link href="/contact">
								Contact Support
								<ArrowRight className="size-4" />
							</Link>
						</Button>
					</div>
				</div>
			</section>
		</main>
	)
}
