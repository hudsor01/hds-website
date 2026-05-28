import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata, Viewport } from 'next'
import { Hanken_Grotesk, JetBrains_Mono, Roboto_Serif } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from 'sonner'
import { Analytics } from '@/components/utilities/Analytics'
import { ErrorBoundary } from '@/components/utilities/ErrorBoundary'
import { JsonLd } from '@/components/utilities/JsonLd'
import { WebVitalsReporting } from '@/components/utilities/WebVitalsReporting'
import { env } from '@/env'
import { BRAND } from '@/lib/_generated/brand'
import {
	generateOrganizationSchema,
	generateWebsiteSchema
} from '@/lib/seo-utils'
import ClientProviders from '@/providers/ClientProviders'
import './globals.css'

const hankenGrotesk = Hanken_Grotesk({
	variable: '--font-hanken-grotesk',
	subsets: ['latin'],
	display: 'swap',
	preload: true,
	adjustFontFallback: true
})

const robotoSerif = Roboto_Serif({
	variable: '--font-roboto-serif',
	subsets: ['latin'],
	display: 'swap',
	preload: true,
	adjustFontFallback: true
})

const jetbrainsMono = JetBrains_Mono({
	variable: '--font-jetbrains-mono',
	subsets: ['latin'],
	display: 'swap',
	preload: false,
	adjustFontFallback: true
})

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	userScalable: true,
	viewportFit: 'cover'
}

export const metadata: Metadata = {
	title: 'Dallas-Fort Worth Web Design | Hudson Digital',
	description:
		'Professional website design and development for small businesses. Fast, mobile-ready websites built to turn visitors into customers.',
	metadataBase: new URL('https://hudsondigitalsolutions.com'),
	openGraph: {
		title: 'Dallas-Fort Worth Web Design | Hudson Digital',
		description:
			'Professional website design and development for small businesses. Fast, mobile-ready websites built to turn visitors into customers.',
		url: 'https://hudsondigitalsolutions.com',
		siteName: 'Hudson Digital Solutions',
		locale: 'en_US',
		type: 'website'
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Dallas-Fort Worth Web Design | Hudson Digital',
		description:
			'Professional website design and development for small businesses. Fast, mobile-ready websites built to turn visitors into customers.'
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1
		}
	},
	verification: {
		google: env.GOOGLE_SITE_VERIFICATION
	},
	alternates: {
		canonical: 'https://hudsondigitalsolutions.com',
		languages: {
			'en-US': 'https://hudsondigitalsolutions.com'
		}
	},
	applicationName: 'Hudson Digital Solutions',
	authors: [
		{
			name: 'Hudson Digital Solutions',
			url: 'https://hudsondigitalsolutions.com'
		}
	],
	generator: 'Next.js',
	referrer: 'origin-when-cross-origin',
	creator: 'Hudson Digital Solutions',
	publisher: 'Hudson Digital Solutions',
	formatDetection: {
		email: false,
		address: false,
		telephone: false
	}
}

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
			<head>
				{/* Critical mobile-first meta tags */}
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta
					name="apple-mobile-web-app-status-bar-style"
					content="black-translucent"
				/>
				<meta
					name="apple-mobile-web-app-title"
					content="Hudson Digital Solutions"
				/>

				{/*
					next/font self-hosts every typeface at build time, so the
					Google Fonts CDN is never contacted at runtime — the previous
					preconnect hints to fonts.googleapis.com / fonts.gstatic.com
					were no-ops. Replaced with dns-prefetch for the two Vercel
					beacons that Speed Insights + Analytics POST to during page
					load (~50ms saved on first beacon).
				*/}
				<link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />
				<link rel="dns-prefetch" href="https://va.vercel-scripts.com" />

				{/* Favicon fallbacks. /icon and /apple-icon are auto-emitted by
				    src/app/icon.tsx and src/app/apple-icon.tsx (Next.js conventions)
				    so they don't need to be declared here. */}
				<link
					rel="icon"
					href="/favicon-16x16.png"
					sizes="16x16"
					type="image/png"
				/>
				<link
					rel="icon"
					href="/favicon-32x32.png"
					sizes="32x32"
					type="image/png"
				/>

				{/* Manifest for PWA */}
				<link rel="manifest" href="/manifest.json" />

				{/* Theme color for mobile browsers — sourced from BRAND.primary
				    (mechanically derived from --color-primary in globals.css). */}
				<meta name="theme-color" content={BRAND.primary} />
				<meta name="msapplication-TileColor" content={BRAND.primary} />
				<meta name="msapplication-TileImage" content="/HDS-Logo.webp" />

				{/* Mobile-specific optimizations (format-detection in Metadata API) */}
				<meta name="HandheldFriendly" content="true" />
				<meta name="MobileOptimized" content="320" />
			</head>
			<body
				className={`${hankenGrotesk.variable} ${robotoSerif.variable} ${jetbrainsMono.variable} antialiased`}
				suppressHydrationWarning
			>
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:rounded focus:shadow-lg"
				>
					Skip to main content
				</a>
				<JsonLd data={generateWebsiteSchema()} />
				<JsonLd data={generateOrganizationSchema()} />
				<NuqsAdapter>
					<ClientProviders>
						<ErrorBoundary>
							{/* Marketing chrome (NavbarLight + Footer + ScrollToTop)
							    and the <main id="main-content"> landmark now live in
							    the route-group layouts under (public), (admin), and
							    (auth) instead of here. This root layout is the
							    thinnest possible shell — every page passes through
							    it, but only the universal mount points (Toaster,
							    Analytics, SpeedInsights, WebVitalsReporting, the
							    JsonLd / providers / ErrorBoundary wrap) belong at
							    this level. Each route group owns its own chrome and
							    its own <main> landmark; the skip-link target still
							    resolves via #main-content because every group's
							    layout emits a <main id="main-content">. */}
							{children}
							<Analytics />
							<SpeedInsights />
							<WebVitalsReporting />
						</ErrorBoundary>
						<Toaster position="top-right" richColors theme="dark" />
					</ClientProviders>
				</NuqsAdapter>
			</body>
		</html>
	)
}
