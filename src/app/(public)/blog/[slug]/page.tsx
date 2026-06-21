import { Calendar, Clock, Tag } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { AuthorCard } from '@/components/blog/AuthorCard'
import { BlogPostContent } from '@/components/blog/BlogPostContent'
import { BlogTableOfContents } from '@/components/blog/BlogTableOfContents'
import { ReadingProgress } from '@/components/blog/ReadingProgress'
import { RelatedPosts } from '@/components/blog/RelatedPosts'
import { Button } from '@/components/ui/button'
import { BackLink } from '@/components/utilities/BackLink'
import { JsonLd } from '@/components/utilities/JsonLd'
import { getPostBySlug, getPosts, getPostsByTag } from '@/lib/blog'
import { withHeadingIds } from '@/lib/blog-toc'
import { BUSINESS_INFO } from '@/lib/constants/business'
import { formatDate } from '@/lib/utils'

interface BlogPostPageProps {
	params: Promise<{ slug: string }>
}

/**
 * Canonical slug map for posts that exist as duplicates in the DB.
 * Visiting a key in this map permanently redirects to the value, so
 * search engines converge on a single URL and inbound links keep
 * working from either side (audit #249).
 *
 * Add an entry here whenever a duplicate post is discovered and the
 * canonical one is identified. A future cleanup pass can drop the
 * legacy row from the DB; the redirect is the contract that keeps
 * old links honest in the meantime.
 */
const CANONICAL_SLUG_REDIRECTS: Record<string, string> = {
	'why-your-business-needs-a-custom-crm-integration-to-unlock-true-efficiency':
		'why-your-business-needs-a-custom-crm-integration'
}

const META_DESCRIPTION_MAX = 160

/**
 * Clamp a post excerpt to the 160-char SEO window, trimming on a word
 * boundary and appending an ellipsis. Falls back to the provided
 * template (itself clamped) when the excerpt is missing or blank.
 */
function clampDescription(
	excerpt: string | null | undefined,
	fallback: string
): string {
	const source = excerpt?.trim() || fallback
	if (source.length <= META_DESCRIPTION_MAX) {
		return source
	}

	const truncated = source.slice(0, META_DESCRIPTION_MAX - 3)
	const lastSpace = truncated.lastIndexOf(' ')
	const base = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated
	return `${base.replace(/[\s.,;:]+$/, '')}...`
}

export async function generateMetadata({
	params
}: BlogPostPageProps): Promise<Metadata> {
	const { slug } = await params

	// Short-circuit metadata generation for duplicate slugs — the page
	// component redirects on render, but a crawler-only metadata fetch
	// (or anything that depends on `generateMetadata` without rendering
	// the page) would otherwise see the duplicate post's title and
	// excerpt. Returning the canonical post's metadata keeps the
	// search-engine signal consistent with the redirect target.
	const canonical = CANONICAL_SLUG_REDIRECTS[slug]
	const lookupSlug = canonical ?? slug
	const post = await getPostBySlug(lookupSlug)

	if (!post) {
		return {
			title: 'Post Not Found - Hudson Digital Solutions',
			description: 'The requested blog post could not be found.'
		}
	}

	// Clamp the excerpt to the 160-char SEO window, breaking on a word
	// boundary, and fall back to a templated description when missing.
	const description = clampDescription(
		post.excerpt,
		`${post.title}. Read this article on the Hudson Digital Solutions blog for practical web design and small business insights.`
	)

	return {
		title: `${post.title} - Hudson Digital Solutions`,
		description,
		openGraph: {
			title: post.title,
			description,
			type: 'article',
			publishedTime: post.published_at,
			authors: [post.author?.name ?? 'Unknown'],
			tags: post.tags?.map(tag => tag.name),
			// Only set `images` when a custom feature_image exists. The key must
			// be OMITTED entirely (not set to undefined) when absent: Next treats
			// a present `images` key as "explicitly provided" and then does NOT
			// auto-inject the file-based opengraph-image.tsx branded card, which
			// left every post with no og:image (socials fell back to the page's
			// author headshot).
			...(post.feature_image
				? {
						images: [
							{
								url: post.feature_image,
								width: 1200,
								height: 630,
								alt: post.title
							}
						]
					}
				: {})
		},
		twitter: {
			card: 'summary_large_image',
			title: post.title,
			description,
			...(post.feature_image ? { images: [post.feature_image] } : {})
		},
		alternates: {
			canonical: `https://hudsondigitalsolutions.com/blog/${post.slug}`
		}
	}
}

