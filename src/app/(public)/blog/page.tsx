import type { Metadata } from 'next'
import { Suspense } from 'react'
import { BlogArchive } from '@/components/blog/BlogArchive'
import { BlogPostCard } from '@/components/blog/BlogPostCard'
import { BlogPostCardSkeleton } from '@/components/blog/BlogPostCardSkeleton'
import { BlogSidebar } from '@/components/blog/BlogSidebar'
import { getFeaturedPosts } from '@/lib/blog'
import { buildMetadata } from '@/lib/seo-config'

export const metadata: Metadata = buildMetadata({
	title: 'Small Business Web Design Blog | Hudson Digital',
	description:
		'Practical insights on websites, getting found on Google and growing a small business online, from Hudson Digital Solutions.',
	path: '/blog'
})

// Each data-driven section is its own async server component behind its own
// Suspense boundary. Blog data is compiled in at build time, so all of them
// resolve during prerender and the whole page ships as static HTML.

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
						Practical insights on websites, getting found on Google and growing
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
								<BlogArchive page={1} />
							</Suspense>
						</div>

						<BlogSidebar />
					</div>
				</div>
			</section>
		</div>
	)
}
