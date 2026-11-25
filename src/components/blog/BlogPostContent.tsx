interface BlogPostContentProps {
	/**
	 * Sanitized post HTML with heading ids, from prepareBlogContent. The page
	 * builds the table of contents from the same call, so its links always
	 * resolve to these headings.
	 */
	html: string
}

// Rendered once per post at build time (the blog is fully prerendered), so
// no render cache is needed here.
export function BlogPostContent({ html }: BlogPostContentProps) {
	if (!html) {
		return (
			<div className="typography max-w-none">
				<p className="text-muted-foreground">
					This post content is coming soon. Check back later for the full
					article.
				</p>
			</div>
		)
	}

	return (
		<div
			className="typography max-w-none"
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	)
}
