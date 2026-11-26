'use client'

import { RotateCcw, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DraftActionsProps {
	hasDraft: boolean
	onSave: () => void
	onClear: () => void
}

/**
 * Save / Clear Draft action pair used by the invoice, proposal and
 * contract generator tools. The "Clear Draft" button only renders when a
 * draft exists in the local-storage backed state.
 */
export function DraftActions({ hasDraft, onSave, onClear }: DraftActionsProps) {
	return (
		<section aria-label="Draft" className="flex flex-wrap gap-3 pt-4">
			<Button type="button" variant="outline" onClick={onSave}>
				<Save aria-hidden="true" />
				Save Draft
			</Button>

			{hasDraft && (
				<Button type="button" variant="outline" onClick={onClear}>
					<RotateCcw aria-hidden="true" />
					Clear Draft
				</Button>
			)}
		</section>
	)
}
