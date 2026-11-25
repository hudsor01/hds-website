import { ArrowRight, Calendar, Clock, Tag } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AuthorCard } from '@/components/blog/AuthorCard'
import { BlogPostContent } from '@/components/blog/BlogPostContent'
import { BlogTableOfContents } from '@/components/blog/BlogTableOfContents'
import { ReadingProgress } from '@/components/blog/ReadingProgress'
import { RelatedPosts } from '@/components/blog/RelatedPosts'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { JsonLd } from '@/components/utilities/JsonLd'
import { getAllPosts, getPostBySlug, getPostsByTag } from '@/lib/blog'
import { prepareBlogContent } from '@/lib/blog-toc'
import { BUSINESS_INFO } from '@/lib/constants/business'
import { getServiceForTags } from '@/lib/constants/services'
import { brandedTitle, buildMetadata } from '@/lib/seo-config'
import {
	BUSINESS_ID,
	generateAuthorSchema,
	generateBreadcrumbSchema
} from '@/lib/seo-utils'
import { formatCalendarDate } from '@/lib/utils'

interface BlogPostPageProps {
	params: Promise<{ slug: string }>
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
	const post = await getPostBySlug(slug)

	if (!post) {
		return {
			title: brandedTitle('Post Not Found'),
			description: 'The requested blog post could not be found.'
		}
	}

	// Clamp the excerpt to the 160-char SEO window, breaking on a word
	// boundary, and fall back to a templated description when missing.
	const description = clampDescription(
		post.excerpt,
		`${post.title}. Read this article on the Hudson Digital Solutions blog for practical web design and small business insights.`
	)

	// A post's own feature_image wins; otherwise this route's
	// opengraph-image.tsx renders a card with the post title.
	return buildMetadata({
		// Frontmatter titles are never rewritten; the brand rides along only
		// when the full title stays within 60 characters.
		title: brandedTitle(post.title),
		description,
		path: `/blog/${post.slug}`,
		socialTitle: post.title,
		images: post.feature_image ? [post.feature_image] : undefined,
		segmentImage: true,
		article: {
			publishedTime: post.published_at,
			modifiedTime: post.updated_at ?? post.published_at,
			authors: [post.author?.name ?? 'Unknown'],
			tags: post.tags?.map(tag => tag.name)
		}
	})
}

// Every published post is prerendered at build. "not-found" matching is the
// Cache Components replacement for `dynamicParams = false` (which it rejects):
// any other slug, e.g. a scanner probing /blog/wp-login.php, is a hard 404
// with no render. Without it the loading.tsx shell streams first and an
// unknown slug answers HTTP 200.
export const unstable_paramMatching = { slug: 'not-found' }

export async function generateStaticParams() {
	const posts = await getAllPosts()
	return posts.map(post => ({ slug: post.slug }))
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
	const { slug } = await params
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
		author: post.author
			? generateAuthorSchema(post.author)
			: { '@type': 'Person', name: 'Unknown' },
		publisher: {
			'@type': 'Organization',
			'@id': BUSINESS_ID,
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

	const breadcrumbSchema = generateBreadcrumbSchema([
		{ name: 'Home', url: SITE_URL },
		{ name: 'Blog', url: `${SITE_URL}/blog` },
		{ name: post.title, url: canonicalUrl }
	])

	// Every post funnels to the service it is about, so the blog passes
	// readers (and link equity) to the pages that sell.
	const relatedService = getServiceForTags(tags.map(tag => tag.slug))

	// One pass sanitizes the body and injects heading ids; the table of
	// contents comes from that same pass, so every TOC link resolves.
	const { html: contentHtml, toc } = prepareBlogContent(post.content ?? '')

	return (
		<div className="min-h-screen bg-background">
			<ReadingProgress />
			<JsonLd data={blogPostingSchema} />
			<JsonLd data={breadcrumbSchema} />

			<div className="container-wide py-8">
				<Breadcrumb className="mx-auto max-w-5xl">
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link
									href="/"
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									Home
								</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link
									href="/blog"
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									Blog
								</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem className="min-w-0">
							<BreadcrumbPage className="text-foreground line-clamp-1">
								{post.title}
							</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</div>

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
												className="flex flex-center gap-1 text-sm text-accent-text bg-accent/10 hover:bg-accent/20 px-3 py-1 rounded-full transition-colors"
											>
												<Tag className="w-4 h-4" />
												{tag.name}
											</Link>
										))}
									</div>
								)}

								{/* Title */}
								<h1 className="text-page-title text-foreground text-balance mb-content-block">
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
											{formatCalendarDate(post.published_at, 'long')}
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
							<BlogPostContent html={contentHtml} />
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

				{/* Related service */}
				<div className="container-wide py-8">
					<div className="mx-auto max-w-5xl">
						<aside className="max-w-3xl rounded-xl border border-border bg-surface-raised p-8">
							<p className="text-xs font-semibold uppercase tracking-widest text-accent-text mb-2">
								Related Service
							</p>
							<h2 className="text-h4 text-foreground mb-2">
								{relatedService.title}
							</h2>
							<p className="text-muted-foreground leading-relaxed mb-4">
								{relatedService.description}
							</p>
							<Link
								href={`/services/${relatedService.slug}`}
								className="inline-flex items-center gap-1 text-accent-text hover:underline"
							>
								See how it works
								<ArrowRight className="h-4 w-4" aria-hidden="true" />
							</Link>
						</aside>
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
			<section className="py-section">
				<div className="container-wide">
					<div className="relative overflow-hidden rounded-2xl border border-border bg-surface-raised p-10 md:p-16 text-center">
						<div
							className="hero-spotlight absolute inset-0 opacity-60 pointer-events-none"
							aria-hidden="true"
						/>
						<div className="relative z-10">
							<h2 className="text-h1 text-foreground mb-6 max-w-3xl mx-auto text-balance">
								Ready for the website your business has earned?
							</h2>
							<p className="text-lead text-muted-foreground mb-10 max-w-2xl mx-auto">
								Let&apos;s map out what it needs and build something that turns
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
