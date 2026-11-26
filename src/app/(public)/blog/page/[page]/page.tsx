import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { BlogArchive } from '@/components/blog/BlogArchive'
import { BlogSidebar } from '@/components/blog/BlogSidebar'
import { getBlogPageCount } from '@/lib/blog'
import { brandedTitle, buildMetadata } from '@/lib/seo-config'

interface BlogListingPageProps {
	params: Promise<{ page: string }>
}

/**
 * The listing page number for a route param, or null when it is not one of
 * the prerendered pages. Only canonical digits count ("02" and "1e1" are
 * not pages), so every listing page has exactly one URL.
 */
async function pageNumber(param: string): Promise<number | null> {
	if (!/^[1-9]\d*$/.test(param)) {
		return null
	}
	const page = Number(param)
	return page <= (await getBlogPageCount()) ? page : null
}

export async function generateMetadata({
	params
}: BlogListingPageProps): Promise<Metadata> {
	const page = await pageNumber((await params).page)
	if (!page) {
		return { title: brandedTitle('Page Not Found') }
	}
	const totalPages = await getBlogPageCount()
	return buildMetadata({
		title: brandedTitle(`Small Business Web Design Blog, Page ${page}`),
		description: `Page ${page} of ${totalPages} of my blog: practical guides on websites, getting found on Google and growing a small business online, with the newest posts listed first.`,
		path: `/blog/page/${page}`
	})
}

// Every listing page is prerendered; any other value (0, 999, abc) is a hard
// 404 with no render, the same pattern as blog/[slug].
export const unstable_paramMatching = { page: 'not-found' }

// Page 1 is always listed (it redirects to /blog), so the list is never
// empty, which Cache Components rejects, even with a single page of posts.
export async function generateStaticParams() {
	const totalPages = await getBlogPageCount()
	return Array.from({ length: totalPages }, (_, i) => ({
		page: String(i + 1)
	}))
}

export default async function BlogListingPage({
	params
}: BlogListingPageProps) {
	const page = await pageNumber((await params).page)
	if (!page) {
		notFound()
	}
	if (page === 1) {
		permanentRedirect('/blog')
	}
	const totalPages = await getBlogPageCount()

	return (
		<div className="min-h-screen bg-background">
			<section className="relative overflow-hidden bg-background">
				<div className="container-wide pt-28 pb-16 sm:pt-32 sm:pb-20 text-center">
					<p className="text-eyebrow mb-3">Practical Insights</p>
					<h1 className="text-page-title text-foreground text-balance">
						Website Tips for Small Businesses
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6">
						Page {page} of {totalPages}, newest posts first.
					</p>
				</div>
			</section>

			<section className="py-section-sm">
				<div className="container-wide">
					<div className="flex flex-col lg:flex-row gap-10">
						<div className="flex-1">
							<BlogArchive page={page} />
						</div>
						<BlogSidebar />
					</div>
				</div>
			</section>
		</div>
	)
}
