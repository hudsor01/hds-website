import { cacheLife, cacheTag } from 'next/cache'
import sanitizeHtml from 'sanitize-html'
import type { BlogPost } from '@/lib/blog'

interface BlogPostContentProps {
	post: BlogPost
}

// sanitize-html uses htmlparser2 (no jsdom) so it builds cleanly under
// Bun on Vercel. The previous isomorphic-dompurify dep pulled in jsdom
// which references the Node `MIMEType` global — not exposed in Vercel's
// build runtime, breaking /blog/[slug] page collection.
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
	allowedTags: [
		'p',
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6',
		'strong',
		'em',
		'u',
		'a',
		'ul',
		'ol',
		'li',
		'blockquote',
		'code',
		'pre',
		'br',
		'img'
	],
	allowedAttributes: {
		a: ['href', 'title', 'target', 'rel', 'class'],
		img: ['src', 'alt', 'title', 'class']
	},
	allowedSchemes: ['http', 'https', 'mailto'],
	allowedSchemesByTag: { img: ['http', 'https', 'data'] }
}

export async function BlogPostContent({ post }: BlogPostContentProps) {
	'use cache'
	cacheLife('days')
	// Tag key matches getPostBySlug in src/lib/blog.ts which uses
	// `blog-post:${slug}` — keep them aligned so a single
	// revalidateTag('blog-post:my-post-slug') invalidates BOTH the data
	// fetch and this render cache. Using post.id here would create a
	// silent mismatch that breaks per-post targeted invalidation.
	cacheTag('blog-posts', `blog-post:${post.slug}`)

	if (!post.content) {
		return (
			<div className="prose prose-invert max-w-none">
				<p className="text-muted-foreground">
					This post content is coming soon. Check back later for the full
					article.
				</p>
			</div>
		)
	}

	// Blog content comes from our trusted n8n pipeline; sanitization is
	// defense in depth.
	const sanitizedContent = sanitizeHtml(post.content, SANITIZE_OPTIONS)

	return (
		<div
			className="prose prose-invert max-w-none"
			dangerouslySetInnerHTML={{ __html: sanitizedContent }}
		/>
	)
}
