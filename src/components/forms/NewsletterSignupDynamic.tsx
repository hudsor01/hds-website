'use client'

import dynamic from 'next/dynamic'

/**
 * Dynamic wrapper for NewsletterSignup to enable client-side only rendering.
 * This wrapper exists because `ssr: false` cannot be used in Server Components.
 * Import this component instead of NewsletterSignup when you need client-only rendering.
 */
export const NewsletterSignupDynamic = dynamic(
  () => import('@/components/forms/NewsletterSignup').then(mod => mod.NewsletterSignup),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        Loading newsletter form...
      </div>
    )
  }
)
