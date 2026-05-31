import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { BlogPostCard } from '@/components/blog/BlogPostCard'
import { BlogPostCardSkeleton } from '@/components/blog/BlogPostCardSkeleton'
import { TagList } from '@/components/blog/TagList'
import { Button } from '@/components/ui/button'
import { getFeaturedPosts, getPosts, getTagsWithCounts } from '@/lib/blog'

export const metadata: Metadata = {
	title: 'Small Business Web Design Blog | Hudson Digital',
	description:
		'Practical insights on websites, getting found on Google, and growing a small business online, from Hudson Digital Solutions.',
	openGraph: {
		title: 'Small Business Web Design Blog | Hudson Digital',
		description:
			'Practical insights on websites, getting found on Google, and growing a small business online, from the team at Hudson Digital Solutions.',
		url: 'https://hudsondigitalsolutions.com/blog',
		images: [
			{
				url: '/HDS-Logo.webp',
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

// Each data-driven section is its own async server component so Suspense
// can stream the page header while the DB calls resolve. Required by
// cacheComponents:true — every dynamic data access must sit inside a
// Suspense boundary or the whole page will block on it.

async function FeaturedSection() {
	const featuredPosts = await getFeaturedPosts(3)
	if (featuredPosts.length === 0) {
		return null
	}
	return (
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
					{featuredPosts.map((post, i) => (
						<BlogPostCard key={post.id} post={post} featured priority={i < 2} />
					))}
				</div>
			</div>
		</section>
	)
}

async function AllPostsSection() {
	const allPostsResult = await getPosts({ limit: 10 })
	const allPosts = allPostsResult.posts
	return (
		<>
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
		</>
	)
}

async function TagsSection() {
	const tags = await getTagsWithCounts()
	const populated = tags.filter(tag => tag.count > 0)
	if (populated.length === 0) {
		return null
	}
	return <TagList tags={populated} />
}

function PostListSkeleton() {
	return (
		<div className="space-y-6" aria-hidden="true">
			{[0, 1, 2].map(i => (
				<BlogPostCardSkeleton key={i} />
			))}
		</div>
	)
}

function FeaturedSkeleton() {
	return (
		<section className="py-section-sm px-4 sm:px-6">
			<div className="container-wide">
				<div
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
					aria-hidden="true"
				>
					{[0, 1, 2].map(i => (
						<BlogPostCardSkeleton key={i} />
					))}
				</div>
			</div>
		</section>
	)
}

export default function BlogPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section — static shell streams immediately. */}
			<section className="relative overflow-hidden bg-background">
				<div className="container-wide px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20 text-center">
					<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
						Practical Insights
					</p>
					<h1 className="text-page-title text-foreground leading-tight text-balance">
						Website Tips for Small Businesses
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6">
						Practical insights on websites, getting found on Google, and growing
						a small business online.
					</p>
				</div>
			</section>

			{/* Featured Posts — independently suspended. */}
			<Suspense fallback={<FeaturedSkeleton />}>
				<FeaturedSection />
			</Suspense>

			{/* All Posts + Sidebar */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="flex flex-col lg:flex-row gap-10">
						{/* Main Content */}
						<div className="flex-1">
							<Suspense fallback={<PostListSkeleton />}>
								<AllPostsSection />
							</Suspense>
						</div>

						{/* Sidebar */}
						<aside className="w-full lg:w-80 space-y-6">
							<div className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors">
								<h3 className="text-h3 text-foreground mb-3 text-balance">
									Curious what a site would cost?
								</h3>
								<p className="text-sm text-muted-foreground mb-6 leading-relaxed">
									Get a free website plan for your business: pages, timeline,
									and a clear price.
								</p>
								<Button asChild variant="accent" className="w-full">
									<Link href="/contact">Get My Free Website Plan</Link>
								</Button>
								<p className="text-xs text-muted-foreground mt-3">
									30-minute call. No commitment.
								</p>
							</div>

							<Suspense fallback={null}>
								<TagsSection />
							</Suspense>

							<div className="rounded-xl border border-border bg-surface-raised p-8 text-center hover:border-border-strong transition-colors">
								<h3 className="text-h3 text-foreground mb-3 text-balance">
									Ready for a better website?
								</h3>
								<p className="text-sm text-muted-foreground mb-6 leading-relaxed">
									Let&apos;s build the one your business deserves.
								</p>
								<Button asChild variant="accent" trackConversion={true}>
									<Link href="/contact">
										Get My Free Website Plan
										<ArrowRight className="w-4 h-4" />
									</Link>
								</Button>
							</div>
						</aside>
					</div>
				</div>
			</section>
		</div>
	)
}
