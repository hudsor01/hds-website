/**
 * Comma Separator
 * Turn a space, tab, or newline separated list into a comma-separated one.
 */

'use client'

import { useId, useMemo, useState } from 'react'
import type { ToolAction } from '@/components/layout/ToolPageLayout'
import { ToolPageLayout } from '@/components/layout/ToolPageLayout'
import { trackEvent } from '@/lib/analytics'
import {
	commaSeparate,
	countItems,
	type QuoteStyle
} from '@/lib/list-formatter'
import { logger } from '@/lib/logger'

const QUOTE_OPTIONS: ReadonlyArray<{ value: QuoteStyle; label: string }> = [
	{ value: 'none', label: 'None' },
	{ value: 'single', label: "Single ' '" },
	{ value: 'double', label: 'Double " "' }
]

// Multi-line so the placeholder itself demonstrates the headline use
// case: pasting a column of values (one per line) from a spreadsheet.
const PLACEHOLDER = '1\n2\n3\n4\n5'

export default function CommaSeparatorClient() {
	const [input, setInput] = useState('')
	const [quote, setQuote] = useState<QuoteStyle>('none')
	const [dedupe, setDedupe] = useState(false)
	const quoteFieldId = useId()
	const dedupeFieldId = useId()

	const output = useMemo(
		() => commaSeparate(input, { quote, dedupe }),
		[input, quote, dedupe]
	)
	const itemCount = useMemo(
		() => countItems(input, { dedupe }),
		[input, dedupe]
	)
	const hasResult = output.length > 0

	const copyToClipboard = async () => {
		if (!output) {
			return
		}
		try {
			await navigator.clipboard.writeText(output)
			trackEvent('calculator_used', {
				calculator_type: 'comma-separator',
				action: 'copy',
				item_count: itemCount
			})
		} catch (error) {
			// Fallback for browsers without the async clipboard API.
			logger.debug('Clipboard API unavailable, using fallback', {
				error: error instanceof Error ? error.message : String(error)
			})
			const textArea = document.createElement('textarea')
			textArea.value = output
			document.body.appendChild(textArea)
			textArea.select()
			document.execCommand('copy')
			document.body.removeChild(textArea)
		}
	}

	const clearAll = () => {
		setInput('')
	}

	const actions: ToolAction[] = [
		{ type: 'copy', label: 'Copy', onClick: copyToClipboard }
	]

	const formSlot = (
		<div className="space-y-comfortable">
			<div>
				<div className="flex items-center justify-between mb-subheading">
					<label
						htmlFor="comma-separator-input"
						className="block text-sm font-medium text-foreground"
					>
						Your column or list
					</label>
					<button
						type="button"
						onClick={clearAll}
						className="text-xs text-muted-foreground hover:text-foreground"
					>
						Clear
					</button>
				</div>
				<textarea
					id="comma-separator-input"
					value={input}
					onChange={event => setInput(event.target.value)}
					className="w-full rounded-md border border-border bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-accent"
					rows={8}
					placeholder={PLACEHOLDER}
					spellCheck={false}
				/>
				<p className="mt-2 text-xs text-muted-foreground">
					Paste a column of values (one per line) from a spreadsheet, or any
					space or tab separated list. Items are joined with a comma and a
					space.
				</p>
			</div>

			<div className="flex flex-wrap items-center gap-content">
				<div className="flex items-center gap-tight">
					<label
						htmlFor={quoteFieldId}
						className="text-sm text-muted-foreground"
					>
						Wrap each item:
					</label>
					<select
						id={quoteFieldId}
						value={quote}
						onChange={event => setQuote(event.target.value as QuoteStyle)}
						className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
					>
						{QUOTE_OPTIONS.map(option => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>

				<label
					htmlFor={dedupeFieldId}
					className="flex items-center gap-tight text-sm text-muted-foreground"
				>
					<input
						id={dedupeFieldId}
						type="checkbox"
						checked={dedupe}
						onChange={event => setDedupe(event.target.checked)}
						className="rounded border-border text-accent focus:ring-accent"
					/>
					Remove duplicates
				</label>
			</div>
		</div>
	)

	const resultSlot = output ? (
		<div>
			<pre className="w-full rounded-md border border-border bg-background p-4 overflow-x-auto">
				<code className="text-sm text-foreground whitespace-pre-wrap break-all font-mono">
					{output}
				</code>
			</pre>
			<div className="mt-2 flex gap-content text-xs text-muted-foreground">
				<span>
					{itemCount} {itemCount === 1 ? 'item' : 'items'}
				</span>
			</div>
		</div>
	) : undefined

	return (
		<ToolPageLayout
			title="Comma Separator"
			description="Convert a column of values into a comma-separated series. Paste a spreadsheet column or any space-separated list."
			columns="two"
			formSlot={formSlot}
			resultSlot={resultSlot}
			hasResult={hasResult}
			resultPlaceholder="Paste a column on the left to see it as a comma-separated series"
			actions={actions}
		/>
	)
}
