'use client'

import type { LucideIcon } from 'lucide-react'
import { Copy, Download, Printer, RotateCcw } from 'lucide-react'
import type { ReactElement, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ActionType = 'copy' | 'download' | 'print' | 'reset'

export interface ToolAction {
	type: ActionType
	label: string
	onClick: () => void
}

interface ToolPageLayoutProps {
	title: string
	description: string
	columns?: 'single' | 'two'
	formSlot: ReactNode
	resultSlot?: ReactNode
	hasResult?: boolean
	resultPlaceholder?: string
	actions?: ToolAction[]
	className?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ICON_MAP: Record<ActionType, LucideIcon> = {
	copy: Copy,
	download: Download,
	print: Printer,
	reset: RotateCcw
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface ActionIconProps {
	type: ActionType
	className?: string
}

function ActionIcon({ type, className }: ActionIconProps): ReactElement {
	const Icon = ICON_MAP[type]
	return <Icon className={className} aria-hidden="true" />
}

// ---------------------------------------------------------------------------
// Result card — shared between two-column and single-column layouts
// ---------------------------------------------------------------------------

interface ResultCardProps {
	actions?: ToolAction[]
	hasResult?: boolean
	resultSlot?: ReactNode
	resultPlaceholder?: string
	columns?: 'single' | 'two'
}

function ResultCard({
	actions,
	hasResult,
	resultSlot,
	resultPlaceholder,
	columns
}: ResultCardProps): ReactElement {
	const hasActions = actions !== undefined && actions.length > 0

	return (
		<Card variant="glassLight" size="md">
			{hasActions && (
				<div
					data-slot="action-bar"
					className="flex items-center justify-between mb-4"
				>
					<h2 className="text-h4 text-foreground">Results</h2>
					<div className="flex items-center gap-1">
						{actions.map(action => (
							<Button
								key={action.type}
								variant="ghost"
								size="sm"
								onClick={action.onClick}
							>
								<ActionIcon type={action.type} className="h-4 w-4 mr-1" />
								{action.label}
							</Button>
						))}
					</div>
				</div>
			)}

			{hasResult && resultSlot ? (
				resultSlot
			) : columns === 'two' ? (
				<div className="flex items-center justify-center min-h-[200px] py-12">
					<p className="text-muted-foreground text-sm text-center">
						{resultPlaceholder ?? 'Fill in the form to see results'}
					</p>
				</div>
			) : null}
		</Card>
	)
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ToolPageLayout({
	title,
	description,
	columns = 'single',
	formSlot,
	resultSlot,
	hasResult = false,
	resultPlaceholder,
	actions,
	className
}: ToolPageLayoutProps): ReactElement {
	return (
		<main className="min-h-screen bg-background">
			<div
				className={cn(
					'container-wide px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20 max-w-5xl mx-auto',
					className
				)}
			>
				{/* Header */}
				<div className="mb-10">
					<h1 className="mb-3 text-h1 text-foreground leading-tight">
						{title}
					</h1>
					<p className="max-w-2xl text-lead text-muted-foreground">
						{description}
					</p>
				</div>

				{/* Body */}
				{columns === 'two' ? (
					<div className="grid gap-8 lg:grid-cols-[3fr_2fr] items-start">
						<div>{formSlot}</div>
						<ResultCard
							actions={actions}
							hasResult={hasResult}
							resultSlot={resultSlot}
							resultPlaceholder={resultPlaceholder}
							columns={columns}
						/>
					</div>
				) : (
					<div className="space-y-8">
						<div>{formSlot}</div>
						{hasResult && resultSlot ? (
							<ResultCard
								actions={actions}
								hasResult={hasResult}
								resultSlot={resultSlot}
								resultPlaceholder={resultPlaceholder}
								columns={columns}
							/>
						) : null}
					</div>
				)}
			</div>
		</main>
	)
}
