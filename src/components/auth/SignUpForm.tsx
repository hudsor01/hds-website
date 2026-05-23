'use client'

/**
 * Sign-up client form.
 *
 * Validates input with `signUpSchema`, then calls Better Auth's
 * `authClient.signUp.email(...)`. On success, the browser navigates to
 * `/admin` and `router.refresh()` forces React Server Components to re-render
 * with the freshly set session cookie. Errors are mapped to friendly toasts;
 * raw Better Auth error codes never leak to the user.
 *
 * Uses local `useState` rather than the project's @tanstack/react-form factory
 * for the same reason as `SignInForm`: small surface (three fields), single
 * submit button, mirrors the precedent in `src/app/unsubscribe/UnsubscribeForm.tsx`.
 */
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from '@/lib/auth/client'
import { logger } from '@/lib/logger'
import { signUpSchema } from '@/lib/schemas/auth-forms'

export function SignUpForm() {
	const router = useRouter()
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()

		const parsed = signUpSchema.safeParse({
			email,
			password,
			name: name || undefined
		})
		if (!parsed.success) {
			const message =
				parsed.error.issues[0]?.message ?? 'Please check your input.'
			toast.error(message)
			return
		}

		setIsSubmitting(true)
		// callbackURL omitted: router.push() below handles navigation.
		const result = await signUp.email({
			email: parsed.data.email,
			password: parsed.data.password,
			name: parsed.data.name ?? parsed.data.email
		})

		if (result.error) {
			logger.error('Sign-up failed', result.error, {
				metadata: { email: parsed.data.email }
			})
			toast.error('Could not create account. Please try again.')
			setIsSubmitting(false)
			return
		}

		toast.success('Account created.')
		router.push('/admin')
		router.refresh()
	}

	return (
		<form onSubmit={onSubmit} className="space-y-4" noValidate>
			<div className="space-y-1.5">
				<Label htmlFor="sign-up-name">Name (optional)</Label>
				<Input
					id="sign-up-name"
					name="name"
					type="text"
					autoComplete="name"
					value={name}
					onChange={event => setName(event.target.value)}
					disabled={isSubmitting}
				/>
			</div>
			<div className="space-y-1.5">
				<Label htmlFor="sign-up-email">Email</Label>
				<Input
					id="sign-up-email"
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
				<Label htmlFor="sign-up-password">Password</Label>
				<Input
					id="sign-up-password"
					name="password"
					type="password"
					autoComplete="new-password"
					required
					minLength={8}
					value={password}
					onChange={event => setPassword(event.target.value)}
					disabled={isSubmitting}
				/>
				<p className="text-xs text-muted-foreground">At least 8 characters.</p>
			</div>
			<Button
				type="submit"
				disabled={isSubmitting}
				aria-busy={isSubmitting}
				className="w-full"
			>
				{isSubmitting ? 'Creating account...' : 'Create account'}
			</Button>
		</form>
	)
}
