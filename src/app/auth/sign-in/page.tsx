/**
 * Sign-in page (server component).
 *
 * Renders the Better Auth sign-in form inside the centered auth layout.
 * The form itself is a client component that calls `authClient.signIn.email`
 * and navigates to `/admin` on success.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { SignInForm } from '@/components/auth/SignInForm'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = {
	title: 'Sign in',
	description: 'Sign in to your Hudson Digital Solutions account.',
	robots: { index: false, follow: false }
}

export default function SignInPage() {
	return (
		<Card variant="default" size="md">
			<div className="space-y-1.5 mb-6">
				<h1 className="text-2xl font-semibold text-foreground">Sign in</h1>
				<p className="text-sm text-muted-foreground">
					Use your admin credentials.
				</p>
			</div>
			<SignInForm />
			<p className="mt-6 text-sm text-muted-foreground text-center">
				Need an account?{' '}
				<Link
					href="/auth/sign-up"
					className="font-medium text-accent-text hover:underline"
				>
					Sign up.
				</Link>
			</p>
		</Card>
	)
}
