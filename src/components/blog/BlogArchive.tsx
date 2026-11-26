import { BlogPagination } from '@/components/blog/BlogPagination'
import { BlogPostCard } from '@/components/blog/BlogPostCard'
import { getPosts } from '@/lib/blog'

interface BlogArchiveProps {
	/** 1-based listing page: 1 is /blog, N is /blog/page/N. */
	page: number
}

/**
 * The "All Articles" list for one listing page, newest first, with links to
 * the other pages. Shared by /blog and /blog/page/N so they never drift.
 */
export async function BlogArchive({ page }: BlogArchiveProps) {
	const { posts, totalPages } = await getPosts({ page })
	return (
		<>
			<div className="mb-10">
				<p className="text-xs font-semibold uppercase tracking-widest text-accent-text mb-3">
					All Articles
				</p>
				<h2 className="text-h1 text-foreground mb-comfortable text-balance">
					All Articles
				</h2>
				<p className="text-lead text-muted-foreground max-w-2xl">
					Practical guides for business owners who want more from their
					technology
				</p>
			</div>

			{posts.length === 0 ? (
				<div className="rounded-xl border border-border bg-card p-8 text-center">
					<p className="text-sm text-muted-foreground leading-relaxed">
						No articles found. Check back soon for new content!
					</p>
				</div>
			) : (
				<div className="space-y-6">
					{posts.map(post => (
						<BlogPostCard key={post.id} post={post} />
					))}
				</div>
			)}

			<BlogPagination currentPage={page} totalPages={totalPages} />
		</>
	)
}
