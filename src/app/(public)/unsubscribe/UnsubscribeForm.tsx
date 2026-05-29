'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { csrfFetch } from '@/lib/api/csrf-fetch'
import { logger } from '@/lib/logger'

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
	const token = formData.get('token')

	if (!email || typeof email !== 'string') {
		return { success: false, error: 'Email address is required.' }
	}
	if (!token || typeof token !== 'string') {
		return {
			success: false,
			error:
				'This unsubscribe link is missing its security token. Please use the most recent link from your email.'
		}
	}

	try {
		const response = await csrfFetch('/api/newsletter/unsubscribe', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, token })
		})

		if (!response.ok) {
			const data = (await response.json().catch(() => ({}))) as {
				error?: string
			}
			return {
				success: false,
				error:
					data.error ??
					'Failed to unsubscribe. Please use the latest link from your email.'
			}
		}

		return { success: true, error: null }
	} catch (error) {
		logger.error('unsubscribe fetch failed', { error })
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
			className="w-full px-6 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 disabled:opacity-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
		>
			{pending ? 'Processing...' : 'Unsubscribe'}
		</button>
	)
}

interface UnsubscribeFormProps {
	email: string
	token: string
}

export function UnsubscribeForm({ email, token }: UnsubscribeFormProps) {
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
					htmlFor="unsubscribe-email"
					className="block text-sm font-medium text-foreground mb-1"
				>
					Email address
				</label>
				<input
					id="unsubscribe-email"
					name="email"
					type="email"
					defaultValue={email}
					readOnly
					required
					aria-readonly="true"
					aria-describedby={state.error ? 'unsubscribe-error' : undefined}
					aria-invalid={state.error ? 'true' : undefined}
					className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
				/>
				<input type="hidden" name="token" value={token} />
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
