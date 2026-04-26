import { Section, Text } from 'react-email'
import { BrandFooter } from './_components/brand-footer'
import { BrandHeading } from './_components/brand-heading'
import { BrandLayout } from './_components/brand-layout'

interface NewsletterWelcomeProps {
	email: string
}

const BODY_TEXT_STYLE = {
	fontSize: '14px',
	lineHeight: 1.6,
	margin: '0 0 16px 0'
}

const LIST_STYLE = {
	paddingLeft: '20px',
	margin: '0 0 16px 0',
	fontSize: '14px',
	lineHeight: 1.6
}

export function NewsletterWelcome({ email }: NewsletterWelcomeProps) {
	const unsubscribeUrl = `https://hudsondigitalsolutions.com/unsubscribe?email=${encodeURIComponent(email)}`

	return (
		<BrandLayout preview="Welcome to Hudson Digital Solutions">
			<BrandHeading level={1}>Welcome to Our Newsletter!</BrandHeading>

			<Text style={BODY_TEXT_STYLE}>
				Thank you for subscribing to Hudson Digital Solutions newsletter.
			</Text>

			<Text style={BODY_TEXT_STYLE}>
				You&apos;ll receive weekly insights on:
			</Text>

			<Section>
				<ul style={LIST_STYLE}>
					<li>Growing your business online</li>
					<li>Website and marketing best practices</li>
					<li>Business automation and efficiency tips</li>
					<li>Industry trends and case studies</li>
				</ul>
			</Section>

			<Text style={BODY_TEXT_STYLE}>Stay tuned for our next edition!</Text>

			<BrandFooter unsubscribeUrl={unsubscribeUrl} />
		</BrandLayout>
	)
}
