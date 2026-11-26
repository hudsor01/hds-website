'use client'

import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Discoverability affordance for the global command palette. Opens the
 * palette by dispatching the `palette:open` window event that
 * `CommandPalette.tsx` listens for. Keyboard users can still trigger
 * via Cmd+K / Ctrl+K (announced through aria-keyshortcuts); the button
 * shows only "Search" and is hidden on narrow viewports.
 */
export default function CommandPaletteTrigger() {
	const handleClick = () => {
		window.dispatchEvent(new CustomEvent('palette:open'))
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			aria-keyshortcuts="Meta+K Control+K"
			className={cn(
				'hidden lg:inline-flex items-center gap-2 px-3 py-1.5 rounded-md',
				'text-xs text-muted-foreground',
				'border border-border hover:text-foreground hover:bg-muted',
				'transition-smooth'
			)}
		>
			<Search className="h-3.5 w-3.5" aria-hidden="true" />
			<span>Search</span>
		</button>
	)
}
