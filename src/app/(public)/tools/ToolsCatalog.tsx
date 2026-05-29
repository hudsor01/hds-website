'use client'

import { ArrowRight, Search } from 'lucide-react'
import Link from 'next/link'
import { useId, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { TOOL_CATEGORIES, TOOLS, type ToolEntry } from './tools-data'

/**
 * Client-side filtered catalog. Search is a substring match over
 * title, description, and benefits (audit #278). Categories
 * (#262) anchor each block so a small business owner finds the
 * relevant tools without scrolling past unrelated ones.
 */
function matches(tool: ToolEntry, query: string): boolean {
	if (!query) {
		return true
	}
	const haystack = [tool.title, tool.description, ...tool.benefits]
		.join(' ')
		.toLowerCase()
	return haystack.includes(query.toLowerCase())
}

export default function ToolsCatalog() {
	const [query, setQuery] = useState('')
	const searchId = useId()

	const trimmed = query.trim()
	const grouped = useMemo(() => {
		return TOOL_CATEGORIES.map(category => ({
			category,
			items: TOOLS.filter(
				tool => tool.category === category.id && matches(tool, trimmed)
			)
		})).filter(group => group.items.length > 0)
	}, [trimmed])

	const visibleCount = grouped.reduce((n, g) => n + g.items.length, 0)
	const noResults = trimmed.length > 0 && visibleCount === 0

	return (
		<div className="space-y-sections">
			<div className="max-w-xl">
				<label htmlFor={searchId} className="sr-only">
					Search tools
				</label>
				<div className="relative">
					<Search
						aria-hidden="true"
						className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
					/>
					<Input
						id={searchId}
						type="search"
						value={query}
						onChange={e => setQuery(e.target.value)}
						placeholder="Search tools by name or keyword"
						className="pl-9"
						aria-describedby={
							trimmed.length > 0 ? `${searchId}-status` : undefined
						}
					/>
				</div>
				<p id={`${searchId}-status`} className="sr-only" aria-live="polite">
					{trimmed.length === 0
						? ''
						: visibleCount === 0
							? 'No tools match your search.'
							: `${visibleCount} ${visibleCount === 1 ? 'tool' : 'tools'} matching "${trimmed}".`}
				</p>
			</div>

			{noResults ? (
				<div className="rounded-xl border border-border bg-surface-raised p-8 text-center">
					<p className="text-sm text-muted-foreground">
						No tools match &ldquo;{trimmed}&rdquo;. Try a broader keyword like
						&ldquo;invoice&rdquo;, &ldquo;ROI&rdquo;, or &ldquo;JSON&rdquo;.
					</p>
				</div>
			) : (
				grouped.map(({ category, items }) => (
					<section
						key={category.id}
						aria-labelledby={`tools-cat-${category.id}`}
					>
						<div className="mb-comfortable">
							<h2
								id={`tools-cat-${category.id}`}
								className="text-h2 text-foreground mb-2"
							>
								{category.title}
							</h2>
							<p className="text-sm text-muted-foreground max-w-2xl">
								{category.intro}
							</p>
						</div>

						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{items.map(tool => (
								<Card
									key={tool.href}
									variant="glassLight"
									size="lg"
									hover={true}
									className="group flex flex-col"
								>
									<div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
										<tool.Icon className="h-5 w-5 text-accent" />
									</div>

									<h3 className="text-h3 text-foreground mb-3">{tool.title}</h3>

									<p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
										{tool.description}
									</p>

									<ul className="mb-6 space-y-2">
										{tool.benefits.map(benefit => (
											<li
												key={benefit}
												className="flex items-start gap-2 text-sm text-muted-foreground"
											>
												<div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-accent/30 border border-accent/50" />
												{benefit}
											</li>
										))}
									</ul>

									<Link
										href={tool.href}
										className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
									>
										{tool.cta}
										<ArrowRight className="h-4 w-4" />
									</Link>
								</Card>
							))}
						</div>
					</section>
				))
			)}
		</div>
	)
}
