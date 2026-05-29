'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList
} from '@/components/ui/command'
import type { PaletteEntry, PaletteGroup } from './types'

interface CommandPaletteProps {
	entries: readonly PaletteEntry[]
}

const GROUP_ORDER: readonly PaletteGroup[] = [
	'Tools',
	'Pages',
	'Blog',
	'Showcase'
]

/**
 * Detect input-like targets so the keyboard shortcut doesn't hijack typing.
 * Targets the user is actively typing into (text inputs, textareas,
 * contenteditable surfaces) must keep ownership of Cmd+K.
 */
function isTypingTarget(event: KeyboardEvent): boolean {
	const target = event.target
	if (!(target instanceof HTMLElement)) {
		return false
	}
	if (target.isContentEditable) {
		return true
	}
	if (target instanceof HTMLTextAreaElement) {
		return true
	}
	if (target instanceof HTMLInputElement) {
		// Allow palette shortcut from buttons/checkboxes etc.; block only text-like.
		const blocking = new Set([
			'text',
			'search',
			'email',
			'url',
			'tel',
			'password',
			'number'
		])
		return blocking.has(target.type.toLowerCase())
	}
	return false
}

export default function CommandPalette({ entries }: CommandPaletteProps) {
	const router = useRouter()
	const [open, setOpen] = useState(false)

	const grouped = useMemo(() => {
		const map = new Map<PaletteGroup, PaletteEntry[]>()
		for (const entry of entries) {
			const bucket = map.get(entry.group)
			if (bucket) {
				bucket.push(entry)
			} else {
				map.set(entry.group, [entry])
			}
		}
		return GROUP_ORDER.flatMap(group => {
			const items = map.get(group)
			return items && items.length > 0 ? [{ group, items }] : []
		})
	}, [entries])

	useEffect(() => {
		const handleKey = (event: KeyboardEvent) => {
			if (event.key.toLowerCase() !== 'k') {
				return
			}
			if (!event.metaKey && !event.ctrlKey) {
				return
			}
			if (isTypingTarget(event)) {
				return
			}
			event.preventDefault()
			setOpen(prev => !prev)
		}
		const handleOpenRequest = () => setOpen(true)
		document.addEventListener('keydown', handleKey)
		window.addEventListener('palette:open', handleOpenRequest)
		return () => {
			document.removeEventListener('keydown', handleKey)
			window.removeEventListener('palette:open', handleOpenRequest)
		}
	}, [])

	const handleSelect = useCallback(
		(href: string) => {
			setOpen(false)
			router.push(href)
		},
		[router]
	)

	return (
		<CommandDialog
			open={open}
			onOpenChange={setOpen}
			title="Site command palette"
			description="Search pages, tools, and recent posts. Press Cmd K or Ctrl K to toggle."
		>
			<CommandInput placeholder="Search pages, tools, and posts" />
			<CommandList>
				<CommandEmpty>No results.</CommandEmpty>
				{grouped.map(({ group, items }) => (
					<CommandGroup key={group} heading={group}>
						{items.map(entry => (
							<CommandItem
								key={entry.id}
								value={[
									entry.label,
									entry.description ?? '',
									...(entry.keywords ?? [])
								].join(' ')}
								onSelect={() => handleSelect(entry.href)}
							>
								<div className="flex flex-col">
									<span className="text-sm font-medium text-foreground">
										{entry.label}
									</span>
									{entry.description && (
										<span className="text-xs text-muted-foreground line-clamp-1">
											{entry.description}
										</span>
									)}
								</div>
							</CommandItem>
						))}
					</CommandGroup>
				))}
			</CommandList>
		</CommandDialog>
	)
}
