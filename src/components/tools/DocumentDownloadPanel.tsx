'use client'

import { Download, Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { useId } from 'react'
import { Button } from '@/components/ui/button'

interface DocumentDownloadPanelProps {
	/** Lower-case document name, e.g. 'invoice'. */
	documentLabel: string
	/** What still blocks the download. Empty means ready. */
	issues: string[]
	isGenerating: boolean
	onDownload: () => void
	/** Optional summary shown once the document is ready. */
	summary?: ReactNode
}

/**
 * Download area for the invoice, proposal and contract generators. It
 * always shows the Download button: disabled with a short list of what is
 * missing until the form is ready, then enabled with a summary. A polite
 * live region announces when the document becomes ready.
 */
export function DocumentDownloadPanel({
	documentLabel,
	issues,
	isGenerating,
	onDownload,
	summary
}: DocumentDownloadPanelProps) {
	const headingId = useId()
	const issuesId = useId()
	const isReady = issues.length === 0

	return (
		<section aria-labelledby={headingId} className="space-y-4">
			<h2 id={headingId} className="text-h4 text-foreground">
				Download
			</h2>

			<p
				role="status"
				aria-live="polite"
				className="text-sm text-muted-foreground"
			>
				{isReady
					? `Your ${documentLabel} is ready to download.`
					: `Add ${issues.length === 1 ? 'one more detail' : `${issues.length} more details`} to download your ${documentLabel}.`}
			</p>

			{isReady ? (
				summary
			) : (
				<ul
					id={issuesId}
					className="list-disc space-y-1 pl-5 text-sm text-foreground"
				>
					{issues.map(issue => (
						<li key={issue}>{issue}</li>
					))}
				</ul>
			)}

			<Button
				type="button"
				variant="accent"
				size="lg"
				onClick={onDownload}
				disabled={!isReady || isGenerating}
				aria-busy={isGenerating}
				aria-describedby={isReady ? undefined : issuesId}
			>
				{isGenerating ? (
					<Loader2 className="animate-spin" aria-hidden="true" />
				) : (
					<Download aria-hidden="true" />
				)}
				{isGenerating ? 'Creating PDF' : 'Download PDF'}
			</Button>
		</section>
	)
}
