'use client'

/**
 * Sign-in client form.
 *
 * Validates input with `signInSchema`, then calls Better Auth's
 * `authClient.signIn.email(...)`. On success, the browser navigates to
 * `/admin` and `router.refresh()` forces React Server Components to re-render
 * with the freshly set session cookie. Errors are surfaced via sonner toasts;
 * internal details go to the project logger, never to the user.
 *
 * Uses local `useState` rather than the project's @tanstack/react-form factory
 * because the surface is two fields with a single submit button: the
 * abstraction overhead outweighs the benefit. Mirrors the precedent in
 * `src/app/unsubscribe/UnsubscribeForm.tsx`.
 */
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from '@/lib/auth/client'
import { logger } from '@/lib/logger'
import { signInSchema } from '@/lib/schemas/auth-forms'

export function SignInForm() {
	const router = useRouter()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()

		const parsed = signInSchema.safeParse({ email, password })
		if (!parsed.success) {
			const message =
				parsed.error.issues[0]?.message ?? 'Please check your input.'
			toast.error(message)
			return
		}

		setIsSubmitting(true)
		const result = await signIn.email({
			email: parsed.data.email,
			password: parsed.data.password,
			callbackURL: '/admin'
		})

		if (result.error) {
			logger.error('Sign-in failed', result.error, {
				metadata: { email: parsed.data.email }
			})
			toast.error('Invalid email or password.')
			setIsSubmitting(false)
			return
		}

		toast.success('Signed in.')
		router.push('/admin')
		router.refresh()
	}

	return (
		<form onSubmit={onSubmit} className="space-y-4" noValidate>
			<div className="space-y-1.5">
				<Label htmlFor="sign-in-email">Email</Label>
				<Input
					id="sign-in-email"
					name="email"
					type="email"
					autoComplete="email"
					required
					value={email}
					onChange={event => setEmail(event.target.value)}
					disabled={isSubmitting}
				/>
			</div>
			<div className="space-y-1.5">
				<Label htmlFor="sign-in-password">Password</Label>
				<Input
					id="sign-in-password"
					name="password"
					type="password"
					autoComplete="current-password"
					required
					value={password}
					onChange={event => setPassword(event.target.value)}
					disabled={isSubmitting}
				/>
			</div>
			<Button
				type="submit"
				disabled={isSubmitting}
				aria-busy={isSubmitting}
				className="w-full"
			>
				{isSubmitting ? 'Signing in...' : 'Sign in'}
			</Button>
		</form>
	)
}
