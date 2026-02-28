import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BlogPostCard } from '@/components/blog/BlogPostCard'
import { TagList } from '@/components/blog/TagList'
import { Button } from '@/components/ui/button'
import { getFeaturedPosts, getPosts, getTags } from '@/lib/blog'

export const metadata: Metadata = {
	title:
		'Blog - Hudson Digital Solutions | Web Development Insights & Business Strategy',
	description:
		"Practical insights on websites, tool integrations, and business automation from Hudson Digital Solutions. Learn how to make technology work harder so you don't have to.",
	keywords:
		'web development blog, business strategy, digital marketing, competitive advantage, web performance, Hudson Digital Solutions',
	openGraph: {
		title: 'Blog - Hudson Digital Solutions',
		description:
			'Practical insights on websites, tool integrations, and business automation',
		url: 'https://hudsondigitalsolutions.com/blog',
		images: [
			{
				url: '/HDS-Logo.jpeg',
				width: 1200,
				height: 630,
				alt: 'Hudson Digital Solutions Blog'
			}
		]
	},
	alternates: {
		canonical: 'https://hudsondigitalsolutions.com/blog'
	}
}

export default async function BlogPage() {
	const [featuredPosts, allPostsResult, tags] = await Promise.all([
		getFeaturedPosts(3),
		getPosts({ limit: 10 }),
		getTags()
	])

	const allPosts = allPostsResult.posts

	return (
		<main className="min-h-screen bg-background">
			{/* Hero Section */}
			<section className="relative overflow-hidden bg-background">
				<div className="container-wide px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20 text-center">
					<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
						Practical Insights
					</p>
					<h1 className="text-page-title text-foreground leading-tight text-balance">
						Business Strategy Blog
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6">
						Practical insights on websites, tool integrations, and business
						automation. Learn how to make technology work harder so you
						don&apos;t have to.
					</p>
				</div>
			</section>

			{/* Featured Posts */}
			{featuredPosts.length > 0 && (
				<section className="py-section-sm px-4 sm:px-6">
					<div className="container-wide">
						<div className="text-center mb-10">
							<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
								Editor&apos;s Picks
							</p>
							<h2 className="text-section-title text-foreground mb-comfortable text-balance">
								Featured Articles
							</h2>
							<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
								Essential reading for ambitious business owners
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{featuredPosts.map(post => (
								<BlogPostCard key={post.id} post={post} featured />
							))}
						</div>
					</div>
				</section>
			)}

			{/* All Posts */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="flex flex-col lg:flex-row gap-10">
						{/* Main Content */}
						<div className="flex-1">
							<div className="mb-10">
								<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
									All Articles
								</p>
								<h2 className="text-section-title text-foreground mb-comfortable text-balance">
									All Articles
								</h2>
								<p className="text-lead text-muted-foreground max-w-2xl">
									Practical guides for business owners who want more from their
									technology
								</p>
							</div>

							{allPosts.length === 0 ? (
								<div className="rounded-xl border border-border bg-surface-raised p-8 text-center">
									<p className="text-sm text-muted-foreground leading-relaxed">
										No articles found. Check back soon for new content!
									</p>
								</div>
							) : (
								<div className="space-y-6">
									{allPosts.map(post => (
										<BlogPostCard key={post.id} post={post} />
									))}
								</div>
							)}
						</div>

						{/* Sidebar */}
						<aside className="w-full lg:w-80 space-y-6">
							{/* Newsletter Signup */}
							<div className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors">
								<h3 className="text-h3 text-foreground mb-3 text-balance">
									Stay Updated
								</h3>
								<p className="text-sm text-muted-foreground mb-6 leading-relaxed">
									Get strategic insights delivered to your inbox.
								</p>
								<Button asChild variant="accent" className="w-full">
									<Link href="/contact">Contact Us to Subscribe</Link>
								</Button>
								<p className="text-xs text-muted-foreground mt-3">
									Strategic insights, no spam.
								</p>
							</div>

							{/* Topics */}
							{tags.length > 0 && <TagList tags={tags} />}

							{/* CTA */}
							<div className="rounded-xl border border-border bg-surface-raised p-8 text-center hover:border-border-strong transition-colors">
								<h3 className="text-h3 text-foreground mb-3 text-balance">
									Ready to grow your business?
								</h3>
								<p className="text-sm text-muted-foreground mb-6 leading-relaxed">
									Let&apos;s build the system that runs it.
								</p>
								<Button asChild variant="accent" trackConversion={true}>
									<Link href="/contact">
										Get Started
										<ArrowRight className="w-4 h-4" />
									</Link>
								</Button>
							</div>
						</aside>
					</div>
				</div>
			</section>
		</main>
	)
}
