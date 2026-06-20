'use client'

import { useEffect, useState } from 'react'
import type { TocItem } from '@/lib/blog-toc'

interface BlogTableOfContentsProps {
	items: TocItem[]
}

/**
 * "On this page" navigation built from the post's h2/h3 headings. Highlights
 * the section currently in view (IntersectionObserver scrollspy) and smooth
 * scrolls on click. Rendered as a sticky sidebar on large screens.
 */
export function BlogTableOfContents({ items }: BlogTableOfContentsProps) {
	const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '')

	useEffect(() => {
		const headings = items
			.map(item => document.getElementById(item.id))
			.filter((el): el is HTMLElement => el !== null)
		if (headings.length === 0) {
			return
		}

		const observer = new IntersectionObserver(
			entries => {
				const visible = entries
					.filter(e => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
				if (visible[0]?.target.id) {
					setActiveId(visible[0].target.id)
				}
			},
			// Trigger when a heading sits in the top third of the viewport.
			{ rootMargin: '-80px 0px -66% 0px', threshold: 0 }
		)
		for (const h of headings) {
			observer.observe(h)
		}
		return () => observer.disconnect()
	}, [items])

	function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
		e.preventDefault()
		const el = document.getElementById(id)
		if (!el) {
			return
		}
		el.scrollIntoView({ behavior: 'smooth', block: 'start' })
		setActiveId(id)
		history.replaceState(null, '', `#${id}`)
	}

	if (items.length < 2) {
		return null
	}

	return (
		<nav aria-label="Table of contents" className="text-sm">
			<p className="font-semibold text-foreground mb-3">On this page</p>
			<ul className="space-y-2 border-l border-border-subtle">
				{items.map(item => {
					const active = item.id === activeId
					return (
						<li key={item.id} className={item.level === 3 ? 'ml-3' : undefined}>
							<a
								href={`#${item.id}`}
								onClick={e => handleClick(e, item.id)}
								aria-current={active ? 'location' : undefined}
								className={`-ml-px block border-l-2 pl-3 transition-colors ${
									active
										? 'border-accent text-accent font-medium'
										: 'border-transparent text-muted-foreground hover:text-foreground hover:border-border-strong'
								}`}
							>
								{item.text}
							</a>
						</li>
					)
				})}
			</ul>
		</nav>
	)
}
