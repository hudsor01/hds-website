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
import { Button } from '@/components/ui/button'

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
			<Button
				type="submit"
				variant="destructive"
				size="sm"
				onClick={e => {
					if (!window.confirm(confirmMessage)) {
						e.preventDefault()
					}
				}}
			>
				<Trash2 aria-hidden="true" />
				{label}
			</Button>
		</form>
	)
}
