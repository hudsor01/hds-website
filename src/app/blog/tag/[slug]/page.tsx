import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BlogPostCard } from '@/components/blog/BlogPostCard'
import { getPostsByTag, getTagBySlug, getTags } from '@/lib/blog'

interface TagPageProps {
	params: Promise<{ slug: string }>
}

export async function generateMetadata({
	params
}: TagPageProps): Promise<Metadata> {
	const { slug } = await params
	const tag = await getTagBySlug(slug)

	if (!tag) {
		return {
			title: 'Tag Not Found - Hudson Digital Solutions',
			description: 'The requested tag could not be found.'
		}
	}

	return {
		title: `${tag.name} - Blog - Hudson Digital Solutions`,
		description: tag.description || `Articles tagged with ${tag.name}`,
		alternates: {
			canonical: `https://hudsondigitalsolutions.com/blog/tag/${tag.slug}`
		}
	}
}

export async function generateStaticParams() {
	try {
		const tags = await getTags()
		const results = tags.map(tag => ({
			slug: tag.slug
		}))

		if (results.length === 0) {
			return [{ slug: '__placeholder__' }]
		}

		return results
	} catch {
		// Tables may not exist yet during initial deployment
		return [{ slug: '__placeholder__' }]
	}
}

export default async function TagPage({ params }: TagPageProps) {
	const { slug } = await params
	const tag = await getTagBySlug(slug)

	if (!tag) {
		notFound()
	}

	const posts = await getPostsByTag(tag.slug)

	return (
		<main className="min-h-screen bg-background">
			{/* Back to Blog */}
			<div className="container-wide px-4 sm:px-6 py-8">
				<Link
					href="/blog"
					className="inline-flex items-center gap-tight text-accent hover:text-accent/80 transition-colors"
				>
					<ArrowLeft className="w-5 h-5" />
					Back to Blog
				</Link>
			</div>

			{/* Header */}
			<section className="relative bg-background py-section-sm overflow-hidden">
				<div className="relative container-wide px-4 sm:px-6 text-center">
					<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
						Tag
					</p>
					<h1 className="text-page-title text-foreground leading-tight text-balance mb-heading">
						{tag.name}
					</h1>
					{tag.description && (
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							{tag.description}
						</p>
					)}
				</div>
			</section>

			{/* Posts */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					{posts.length > 0 ? (
						<div className="grid gap-sections md:grid-cols-2 lg:grid-cols-3">
							{posts.map(post => (
								<BlogPostCard key={post.id} post={post} />
							))}
						</div>
					) : (
						<div className="text-center py-section-sm">
							<p className="text-muted-foreground text-lg">
								No posts found with this tag yet. Check back soon!
							</p>
						</div>
					)}
				</div>
			</section>
		</main>
	)
}
