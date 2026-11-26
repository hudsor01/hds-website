/**
 * Help Center Home Page
 * Browse help categories and search for articles
 */

import {
	ArrowRight,
	CreditCard,
	HelpCircle,
	Rocket,
	User,
	Wrench
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
	getAllPublishedArticles,
	getCategoriesWithCounts,
	getCategoryBySlug,
	helpArticleDate
} from '@/lib/help-articles'
import { buildMetadata } from '@/lib/seo-config'

export async function generateMetadata(): Promise<Metadata> {
	// With no listed article the hub is a list of empty categories: keep it
	// out of the index until a known category has an article the sitemap can
	// date (the sitemap's listing rule).
	const articles = await getAllPublishedArticles()
	const hasArticles = articles.some(
		article =>
			getCategoryBySlug(article.category) !== undefined &&
			helpArticleDate(article) !== null
	)

	return buildMetadata({
		title: 'Help Center | Hudson Digital',
		description:
			'Browse the Hudson Digital Solutions help center for answers to common questions, step-by-step guides for the free tools, billing details and account support.',
		path: '/help',
		noindex: !hasArticles
	})
}

const ICON_MAP: Record<string, React.ReactNode> = {
	Rocket: <Rocket className="size-6" />,
	Wrench: <Wrench className="size-6" />,
	CreditCard: <CreditCard className="size-6" />,
	User: <User className="size-6" />,
	HelpCircle: <HelpCircle className="size-6" />
}

export default async function HelpCenterPage() {
	const categories = await getCategoriesWithCounts()

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
						Help Center
					</p>
					<h1 className="text-page-title text-foreground text-balance">
						How can I help?
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6 mb-8">
						Find answers to common questions, learn how to use the tools and get
						the support you need.
					</p>
				</div>
			</section>

			{/* Categories Grid */}
			<section className="py-section-sm">
				<div className="container-wide">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent-text mb-3">
							Browse Topics
						</p>
						<h2 className="text-h1 text-foreground mb-comfortable text-balance">
							Browse by Category
						</h2>
					</div>

					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{categories.map(category => (
							<Link
								key={category.slug}
								href={`/help/${category.slug}`}
								className="group"
							>
								<div className="h-full rounded-xl border border-border bg-card p-8 hover:border-border-strong transition-colors">
									<div className="flex items-start gap-4">
										<div
											aria-hidden="true"
											className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0"
										>
											{ICON_MAP[category.icon] || (
												<HelpCircle className="size-6" />
											)}
										</div>
										<div className="flex-1">
											<h3 className="font-semibold text-foreground group-hover:text-accent-text transition-colors flex items-center gap-2">
												{category.name}
												<ArrowRight className="size-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
											</h3>
											<p className="text-sm text-muted-foreground mt-1 leading-relaxed">
												{category.description}
											</p>
											<p className="text-xs text-muted-foreground mt-2">
												{category.articleCount}{' '}
												{category.articleCount === 1 ? 'article' : 'articles'}
											</p>
										</div>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* Contact Section */}
			<section className="py-section-sm">
				<div className="container-content">
					<div className="rounded-xl border border-border bg-card p-10 text-center hover:border-border-strong transition-colors">
						<h2 className="text-h3 text-foreground mb-3 text-balance">
							Can&apos;t find what you&apos;re looking for?
						</h2>
						<p className="text-sm text-muted-foreground mb-8 leading-relaxed">
							I&apos;m here to help. Reach out and I&apos;ll get back to you
							within 2 hours during business hours.
						</p>
						<Button asChild variant="accent" size="lg">
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
