import type { Metadata } from 'next'
import type { ReactNode } from 'react'


import { cn } from '@/lib/utils'
import { Header } from '@/components/layouts/header'
import { Footer } from '@/components/layouts/footer'
import { ErrorBoundary } from '@/components/layouts/error-boundary'
import { TRPCProvider } from '@/lib/trpc/provider'
import { Toaster } from '@/components/ui/toaster'
import { GradientBackground } from '@/components/animated/gradient-background'
import { CacheProvider } from '@/components/providers/cache-provider'
import { ErrorProvider } from '@/components/providers/error-provider'
import { CookieConsentBanner } from '@/components/gdpr/cookie-consent-banner'
import { CalProviderWrapper } from '@/components/providers/cal-provider'
import { 
  inter, 
  fontVariables,
  fontPerformanceConfig, 
} from '@/lib/fonts/font-config'
import { generateSiteMetadata } from '@/lib/metadata/metadata-utils'

import './globals.css'

export const metadata: Metadata = generateSiteMetadata()

interface RootLayoutProps {
  children: ReactNode
}

// Root Layout - Server Component by default in Next.js 15
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Font preconnect for better performance */}
        {fontPerformanceConfig.preconnect.map((href) => (
          <link key={href} rel="preconnect" href={href} crossOrigin="anonymous" />
        ))}
        
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/_next/static/media/inter-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* Plausible Analytics - Load early for better tracking */}
        {process.env.NODE_ENV === 'production' && (
          <script
            defer
            data-domain="hudsondigitalsolutions.com"
            src="https://plausible.io/js/script.js"
          />
        )}
      </head>
      <body
        className={cn(
          'min-h-screen bg-background text-foreground antialiased flex flex-col fade-in',
          'font-sans', // Use Tailwind font family class
          inter.className,
        )}
      >
        {/* Provider wrapper - Only what needs client state */}
        <ErrorProvider>
          <TRPCProvider>
            <CalProviderWrapper>
              <ErrorBoundary>
                {/* Cache management */}
                <CacheProvider />
              
              {/* Background effects */}
              <GradientBackground />
              
              {/* Main content structure */}
              <div className="relative z-10 flex min-h-screen flex-col">
                {/* Navigation */}
                <Header />
                
                {/* Main content area with proper spacing */}
                <main className="flex-1 pt-16 logical-padding">
                  {children}
                </main>
                
                {/* Footer */}
                <Footer />
                
                {/* Toast notifications */}
                <Toaster />
                
                {/* Cookie consent banner */}
                <CookieConsentBanner />
              </div>
              
              </ErrorBoundary>
            </CalProviderWrapper>
          </TRPCProvider>
      </ErrorProvider>
      </body>
    </html>
  )
}