'use client'

/**
 * Confirm-then-delete button for admin edit forms (client component).
 *
 * Renders a tiny <form> bound to a Server Action (passed in as `action`).
 * The submit handler intercepts the click and asks `window.confirm` first;
 * cancel aborts the submit. Per CONTEXT.md D-08 the native browser confirm
 * is sufficient for v1, no custom modal.
 *
 * Client because `window.confirm` is a browser API; everything else (the
 * Server Action call itself) runs on the server via the form action seam.
 */
import { Trash2 } from 'lucide-react'

interface DeleteButtonProps {
	// Server Action. React types this as a function that receives FormData and
	// returns void or a Promise; the action body is responsible for redirect.
	action: (formData: FormData) => void | Promise<void>
	id: string
	label: string
	confirmMessage: string
}

export function DeleteButton({
	action,
	id,
	label,
	confirmMessage
}: DeleteButtonProps) {
	return (
		<form action={action}>
			<input type="hidden" name="id" value={id} />
			<button
				type="submit"
				onClick={e => {
					if (!window.confirm(confirmMessage)) {
						e.preventDefault()
					}
				}}
				className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-destructive border border-destructive/40 hover:bg-destructive/10 transition-smooth"
			>
				<Trash2 size={16} aria-hidden="true" />
				{label}
			</button>
		</form>
	)
}
