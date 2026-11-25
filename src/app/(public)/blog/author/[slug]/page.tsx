import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { BlogPostCard } from '@/components/blog/BlogPostCard'
import { BackLink } from '@/components/utilities/BackLink'
import { getAuthorBySlug, getAuthors, getPostsByAuthor } from '@/lib/blog'
import { authorMetaDescription, brandedTitle } from '@/lib/blog-metadata'
import { buildMetadata } from '@/lib/seo-config'

interface AuthorPageProps {
	params: Promise<{ slug: string }>
}

export async function generateMetadata({
	params
}: AuthorPageProps): Promise<Metadata> {
	const { slug } = await params
	const author = await getAuthorBySlug(slug)

	if (!author) {
		return {
			title: brandedTitle('Author Not Found'),
			description: 'The requested author could not be found.'
		}
	}

	// An author with no live post is a thin page the sitemap leaves out:
	// keep it out of the index until a post is live. Following links stays on.
	const posts = await getPostsByAuthor(author.slug)

	return buildMetadata({
		title: brandedTitle(`Articles by ${author.name}`),
		description: authorMetaDescription(author),
		path: `/blog/author/${author.slug}`,
		noindex: posts.length === 0
	})
}

// Unknown slugs are a hard 404, not a streamed soft 404 (see blog/[slug]).
export const unstable_paramMatching = { slug: 'not-found' }

export async function generateStaticParams() {
	const authors = await getAuthors()
	return authors.map(author => ({ slug: author.slug }))
}

export default async function AuthorPage({ params }: AuthorPageProps) {
	const { slug } = await params
	const author = await getAuthorBySlug(slug)

	if (!author) {
		notFound()
	}

	const posts = await getPostsByAuthor(author.slug)

	return (
		<div className="min-h-screen bg-background">
			<BackLink href="/blog" label="Back to Blog" />

			{/* Header */}
			<section className="relative bg-background py-section-sm overflow-hidden">
				<div className="relative container-wide px-4 sm:px-6">
					<div className="flex flex-col md:flex-row items-center gap-sections">
						{author.profile_image && (
							<Image
								src={author.profile_image}
								alt={author.name}
								width={160}
								height={160}
								className="w-40 h-40 rounded-full object-cover"
								priority
							/>
						)}
						<div className="text-center md:text-left">
							<h1 className="text-page-title text-foreground leading-tight text-balance mb-heading">
								{author.name}
							</h1>
							{author.bio && (
								<p className="text-xl text-muted-foreground max-w-2xl">
									{author.bio}
								</p>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Posts */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<h2 className="text-h3 text-foreground mb-comfortable">
						Articles by {author.name}
					</h2>
					{posts.length > 0 ? (
						<div className="grid gap-sections md:grid-cols-2 lg:grid-cols-3">
							{posts.map(post => (
								<BlogPostCard key={post.id} post={post} />
							))}
						</div>
					) : (
						<div className="text-center py-section-sm">
							<p className="text-muted-foreground text-lg">
								No posts by this author yet. Check back soon!
							</p>
						</div>
					)}
				</div>
			</section>
		</div>
	)
}
