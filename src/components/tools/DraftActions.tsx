'use client'

import { RotateCcw, Save } from 'lucide-react'

interface DraftActionsProps {
	hasDraft: boolean
	onSave: () => void
	onClear: () => void
}

/**
 * Save / Clear Draft action pair used by the contract and proposal
 * generator tools. The "Clear Draft" button only renders when a draft
 * exists in the local-storage backed state.
 */
export function DraftActions({ hasDraft, onSave, onClear }: DraftActionsProps) {
	return (
		<section className="flex flex-wrap gap-3 pt-4">
			<button
				type="button"
				onClick={onSave}
				className="flex items-center gap-tight rounded-md border border-border bg-surface-raised px-4 py-2.5 text-sm font-medium text-foreground shadow-xs hover:bg-muted"
			>
				<Save className="w-4 h-4" />
				Save Draft
			</button>

			{hasDraft && (
				<button
					type="button"
					onClick={onClear}
					className="flex items-center gap-tight rounded-md border border-border bg-surface-raised px-4 py-2.5 text-sm font-medium text-muted-foreground shadow-xs hover:bg-muted"
				>
					<RotateCcw className="w-4 h-4" />
					Clear Draft
				</button>
			)}
		</section>
	)
}
