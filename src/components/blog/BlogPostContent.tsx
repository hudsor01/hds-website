import sanitizeHtml from 'sanitize-html'
import type { BlogPost } from '@/lib/blog'
import { withHeadingIds } from '@/lib/blog-toc'

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
		'img',
		'hr',
		'table',
		'thead',
		'tbody',
		'tr',
		'th',
		'td'
	],
	allowedAttributes: {
		a: ['href', 'title', 'target', 'rel', 'class'],
		img: ['src', 'alt', 'title', 'class'],
		th: ['align'],
		td: ['align']
	},
	allowedSchemes: ['http', 'https', 'mailto']
	// Intentionally NOT allowing data: URIs on <img>: data: images can carry
	// tracking pixels or, in legacy browsers, exfiltration vectors.
}

// Rendered once per post at build time (the blog is fully prerendered), so
// no render cache is needed here.
export function BlogPostContent({ post }: BlogPostContentProps) {
	if (!post.content) {
		return (
			<div className="typography max-w-none">
				<p className="text-muted-foreground">
					This post content is coming soon. Check back later for the full
					article.
				</p>
			</div>
		)
	}

	// Blog content comes from content/blog in this repo; sanitization is
	// defense in depth. Heading ids are injected after sanitizing (clean
	// slugs, safe) so the table of contents can anchor-link to each section.
	const sanitizedContent = sanitizeHtml(post.content, SANITIZE_OPTIONS)
	const { html } = withHeadingIds(sanitizedContent)

	return (
		<div
			className="typography max-w-none"
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	)
}
