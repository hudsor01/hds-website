import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BlogPostCard } from '@/components/blog/BlogPostCard'
import { TagList } from '@/components/blog/TagList'
import { BackLink } from '@/components/utilities/BackLink'
import {
	getPostsByTag,
	getTagBySlug,
	getTags,
	getTagsWithCounts
} from '@/lib/blog'
import { brandedTitle, buildMetadata } from '@/lib/seo-config'

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
			title: brandedTitle('Tag Not Found'),
			description: 'The requested tag could not be found.'
		}
	}

	// A tag with no live post is a thin page the sitemap leaves out: keep it
	// out of the index until a post is live. Following links stays on.
	const posts = await getPostsByTag(tag.slug)

	return buildMetadata({
		title: brandedTitle(`${tag.name} Articles`),
		description:
			tag.description ||
			`Browse Hudson Digital Solutions blog articles tagged ${tag.name}, with practical guides and insights on web design and growing your small business online.`,
		path: `/blog/tag/${tag.slug}`,
		noindex: posts.length === 0
	})
}

// Unknown slugs are a hard 404, not a streamed soft 404 (see blog/[slug]).
export const unstable_paramMatching = { slug: 'not-found' }

export async function generateStaticParams() {
	const tags = await getTags()
	return tags.map(tag => ({ slug: tag.slug }))
}

export default async function TagPage({ params }: TagPageProps) {
	const { slug } = await params
	const tag = await getTagBySlug(slug)

	if (!tag) {
		notFound()
	}

	const [posts, allTags] = await Promise.all([
		getPostsByTag(tag.slug),
		getTagsWithCounts()
	])
	const populatedTags = allTags.filter(t => t.count > 0 || t.slug === tag.slug)

	return (
		<div className="min-h-screen bg-background">
			<BackLink href="/blog" label="Back to Blog" />

			{/* Header */}
			<section className="relative bg-background py-section-sm overflow-hidden">
				<div className="relative container-wide px-4 sm:px-6 text-center">
					<p className="text-xs font-semibold uppercase tracking-widest text-accent-text mb-3">
						Tag
					</p>
					<h1 className="text-page-title text-foreground text-balance mb-heading">
						{tag.name}
					</h1>
					{tag.description && (
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							{tag.description}
						</p>
					)}
					{populatedTags.length > 1 && (
						<div className="mt-comfortable flex justify-center">
							<TagList tags={populatedTags} activeSlug={tag.slug} />
						</div>
					)}
				</div>
			</section>

			{/* Posts */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					{posts.length > 0 ? (
						<>
							<h2 className="text-h3 text-foreground mb-comfortable">
								Articles tagged {tag.name}
							</h2>
							<div className="grid gap-sections md:grid-cols-2 lg:grid-cols-3">
								{posts.map(post => (
									<BlogPostCard key={post.id} post={post} />
								))}
							</div>
						</>
					) : (
						<div className="text-center py-section-sm">
							<p className="text-muted-foreground text-lg">
								No posts found with this tag yet. Check back soon!
							</p>
						</div>
					)}
				</div>
			</section>
		</div>
	)
}
