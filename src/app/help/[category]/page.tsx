/**
 * Help Category Page
 * Lists all articles in a specific category
 */

import {
	ArrowRight,
	ChevronLeft,
	CreditCard,
	FileText,
	HelpCircle,
	Rocket,
	User,
	Wrench
} from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import {
	getAllCategorySlugs,
	getArticlesByCategory,
	getCategoryBySlug
} from '@/lib/help-articles'

interface PageProps {
	params: Promise<{ category: string }>
}

const ICON_MAP: Record<string, React.ReactNode> = {
	Rocket: <Rocket className="size-8" />,
	Wrench: <Wrench className="size-8" />,
	CreditCard: <CreditCard className="size-8" />,
	User: <User className="size-8" />,
	HelpCircle: <HelpCircle className="size-8" />
}

export async function generateStaticParams() {
	const slugs = getAllCategorySlugs()
	const results = slugs.map(category => ({ category }))

	// Cache Components requires at least one entry
	if (results.length === 0) {
		return [{ category: '__placeholder__' }]
	}

	return results
}

export async function generateMetadata({
	params
}: PageProps): Promise<Metadata> {
	const { category } = await params
	const categoryInfo = getCategoryBySlug(category)

	if (!categoryInfo) {
		return {
			title: 'Category Not Found | Help Center'
		}
	}

	return {
		title: `${categoryInfo.name} | Help Center | Hudson Digital Solutions`,
		description: categoryInfo.description
	}
}

export default async function HelpCategoryPage({ params }: PageProps) {
	const { category } = await params
	const categoryInfo = getCategoryBySlug(category)

	if (!categoryInfo) {
		notFound()
	}

	const articles = await getArticlesByCategory(category)

	return (
		<main className="min-h-screen bg-background">
			{/* Hero */}
			<section className="relative overflow-hidden bg-background">
				<div className="container-wide px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20">
					{/* Breadcrumb */}
					<Breadcrumb className="mb-8">
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<Link
										href="/help"
										className="text-muted-foreground hover:text-foreground transition-colors"
									>
										Help Center
									</Link>
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage className="text-foreground">
									{categoryInfo.name}
								</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>

					<div className="flex items-center gap-6">
						<div className="size-16 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
							{ICON_MAP[categoryInfo.icon] || <HelpCircle className="size-8" />}
						</div>
						<div>
							<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
								Help Center
							</p>
							<h1 className="text-page-title text-foreground leading-tight text-balance">
								{categoryInfo.name}
							</h1>
							<p className="text-lead text-muted-foreground mt-2">
								{categoryInfo.description}
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Articles List */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide max-w-4xl mx-auto">
					<Link
						href="/help"
						className="inline-flex items-center gap-tight text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
					>
						<ChevronLeft className="size-4" />
						Back to Help Center
					</Link>

					{articles.length === 0 ? (
						<div className="rounded-xl border border-border bg-surface-raised p-10 text-center">
							<HelpCircle className="size-12 mx-auto text-muted-foreground mb-heading" />
							<h2 className="text-h4 text-foreground mb-subheading">
								No articles yet
							</h2>
							<p className="text-sm text-muted-foreground">
								We&apos;re working on adding content to this category. Check
								back soon!
							</p>
						</div>
					) : (
						<div className="space-y-3">
							{articles.map(article => (
								<Link
									key={article.slug}
									href={`/help/${category}/${article.slug}`}
									className="block group"
								>
									<div className="rounded-xl border border-border bg-surface-raised p-6 hover:border-border-strong transition-colors">
										<div className="flex items-start gap-4">
											<div className="size-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
												<FileText className="size-5" />
											</div>
											<div className="flex-1 min-w-0">
												<h2 className="font-semibold text-foreground group-hover:text-accent transition-colors flex items-center gap-tight">
													{article.title}
													<ArrowRight className="size-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
												</h2>
												{article.excerpt && (
													<p className="text-sm text-muted-foreground mt-1 line-clamp-2">
														{article.excerpt}
													</p>
												)}
											</div>
										</div>
									</div>
								</Link>
							))}
						</div>
					)}

					{/* Contact CTA */}
					<div className="mt-10 rounded-xl border border-border bg-surface-raised p-8 text-center hover:border-border-strong transition-colors">
						<p className="text-sm text-muted-foreground mb-4">
							Need more help with {categoryInfo.name.toLowerCase()}?
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
