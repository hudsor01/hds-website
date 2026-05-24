'use client'

/**
 * Quick publish/unpublish icon-button for admin list tables (client).
 *
 * Renders a small <form> whose action is a Server Action that toggles the
 * `published` boolean for the given row. The server decides the new state
 * and the `publishedAt` semantics (per CONTEXT.md section 5: set on the
 * first false -> true transition, cleared on true -> false).
 *
 * Client because the icon-button needs the form action seam React provides
 * to client components; the visual chrome (Eye / EyeOff) is purely
 * presentational and mirrors the existing Sidebar lucide-react usage.
 */
import { Eye, EyeOff } from 'lucide-react'

interface PublishToggleProps {
	action: (formData: FormData) => void | Promise<void>
	id: string
	published: boolean
	resourceLabel: string
}

export function PublishToggle({
	action,
	id,
	published,
	resourceLabel
}: PublishToggleProps) {
	const next = published ? 'Unpublish' : 'Publish'
	const Icon = published ? Eye : EyeOff
	return (
		<form action={action}>
			<input type="hidden" name="id" value={id} />
			<button
				type="submit"
				aria-label={`${next} ${resourceLabel}`}
				className="inline-flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:bg-surface-base hover:text-foreground transition-smooth"
			>
				<Icon size={16} aria-hidden="true" />
			</button>
		</form>
	)
}
