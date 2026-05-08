/**
 * Layout-scoped Geist_Mono font load. The global layout dropped the
 * monospace font (it was loaded for ~10 chars of UI elsewhere); this is
 * the one route where monospace is part of the product (formatted JSON
 * preview), so the font is loaded only here.
 */

import { Geist_Mono } from 'next/font/google'

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
	display: 'swap',
	preload: true,
	adjustFontFallback: true
})

export default function JsonFormatterLayout({
	children
}: {
	children: React.ReactNode
}) {
	return <div className={geistMono.variable}>{children}</div>
}
