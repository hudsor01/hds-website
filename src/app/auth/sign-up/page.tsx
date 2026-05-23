/**
 * Sign-up page (server component).
 *
 * Renders the Better Auth sign-up form inside the centered auth layout.
 * The first user to sign up is auto-promoted to `role='admin'` by the
 * `databaseHooks.user.create.after` hook in `src/lib/auth/index.ts`; later
 * signups default to `role='user'` and are bounced to the 403 panel by
 * `src/app/admin/layout.tsx` until promoted via SQL.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = {
	title: 'Sign up',
	description:
		'Create an admin account for the Hudson Digital Solutions site. The first signup is automatically granted admin access.'
}

export default function SignUpPage() {
	return (
		<Card variant="default" size="md">
			<div className="space-y-1.5 mb-6">
				<h1 className="text-2xl font-semibold text-foreground">
					Create account
				</h1>
				<p className="text-sm text-muted-foreground">
					The first signup becomes the admin.
				</p>
			</div>
			<SignUpForm />
			<p className="mt-6 text-sm text-muted-foreground text-center">
				Already have an account?{' '}
				<Link
					href="/auth/sign-in"
					className="font-medium text-accent-text hover:underline"
				>
					Sign in.
				</Link>
			</p>
		</Card>
	)
}
