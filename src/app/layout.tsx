import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from 'sonner'
import Footer from '@/components/layout/Footer'
import NavbarLight from '@/components/layout/Navbar'
import { Analytics } from '@/components/utilities/Analytics'
import { ErrorBoundary } from '@/components/utilities/ErrorBoundary'
import { JsonLd } from '@/components/utilities/JsonLd'
import ScrollToTop from '@/components/utilities/ScrollToTop'
import { WebVitalsReporting } from '@/components/utilities/WebVitalsReporting'
import { env } from '@/env'
import { BRAND } from '@/lib/_generated/brand'
import {
	generateLocalBusinessSchema,
	generateOrganizationSchema,
	generateWebsiteSchema
} from '@/lib/seo-utils'
import ClientProviders from '@/providers/ClientProviders'
import './globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
	display: 'swap',
	preload: true,
	adjustFontFallback: true
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
	display: 'swap',
	preload: true,
	adjustFontFallback: true
})

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 5,
	userScalable: true,
	viewportFit: 'cover'
}

export const metadata: Metadata = {
	title:
		'Hudson Digital Solutions - Websites & Automation for Small Businesses',
	description:
		'Professional website development, tool integrations, and business automation for small businesses. Get online, connect your tools, and run your business more efficiently.',
	keywords:
		'small business website, website development, business automation, web design, tool integrations, e-commerce website, local business website, Texas web developer, professional website',
	metadataBase: new URL('https://hudsondigitalsolutions.com'),
	openGraph: {
		title:
			'Hudson Digital Solutions - Websites & Automation for Small Businesses',
		description:
			'Professional website development and business automation for small businesses. Get online and connect your tools.',
		url: 'https://hudsondigitalsolutions.com',
		siteName: 'Hudson Digital Solutions',
		images: [
			{
				url: '/HDS-Logo.webp',
				width: 1200,
				height: 630,
				alt: 'Hudson Digital Solutions'
			}
		],
		locale: 'en_US',
		type: 'website'
	},
	twitter: {
		card: 'summary_large_image',
		title:
			'Hudson Digital Solutions - Websites & Automation for Small Businesses',
		description:
			'Professional website development and business automation for small businesses. Get online and connect your tools.',
		images: ['/HDS-Logo.webp']
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
		<html lang="en" className="scroll-smooth">
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

				{/* Preconnect to external domains for faster loading */}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin=""
				/>

				{/* Favicon and app icons */}
				<link rel="icon" href="/favicon.ico" sizes="any" />
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
				<link rel="apple-touch-icon" href="/HDS-Logo.webp" />
				<link rel="apple-touch-icon" sizes="180x180" href="/HDS-Logo.webp" />

				{/* Splash screens for iOS */}
				<link rel="apple-touch-startup-image" href="/HDS-Logo.webp" />

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
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
				<JsonLd data={generateLocalBusinessSchema()} />
				<NuqsAdapter>
					<ClientProviders>
						<ErrorBoundary>
							<NavbarLight />
							<div id="main-content" className="min-h-screen pt-14">
								{children}
							</div>
							<Footer />
							<ScrollToTop />
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
