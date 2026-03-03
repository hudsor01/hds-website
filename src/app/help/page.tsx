/**
 * Help Center Home Page
 * Browse help categories and search for articles
 */

import {
	ArrowRight,
	CreditCard,
	HelpCircle,
	Rocket,
	Search,
	User,
	Wrench
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { getCategoriesWithCounts } from '@/lib/help-articles'

export const metadata: Metadata = {
	title: 'Help Center | Hudson Digital Solutions',
	description:
		'Find answers to common questions, learn how to use our tools, and get support from Hudson Digital Solutions.'
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
		<main className="min-h-screen bg-background">
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
						Help Center
					</p>
					<h1 className="text-page-title text-foreground leading-tight text-balance">
						How can we help you?
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6 mb-8">
						Find answers to common questions, learn how to use our tools, and
						get the support you need.
					</p>

					{/* Search Bar */}
					<div className="max-w-xl mx-auto relative">
						<Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
						<Input
							type="search"
							placeholder="Search for articles..."
							className="w-full pl-12 pr-4 py-6 bg-surface-raised"
						/>
					</div>
				</div>
			</section>

			{/* Categories Grid */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide max-w-5xl mx-auto">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							Browse Topics
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
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
								<div className="h-full rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors">
									<div className="flex items-start gap-4">
										<div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
											{ICON_MAP[category.icon] || (
												<HelpCircle className="size-6" />
											)}
										</div>
										<div className="flex-1">
											<h3 className="font-semibold text-foreground group-hover:text-accent transition-colors flex items-center gap-2">
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
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide max-w-5xl mx-auto">
					<div className="rounded-xl border border-border bg-surface-raised p-10 text-center hover:border-border-strong transition-colors">
						<h2 className="text-h3 text-foreground mb-3 text-balance">
							Can&apos;t find what you&apos;re looking for?
						</h2>
						<p className="text-sm text-muted-foreground mb-8 leading-relaxed">
							Our team is here to help. Reach out and we&apos;ll get back to you
							within 24 hours.
						</p>
						<Link
							href="/contact"
							className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-accent-foreground font-semibold hover:bg-accent/90 transition-colors"
						>
							Contact Support
							<ArrowRight className="size-4" />
						</Link>
					</div>
				</div>
			</section>
		</main>
	)
}