export async function generateStaticParams() {
	try {
		const { posts } = await getPosts()
		const results = posts.map(post => ({
			slug: post.slug
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

export default async function BlogPostPage({ params }: BlogPostPageProps) {
	const { slug } = await params

	// Permanent redirect for known-duplicate slugs before any DB work.
	// `permanentRedirect()` returns a 308 which preserves request method
	// (the relevant property for any future POST/PUT analytics beacons
	// against the old URL) and signals to crawlers that the canonical
	// URL has changed.
	const canonical = CANONICAL_SLUG_REDIRECTS[slug]
	if (canonical) {
		permanentRedirect(`/blog/${canonical}`)
	}

	const post = await getPostBySlug(slug)

	if (!post) {
		notFound()
	}

	const tags = post.tags || []
	const primaryTag = tags[0]

	let relatedPosts: Awaited<ReturnType<typeof getPostsByTag>> = []
	if (primaryTag) {
		const related = await getPostsByTag(primaryTag.slug)
		relatedPosts = related.filter(p => p.id !== post.id).slice(0, 3)
	}

	const SITE_URL = 'https://hudsondigitalsolutions.com'
	const canonicalUrl = `${SITE_URL}/blog/${post.slug}`

	const absoluteImage = post.feature_image
		? post.feature_image.startsWith('http')
			? post.feature_image
			: `${SITE_URL}${post.feature_image.startsWith('/') ? '' : '/'}${post.feature_image}`
		: `${SITE_URL}/HDS-Logo.webp`

	const blogPostingSchema = {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: post.title,
		description: post.excerpt,
		datePublished: post.published_at,
		dateModified: post.updated_at ?? post.published_at,
		image: {
			'@type': 'ImageObject',
			url: absoluteImage
		},
		author: {
			'@type': 'Person',
			name: post.author?.name ?? 'Unknown'
		},
		publisher: {
			'@type': 'Organization',
			name: BUSINESS_INFO.name,
			logo: {
				'@type': 'ImageObject',
				url: `${SITE_URL}/HDS-Logo.webp`
			}
		},
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': canonicalUrl
		}
	}

	const breadcrumbSchema = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Home',
				item: 'https://hudsondigitalsolutions.com'
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: 'Blog',
				item: 'https://hudsondigitalsolutions.com/blog'
			},
			{
				'@type': 'ListItem',
				position: 3,
				name: post.title
			}
		]
	}

	// Headings drive the table of contents; ids here match those injected by
	// BlogPostContent (same deterministic slugify over the same headings).
	const { toc } = withHeadingIds(post.content ?? '')

	return (
		<div className="min-h-screen bg-background">
			<ReadingProgress />
			<JsonLd data={blogPostingSchema} />
			<JsonLd data={breadcrumbSchema} />

			<BackLink href="/blog" label="Back to Blog" />

			{/* Article Header */}
			<article className="pb-16">
				<header className="relative bg-background py-section-sm overflow-hidden">
					<div className="relative container-wide">
						<div className="mx-auto max-w-5xl">
							<div className="max-w-3xl">
								{/* Tags */}
								{tags.length > 0 && (
									<div className="flex flex-wrap gap-tight mb-content-block">
										{tags.map(tag => (
											<Link
												key={tag.id}
												href={`/blog/tag/${tag.slug}`}
												className="flex flex-center gap-1 text-sm text-accent bg-accent/10 hover:bg-accent/20 px-3 py-1 rounded-full transition-colors"
											>
												<Tag className="w-4 h-4" />
												{tag.name}
											</Link>
										))}
									</div>
								)}

								{/* Title */}
								<h1 className="text-page-title text-foreground leading-tight text-balance mb-content-block">
									{post.title}
								</h1>

								{/* Excerpt */}
								{post.excerpt && (
									<p className="text-xl text-muted-foreground mb-comfortable text-pretty">
										{post.excerpt}
									</p>
								)}

								{/* Meta */}
								<div className="flex flex-wrap gap-comfortable text-muted-foreground">
									<div className="flex flex-center gap-tight">
										<Calendar className="w-5 h-5" />
										<time dateTime={post.published_at}>
											{formatDate(post.published_at, 'long')}
										</time>
									</div>
									<div className="flex flex-center gap-tight">
										<Clock className="w-5 h-5" />
										<span>{post.reading_time} min read</span>
									</div>
									{post.author && (
										<div className="flex flex-center gap-tight">
											{post.author.profile_image && (
												<Image
													src={post.author.profile_image}
													alt={post.author.name}
													width={24}
													height={24}
													className="w-6 h-6 rounded-full object-cover"
													sizes="24px"
												/>
											)}
											<span>By {post.author.name}</span>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</header>

				{/* Feature Image */}
				{post.feature_image && (
					<div className="container-wide py-8">
						<div className="relative aspect-video overflow-hidden">
							<Image
								src={post.feature_image}
								alt={post.title}
								fill
								className="object-cover"
								sizes="(max-width: 1200px) 100vw, 1200px"
								priority
							/>
						</div>
					</div>
				)}

				{/* Article Content + sticky table of contents */}
				<div className="container-wide py-8">
					<div className="mx-auto max-w-5xl lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-12">
						<div className="min-w-0 max-w-3xl">
							<BlogPostContent post={post} />
						</div>
						{toc.length >= 2 && (
							<aside className="hidden lg:block">
								<div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
									<BlogTableOfContents items={toc} />
								</div>
							</aside>
						)}
					</div>
				</div>

				{/* Author Bio */}
				{post.author && (
					<div className="container-wide py-8">
						<div className="mx-auto max-w-5xl">
							<div className="max-w-3xl">
								<AuthorCard author={post.author} />
							</div>
						</div>
					</div>
				)}
			</article>

			{/* Related Posts */}
			{relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} />}

			{/* CTA Section */}
			<section className="py-section px-4 sm:px-6">
				<div className="container-wide">
					<div className="relative overflow-hidden rounded-2xl border border-border bg-surface-raised p-10 md:p-16 text-center">
						<div
							className="hero-spotlight absolute inset-0 opacity-60 pointer-events-none"
							aria-hidden="true"
						/>
						<div className="relative z-10">
							<h2 className="text-section-title text-foreground mb-6 max-w-3xl mx-auto text-balance">
								Ready for the website your business has earned?
							</h2>
							<p className="text-lead text-muted-foreground mb-10 max-w-2xl mx-auto">
								Let&apos;s map out what it needs, and build something that turns
								your reputation into booked customers.
							</p>
							<Button asChild variant="accent" size="xl">
								<Link href="/contact">Get My Free Website Plan</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}
