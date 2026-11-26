import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { TagList } from '@/components/blog/TagList'
import { Button } from '@/components/ui/button'
import { getTagsWithCounts } from '@/lib/blog'

async function TagsSection() {
	const tags = await getTagsWithCounts()
	const populated = tags.filter(tag => tag.count > 0)
	if (populated.length === 0) {
		return null
	}
	return <TagList tags={populated} />
}

/**
 * The /blog listing sidebar: plan CTA, tag chips and a closing CTA. Its
 * card headings are h2 (styled as h3) because they sit outside the
 * "All Articles" section and stream right after the page h1.
 */
export function BlogSidebar() {
	return (
		<aside className="w-full lg:w-80 space-y-6">
			<div className="rounded-xl border border-border bg-card p-8 hover:border-border-strong transition-colors">
				<h2 className="text-h3 text-foreground mb-3 text-balance">
					Curious what a site would cost?
				</h2>
				<p className="text-sm text-muted-foreground mb-6 leading-relaxed">
					Get a free website plan for your business: pages, timeline and a clear
					price.
				</p>
				<Button asChild variant="accent" className="w-full">
					<Link href="/contact">Get My Free Website Plan</Link>
				</Button>
				<p className="text-xs text-muted-foreground mt-3">
					30-minute call. No commitment.
				</p>
			</div>

			<Suspense fallback={null}>
				<TagsSection />
			</Suspense>

			<div className="rounded-xl border border-border bg-card p-8 text-center hover:border-border-strong transition-colors">
				<h2 className="text-h3 text-foreground mb-3 text-balance">
					Ready for a better website?
				</h2>
				<p className="text-sm text-muted-foreground mb-6 leading-relaxed">
					Let&apos;s build the one your business deserves.
				</p>
				<Button asChild variant="accent">
					<Link href="/contact">
						Get My Free Website Plan
						<ArrowRight className="w-4 h-4" />
					</Link>
				</Button>
			</div>
		</aside>
	)
}
