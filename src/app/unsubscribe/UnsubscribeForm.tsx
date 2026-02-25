'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

interface UnsubscribeFormState {
	success: boolean
	error: string | null
}

const initialState: UnsubscribeFormState = {
	success: false,
	error: null
}

async function unsubscribeAction(
	_prevState: UnsubscribeFormState,
	formData: FormData
): Promise<UnsubscribeFormState> {
	const email = formData.get('email')

	if (!email || typeof email !== 'string') {
		return { success: false, error: 'Email address is required.' }
	}

	try {
		const response = await fetch('/api/newsletter/unsubscribe', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email })
		})

		if (!response.ok) {
			return {
				success: false,
				error: 'Failed to unsubscribe. Please try again.'
			}
		}

		return { success: true, error: null }
	} catch {
		return {
			success: false,
			error: 'An unexpected error occurred. Please try again.'
		}
	}
}

function SubmitButton() {
	const { pending } = useFormStatus()
	return (
		<button
			type="submit"
			disabled={pending}
			className="w-full px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 disabled:opacity-50 transition-colors"
		>
			{pending ? 'Processing...' : 'Unsubscribe'}
		</button>
	)
}

interface UnsubscribeFormProps {
	email: string
}

export function UnsubscribeForm({ email }: UnsubscribeFormProps) {
	const [state, formAction] = useActionState(unsubscribeAction, initialState)

	if (state.success) {
		return (
			<div className="text-center py-8">
				<p className="text-lg text-foreground font-semibold mb-2">
					You have been unsubscribed.
				</p>
				<p className="text-muted-foreground">
					You will no longer receive emails from Hudson Digital Solutions.
				</p>
			</div>
		)
	}

	return (
		<form action={formAction} className="space-y-4">
			<div>
				<label
					htmlFor="email"
					className="block text-sm font-medium text-foreground mb-1"
				>
					Email address
				</label>
				<input
					id="email"
					name="email"
					type="email"
					defaultValue={email}
					required
					className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
					aria-describedby={state.error ? 'unsubscribe-error' : undefined}
				/>
			</div>

			{state.error && (
				<p
					id="unsubscribe-error"
					role="alert"
					aria-live="assertive"
					className="text-sm text-destructive"
				>
					{state.error}
				</p>
			)}

			<SubmitButton />
		</form>
	)
}
