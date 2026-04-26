import DOMPurify from 'isomorphic-dompurify'
import { cacheLife, cacheTag } from 'next/cache'
import type { BlogPost } from '@/lib/blog'

interface BlogPostContentProps {
	post: BlogPost
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

	// Blog content comes from our trusted n8n pipeline, not user input.
	// isomorphic-dompurify works in both Node.js (SSR) and browser environments.
	const sanitizedContent = DOMPurify.sanitize(post.content, {
		ALLOWED_TAGS: [
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
		ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel'],
		ALLOW_DATA_ATTR: false
	})

	return (
		<div
			className="prose prose-invert max-w-none"
			dangerouslySetInnerHTML={{ __html: sanitizedContent }}
		/>
	)
}
