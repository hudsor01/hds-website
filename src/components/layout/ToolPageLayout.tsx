'use client'

import type { LucideIcon } from 'lucide-react'
import { Copy, Download, Printer, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactElement, ReactNode } from 'react'
import { toast } from 'sonner'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { JsonLd } from '@/components/utilities/JsonLd'
import { generateBreadcrumbSchema } from '@/lib/seo-utils'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ActionType = 'copy' | 'download' | 'print' | 'reset'

export interface ToolAction {
	type: ActionType
	label: string
	/**
	 * Runs on click. A handler that copies by itself owns its own feedback.
	 * With `copyText` set, it runs only after a successful copy (analytics).
	 */
	onClick?: () => void | Promise<void>
	/**
	 * Copy actions: the text to copy. The layout writes it to the clipboard
	 * and shows an honest Sonner toast for success or failure.
	 */
	copyText?: string
	/** Success toast for `copyText` copies. Default "Copied to clipboard". */
	copiedMessage?: string
	disabled?: boolean
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

const SITE_URL = 'https://hudsondigitalsolutions.com'

// ---------------------------------------------------------------------------
// Clipboard
// ---------------------------------------------------------------------------

/** Legacy fallback for browsers or contexts without the async clipboard. */
function copyWithSelection(text: string): boolean {
	const textArea = document.createElement('textarea')
	textArea.value = text
	textArea.setAttribute('readonly', '')
	textArea.style.position = 'fixed'
	textArea.style.opacity = '0'
	document.body.appendChild(textArea)
	textArea.select()
	try {
		return document.execCommand('copy')
	} catch {
		return false
	} finally {
		document.body.removeChild(textArea)
	}
}

async function writeClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text)
		return true
	} catch {
		return copyWithSelection(text)
	}
}

async function runAction(action: ToolAction): Promise<void> {
	if (action.copyText === undefined) {
		await action.onClick?.()
		return
	}
	if (await writeClipboard(action.copyText)) {
		toast.success(action.copiedMessage ?? 'Copied to clipboard')
		await action.onClick?.()
	} else {
		toast.error('Could not copy. Select the text and copy it by hand.')
	}
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
	// Actions act on a result, so they never show before there is one (a
	// Copy button beside the placeholder would copy nothing).
	const showResult = Boolean(hasResult && resultSlot)
	const hasActions = showResult && actions !== undefined && actions.length > 0

	return (
		<Card variant="glassLight" size="md">
			{hasActions && (
				<div
					data-slot="action-bar"
					className="flex items-center justify-between mb-4"
				>
					<h2 className="text-h4 text-foreground">Results</h2>
					<div className="flex items-center gap-1">
						{actions?.map(action => (
							<Button
								key={action.type}
								variant="ghost"
								size="sm"
								disabled={action.disabled}
								onClick={() => void runAction(action)}
							>
								<ActionIcon type={action.type} className="h-4 w-4 mr-1" />
								{action.label}
							</Button>
						))}
					</div>
				</div>
			)}

			{showResult ? (
				resultSlot
			) : columns === 'two' ? (
				<div className="flex items-center justify-center min-h-50 py-12">
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
	const pathname = usePathname()
	const breadcrumbSchema = generateBreadcrumbSchema([
		{ name: 'Home', url: SITE_URL },
		{ name: 'Tools', url: `${SITE_URL}/tools` },
		{ name: title, url: `${SITE_URL}${pathname}` }
	])

	// A <div>, not <main>: the (public) layout already renders the page's
	// single <main id="main-content"> landmark.
	return (
		<div className="min-h-screen bg-background">
			<div
				className={cn(
					columns === 'two' ? 'container-wide' : 'container-content',
					'pt-28 pb-16 sm:pt-32 sm:pb-20',
					className
				)}
			>
				<JsonLd data={breadcrumbSchema} />

				{/* Breadcrumb */}
				<Breadcrumb className="mb-6">
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link
									href="/"
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									Home
								</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link
									href="/tools"
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									Tools
								</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage className="text-foreground">
								{title}
							</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>

				{/* Header */}
				<div className="mb-10">
					<h1 className="mb-3 text-page-title text-foreground text-balance">
						{title}
					</h1>
					<p className="max-w-2xl text-lead text-muted-foreground">
						{description}
					</p>
				</div>

				{/* Body */}
				{columns === 'two' ? (
					<div className="grid gap-8 lg:grid-cols-tool items-start">
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
		</div>
	)
}
