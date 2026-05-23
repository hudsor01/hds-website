/**
 * 403 panel for the admin shell (server component).
 *
 * Extracted verbatim from the inline 403 branch in `src/app/admin/layout.tsx`.
 * Plan 03-03 will rewire the layout to render this component instead of the
 * inlined block; until then both versions coexist and stay in visual sync.
 *
 * Takes the signed-in `email` and the user's current `role` (which may be
 * null/undefined for users who have no role assigned yet). When `role` is
 * missing the panel shows the literal string `none` rather than the word
 * `null`.
 */
import Link from 'next/link'

interface ForbiddenProps {
	email: string
	role: string | null | undefined
}

export function Forbidden({ email, role }: ForbiddenProps) {
	return (
		<div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-surface-base p-6">
			<div className="w-full max-w-md rounded-xl border border-border bg-surface-raised p-8 shadow-sm">
				<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
					403
				</p>
				<h1 className="text-2xl font-semibold text-foreground mb-3">
					Not authorized
				</h1>
				<p className="text-sm text-muted-foreground mb-4">
					You are signed in as{' '}
					<span className="font-medium text-foreground">{email}</span> with role{' '}
					<span className="font-medium text-foreground">{role ?? 'none'}</span>.
					This area requires admin access.
				</p>
				<p className="text-sm text-muted-foreground mb-6">
					If you should have admin access, contact the site owner at{' '}
					<a
						href="mailto:hello@hudsondigitalsolutions.com"
						className="font-medium text-accent-text hover:underline"
					>
						hello@hudsondigitalsolutions.com
					</a>
					.
				</p>
				<Link
					href="/auth/sign-in"
					className="inline-block text-sm font-medium text-accent-text hover:underline"
				>
					Back to sign in
				</Link>
			</div>
		</div>
	)
}
