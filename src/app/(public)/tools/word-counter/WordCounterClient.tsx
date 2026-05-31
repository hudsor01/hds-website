/**
 * Word & Character Counter
 * Live word, character, sentence, paragraph, and reading-time counts.
 */

'use client'

import { useMemo, useState } from 'react'
import type { ToolAction } from '@/components/layout/ToolPageLayout'
import { ToolPageLayout } from '@/components/layout/ToolPageLayout'
import { analyzeText } from '@/lib/text-stats'

interface StatCardProps {
	label: string
	value: string
}

function StatCard({ label, value }: StatCardProps) {
	return (
		<div className="rounded-lg border border-border bg-surface-raised px-4 py-3">
			<div className="text-2xl font-bold text-accent tabular-nums">{value}</div>
			<div className="text-xs text-muted-foreground">{label}</div>
		</div>
	)
}

export default function WordCounterClient() {
	const [text, setText] = useState('')
	const stats = useMemo(() => analyzeText(text), [text])
	const hasResult = text.length > 0

	const readingTime =
		stats.readingTimeMinutes === 0 ? '0 min' : `${stats.readingTimeMinutes} min`

	const clearAll = () => setText('')

	const actions: ToolAction[] = [
		{ type: 'reset', label: 'Clear', onClick: clearAll }
	]

	const formSlot = (
		<div className="space-y-comfortable">
			<div>
				<label
					htmlFor="word-counter-input"
					className="block text-sm font-medium text-foreground mb-subheading"
				>
					Your text
				</label>
				<textarea
					id="word-counter-input"
					value={text}
					onChange={event => setText(event.target.value)}
					className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-accent"
					rows={14}
					placeholder="Type or paste your text to count words, characters, sentences, and reading time."
				/>
			</div>
		</div>
	)

	const resultSlot = hasResult ? (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
			<StatCard label="Words" value={stats.words.toLocaleString()} />
			<StatCard label="Characters" value={stats.characters.toLocaleString()} />
			<StatCard
				label="Characters (no spaces)"
				value={stats.charactersNoSpaces.toLocaleString()}
			/>
			<StatCard label="Sentences" value={stats.sentences.toLocaleString()} />
			<StatCard label="Paragraphs" value={stats.paragraphs.toLocaleString()} />
			<StatCard label="Reading time" value={readingTime} />
		</div>
	) : undefined

	return (
		<ToolPageLayout
			title="Word & Character Counter"
			description="Count words, characters, sentences, paragraphs, and reading time as you type. Handy for meta descriptions, tweets, essays, and content limits."
			columns="two"
			formSlot={formSlot}
			resultSlot={resultSlot}
			hasResult={hasResult}
			resultPlaceholder="Start typing to see live counts"
			actions={actions}
		/>
	)
}
