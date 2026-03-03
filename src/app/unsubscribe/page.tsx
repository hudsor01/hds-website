import type { Metadata } from 'next'
import { UnsubscribeForm } from './UnsubscribeForm'

export const metadata: Metadata = {
	title: 'Unsubscribe | Hudson Digital Solutions',
	description:
		'Unsubscribe from Hudson Digital Solutions email communications.',
	robots: { index: false, follow: false }
}

interface UnsubscribePageProps {
	searchParams: Promise<{ email?: string }>
}

export default async function UnsubscribePage({
	searchParams
}: UnsubscribePageProps) {
	const { email = '' } = await searchParams
	const decodedEmail = decodeURIComponent(email)

	return (
		<main className="min-h-screen bg-background flex items-center justify-center px-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-h3 text-foreground mb-3">Unsubscribe</h1>
					<p className="text-sm text-muted-foreground leading-relaxed">
						Enter your email address below to unsubscribe from Hudson Digital
						Solutions email communications.
					</p>
				</div>

				<UnsubscribeForm email={decodedEmail} />
			</div>
		</main>
	)
}
