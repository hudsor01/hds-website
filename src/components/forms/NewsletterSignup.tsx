'use client'

import { lazy, Suspense } from 'react'
import { useAppForm } from '@/hooks/form-hook'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError } from '@/components/ui/field'
import { newsletterSchema } from '@/lib/schemas/contact'
import { useNewsletterSubscription } from '@/hooks/use-newsletter-subscription'
import { Check, Mail } from 'lucide-react'

interface NewsletterSignupProps {
  variant?: 'inline' | 'sidebar' | 'modal'
  title?: string
  description?: string
  dynamic?: boolean
}

const variantStyles = {
  inline: 'rounded-lg border border-border bg-card card-padding dark:border-border dark:bg-muted',
  sidebar: 'rounded-lg bg-primary/10 card-padding dark:from-card dark:to-background',
  modal: 'rounded-lg bg-card card-padding-lg shadow-xl dark:bg-muted',
} as const

// Internal implementation
function NewsletterSignupContent({
  variant = 'inline',
  title = 'Get Expert Insights',
  description = 'Join 500+ tech leaders receiving our weekly newsletter on scaling engineering teams.',
}: Omit<NewsletterSignupProps, 'dynamic'>) {
  const mutation = useNewsletterSubscription()

  const form = useAppForm({
    defaultValues: {
      email: '',
    },
    validators: {
      onSubmit: newsletterSchema,
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({
        email: value.email,
        source: variant,
      })
    },
  })

  const isLoading = mutation.isPending
  const isSuccess = mutation.isSuccess
  const isError = mutation.isError
  const errorMessage = mutation.error?.message

  return (
    <div className={variantStyles[variant]}>
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 dark:bg-primary-hover">
            <Mail className="h-5 w-5 text-primary dark:text-accent" />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground dark:text-foreground">
            {title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="mt-4 space-y-3"
          >
            <div className="flex gap-tight">
              <form.Field name="email">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0} className="flex-1 gap-1">
                    <Input
                      id="newsletter-email"
                      name="email"
                      type="email"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="your@email.com"
                      aria-label="Email address"
                      aria-invalid={field.state.meta.errors.length > 0}
                      disabled={isLoading || isSuccess}
                    />
                  </Field>
                )}
              </form.Field>
              <Button
                type="submit"
                disabled={isLoading || isSuccess}
              >
                {isLoading ? (
                  'Subscribing...'
                ) : isSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    Subscribed
                  </>
                ) : (
                  'Subscribe'
                )}
              </Button>
            </div>

            {/* Form-level validation errors */}
            <form.Subscribe selector={(state) => state.errors}>
              {(errors) => errors.length > 0 && (
                <FieldError errors={errors} />
              )}
            </form.Subscribe>

            {/* Field-level validation errors */}
            <form.Field name="email">
              {(field) => field.state.meta.errors.length > 0 && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </form.Field>

            {/* Mutation error */}
            {isError && (
              <FieldError errors={[{ message: errorMessage || 'Something went wrong. Please try again.' }]} />
            )}

            {/* Success message */}
            {isSuccess && (
              <p className="text-sm text-success-dark dark:text-success-text flex items-center gap-2">
                <Check className="h-4 w-4" />
                Thank you! Check your email to confirm your subscription.
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              No spam. Unsubscribe anytime. We respect your privacy.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

// Lazy-loaded version for dynamic imports
const LazyNewsletterSignup = lazy(() =>
  Promise.resolve({ default: NewsletterSignupContent })
)

// Public API with optional dynamic loading
export function NewsletterSignup({ dynamic, ...props }: NewsletterSignupProps) {
  if (dynamic) {
    return (
      <Suspense
        fallback={
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            Loading newsletter form...
          </div>
        }
      >
        <LazyNewsletterSignup {...props} />
      </Suspense>
    )
  }

  return <NewsletterSignupContent {...props} />
}
