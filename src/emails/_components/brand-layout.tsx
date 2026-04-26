/**
 * Shared HTML wrapper for every transactional email.
 * Brand colors source from BRAND (mechanically derived from globals.css).
 */
import type { ReactNode } from 'react'
import { Body, Container, Head, Html, Preview } from 'react-email'

interface BrandLayoutProps {
	preview: string
	children: ReactNode
}

export function BrandLayout({ preview, children }: BrandLayoutProps) {
	return (
		<Html lang="en">
			<Head />
			<Preview>{preview}</Preview>
			<Body
				style={{
					backgroundColor: '#ffffff',
					fontFamily:
						'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
					margin: 0,
					padding: 0
				}}
			>
				<Container
					style={{
						maxWidth: '600px',
						margin: '0 auto',
						padding: '24px'
					}}
				>
					{children}
				</Container>
			</Body>
		</Html>
	)
}
