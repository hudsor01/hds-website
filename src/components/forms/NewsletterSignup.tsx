'use client'

import { Check, Mail } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAppForm } from '@/hooks/form-hook'
import { useNewsletterSubscription } from '@/hooks/use-newsletter-subscription'
import { newsletterSchema } from '@/lib/schemas/contact'

interface NewsletterSignupProps {
	variant?: 'inline' | 'sidebar' | 'modal' | 'section' | 'compact'
	title?: string
	description?: string
	dynamic?: boolean
}

const variantConfig = {
	inline: { size: 'md' as const, className: '' },
	sidebar: {
		size: 'md' as const,
		className: 'bg-surface-raised'
	},
	modal: { size: 'lg' as const, className: 'shadow-xl' },
	section: { size: 'md' as const, className: '' },
	compact: { size: 'md' as const, className: '' }
} as const

// Internal implementation
function NewsletterSignupContent({
	variant = 'inline',
	title = 'Get Expert Insights',
	description = 'Join 500+ business owners receiving our weekly newsletter on growing your business online.'
}: Omit<NewsletterSignupProps, 'dynamic'>) {
	const mutation = useNewsletterSubscription()

	const form = useAppForm({
		defaultValues: {
			email: ''
		},
		validators: {
			onSubmit: newsletterSchema
		},
		onSubmit: async ({ value }) => {
			// Guard against empty email (should be caught by validation, but double-check)
			if (!value.email || value.email.trim() === '') {
				return
			}

			await mutation.mutateAsync({
				email: value.email,
				source: variant
			})
		}
	})

	const isLoading = mutation.isPending
	const isSuccess = mutation.isSuccess
	const isError = mutation.isError
	const errorMessage = mutation.error?.message

	if (variant === 'compact') {
		return (
			<div className="text-center">
				<p className="text-sm text-muted-foreground mb-3">
					Not ready yet? Get weekly insights instead.
				</p>

				<form
					onSubmit={e => {
						e.preventDefault()
						e.stopPropagation()
						form.handleSubmit()
					}}
				>
					<div className="flex max-w-md mx-auto gap-2">
						<form.Field name="email">
							{field => (
								<Field
									data-invalid={field.state.meta.errors.length > 0}
									className="flex-1"
								>
									<Input
										id="newsletter-email-compact"
										name="email"
										type="email"
										value={field.state.value}
										onChange={e => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										placeholder="your@email.com"
										aria-label="Email address"
										aria-invalid={field.state.meta.errors.length > 0}
										disabled={isLoading || isSuccess}
									/>
								</Field>
							)}
						</form.Field>
						<Button type="submit" disabled={isLoading || isSuccess}>
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

					<form.Subscribe selector={state => state.errors}>
						{errors =>
							errors.length > 0 && (
								<FieldError errors={errors} className="mt-2 text-center" />
							)
						}
					</form.Subscribe>

					<form.Field name="email">
						{field =>
							field.state.meta.errors.length > 0 && (
								<FieldError
									errors={field.state.meta.errors}
									className="mt-2 text-center"
								/>
							)
						}
					</form.Field>

					{isError && (
						<div aria-live="assertive" role="alert" className="mt-2">
							<FieldError
								errors={[
									{
										message:
											errorMessage || 'Something went wrong. Please try again.'
									}
								]}
							/>
						</div>
					)}

					{isSuccess && (
						<p
							className="mt-3 text-sm text-success-text flex items-center justify-center gap-2"
							aria-live="polite"
							role="status"
						>
							<Check className="h-4 w-4" />
							You&apos;re subscribed! Check your inbox for a welcome email.
						</p>
					)}

					<p className="mt-3 text-xs text-muted-foreground">
						No spam. Unsubscribe anytime. We respect your privacy.
					</p>
				</form>
			</div>
		)
	}

	if (variant === 'section') {
		return (
			<div className="text-center">
				<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
					Stay in the loop
				</p>
				<h2 className="text-section-title text-foreground mb-3 text-balance">
					{title}
				</h2>
				<p className="text-muted-foreground mb-6 max-w-xl mx-auto leading-relaxed">
					{description}
				</p>

				<form
					onSubmit={e => {
						e.preventDefault()
						e.stopPropagation()
						form.handleSubmit()
					}}
				>
					<div className="flex max-w-md mx-auto gap-2">
						<form.Field name="email">
							{field => (
								<Field
									data-invalid={field.state.meta.errors.length > 0}
									className="flex-1"
								>
									<Input
										id="newsletter-email-section"
										name="email"
										type="email"
										value={field.state.value}
										onChange={e => field.handleChange(e.target.value)}
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
							variant="accent"
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

					<form.Subscribe selector={state => state.errors}>
						{errors =>
							errors.length > 0 && (
								<FieldError errors={errors} className="mt-2 text-center" />
							)
						}
					</form.Subscribe>

					<form.Field name="email">
						{field =>
							field.state.meta.errors.length > 0 && (
								<FieldError
									errors={field.state.meta.errors}
									className="mt-2 text-center"
								/>
							)
						}
					</form.Field>

					{isError && (
						<div aria-live="assertive" role="alert" className="mt-2">
							<FieldError
								errors={[
									{
										message:
											errorMessage || 'Something went wrong. Please try again.'
									}
								]}
							/>
						</div>
					)}

					{isSuccess && (
						<p
							className="mt-3 text-sm text-success-text flex items-center justify-center gap-2"
							aria-live="polite"
							role="status"
						>
							<Check className="h-4 w-4" />
							You&apos;re subscribed! Check your inbox for a welcome email.
						</p>
					)}

					<p className="mt-3 text-xs text-muted-foreground">
						No spam. Unsubscribe anytime. We respect your privacy.
					</p>
				</form>
			</div>
		)
	}

	return (
		<Card
			size={variantConfig[variant].size}
			className={variantConfig[variant].className}
		>
			<div className="flex items-start gap-3">
				<div className="shrink-0">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
						<Mail className="h-5 w-5 text-accent" />
					</div>
				</div>

				<div className="flex-1">
					<h3 className="text-lg font-semibold text-foreground">{title}</h3>
					<p className="mt-1 text-sm text-muted-foreground">{description}</p>

					<form
						onSubmit={e => {
							e.preventDefault()
							e.stopPropagation()
							form.handleSubmit()
						}}
						className="mt-4 space-y-3"
					>
						<div className="flex gap-tight">
							<form.Field name="email">
								{field => (
									<Field
										data-invalid={field.state.meta.errors.length > 0}
										className="flex-1 gap-1"
									>
										<Input
											id="newsletter-email"
											name="email"
											type="email"
											value={field.state.value}
											onChange={e => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											placeholder="your@email.com"
											aria-label="Email address"
											aria-invalid={field.state.meta.errors.length > 0}
											disabled={isLoading || isSuccess}
										/>
									</Field>
								)}
							</form.Field>
							<Button type="submit" disabled={isLoading || isSuccess}>
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
						<form.Subscribe selector={state => state.errors}>
							{errors => errors.length > 0 && <FieldError errors={errors} />}
						</form.Subscribe>

						{/* Field-level validation errors */}
						<form.Field name="email">
							{field =>
								field.state.meta.errors.length > 0 && (
									<FieldError errors={field.state.meta.errors} />
								)
							}
						</form.Field>

						{/* Mutation error */}
						{isError && (
							<div aria-live="assertive" role="alert">
								<FieldError
									errors={[
										{
											message:
												errorMessage ||
												'Something went wrong. Please try again.'
										}
									]}
								/>
							</div>
						)}

						{/* Success message */}
						{isSuccess && (
							<p
								className="text-sm text-success-text flex items-center gap-2"
								aria-live="polite"
								role="status"
							>
								<Check className="h-4 w-4" />
								You&apos;re subscribed! Check your inbox for a welcome email.
							</p>
						)}

						<p className="text-xs text-muted-foreground">
							No spam. Unsubscribe anytime. We respect your privacy.
						</p>
					</form>
				</div>
			</div>
		</Card>
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
