'use client'

import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Discoverability affordance for the global command palette. Opens the
 * palette by dispatching the `palette:open` window event that
 * `CommandPalette.tsx` listens for. Keyboard users can still trigger
 * via Cmd+K / Ctrl+K without ever seeing this button (it is hidden on
 * narrow viewports where the hint would crowd the nav).
 *
 * Detects platform on mount to render the correct modifier glyph
 * ("Cmd" on Apple, "Ctrl" elsewhere). Defaults to "Ctrl" during SSR
 * so the markup is deterministic.
 */
export default function CommandPaletteTrigger() {
	const [modifier, setModifier] = useState<'Ctrl' | 'Cmd'>('Ctrl')

	useEffect(() => {
		const platform =
			typeof navigator === 'undefined' ? '' : navigator.platform || ''
		if (/(Mac|iPhone|iPad|iPod)/i.test(platform)) {
			setModifier('Cmd')
		}
	}, [])

	const handleClick = () => {
		window.dispatchEvent(new CustomEvent('palette:open'))
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			aria-label="Open command palette"
			className={cn(
				'hidden lg:inline-flex items-center gap-2 px-3 py-1.5 rounded-md',
				'text-xs text-muted-foreground',
				'border border-border hover:text-foreground hover:bg-muted',
				'transition-smooth focus-ring'
			)}
		>
			<Search className="h-3.5 w-3.5" aria-hidden="true" />
			<span>Search</span>
			<span
				className="flex items-center gap-1 ml-1 text-[10px] font-mono opacity-80"
				aria-hidden="true"
			>
				<kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/50">
					{modifier}
				</kbd>
				<kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/50">
					K
				</kbd>
			</span>
		</button>
	)
}
