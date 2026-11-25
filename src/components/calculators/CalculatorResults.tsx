/**
 * Calculator Results Component
 * Displays calculation results with email capture
 */

'use client'

import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { type ReactNode, useState } from 'react'
import { z } from 'zod'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { trackConversion } from '@/lib/analytics'
import { csrfFetch } from '@/lib/api/csrf-fetch'
import { logger } from '@/lib/logger'

const SEND_ERROR = 'Could not send your results. Please try again.'

const submitErrorSchema = z.object({ error: z.string() })

async function readSubmitError(response: Response): Promise<string> {
	try {
		const parsed = submitErrorSchema.safeParse(await response.json())
		return parsed.success ? parsed.data.error : SEND_ERROR
	} catch {
		return SEND_ERROR
	}
}

interface ResultItem {
	label: string
	value: string | number
	description?: string
	highlight?: boolean
}

interface CalculatorResultsProps {
	results: ResultItem[]
	calculatorType: string
	inputs: Record<string, unknown> | object
	showEmailCapture?: boolean
	onEmailSubmit?: (email: string) => void
	/** Extra detail shown right after the results, before the email capture */
	children?: ReactNode
}

export function CalculatorResults({
	results,
	calculatorType,
	inputs,
	showEmailCapture = true,
	onEmailSubmit,
	children
}: CalculatorResultsProps) {
	const [email, setEmail] = useState('')
	// The results that were emailed. Comparing against the current results
	// resets the confirmation as soon as the numbers change.
	const [submittedKey, setSubmittedKey] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState('')
	const resultsKey = JSON.stringify(results.map(r => [r.label, r.value]))
	const emailSubmitted = submittedKey === resultsKey

	const handleEmailSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)
		setError('')

		try {
			// Store calculator results
			const response = await csrfFetch('/api/calculators/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					calculator_type: calculatorType,
					email,
					inputs,
					results: Object.fromEntries(results.map(r => [r.label, r.value]))
				})
			})

			if (!response.ok) {
				setError(await readSubmitError(response))
				return
			}

			// Track conversion
			trackConversion('calculator_completion', undefined, undefined, {
				calculator_type: calculatorType,
				email
			})

			setSubmittedKey(resultsKey)
			if (onEmailSubmit) {
				onEmailSubmit(email)
			}
		} catch (err) {
			setError(SEND_ERROR)
			logger.error('Calculator submission error', err)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="space-y-comfortable">
			{/* Results Display */}
			{/* The page's action bar already shows a "Results" heading */}
			<div className="space-y-content">
				<div className="space-y-3">
					{results.map((result, index) => (
						<Card
							key={index}
							size="sm"
							className={
								result.highlight ? 'border-accent/40 bg-accent/10' : 'bg-muted'
							}
						>
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium text-muted-foreground">
									{result.label}
								</span>
								<span
									className={`
                    text-2xl font-bold
                    ${result.highlight ? 'text-accent-text' : 'text-foreground'}
                  `}
								>
									{result.value}
								</span>
							</div>

							{result.description && (
								<p className="mt-2 text-sm text-muted-foreground">
									{result.description}
								</p>
							)}
						</Card>
					))}
				</div>
			</div>

			{children}

			{/* Email Capture */}
			{showEmailCapture && !emailSubmitted && (
				<Card
					size="none"
					className="border-2 border-dashed border-accent/60 bg-accent/10 card-padding"
				>
					<h3 className="mb-subheading text-lg font-semibold text-foreground">
						Email me these results
					</h3>
					<p className="mb-heading text-sm text-muted-foreground">
						Get a copy of the numbers above in your inbox.
					</p>

					<form onSubmit={handleEmailSubmit} className="space-y-3">
						<div className="space-y-tight">
							<Input
								type="email"
								value={email}
								onChange={e => setEmail(e.target.value)}
								placeholder="your@email.com"
								aria-label="Email address"
								required
							/>
							{error && (
								<p role="alert" className="text-xs text-destructive-text">
									{error}
								</p>
							)}
						</div>

						<Button type="submit" disabled={isSubmitting} className="w-full">
							{isSubmitting ? 'Sending...' : 'Email me these results'}
						</Button>

						<p className="text-xs text-muted-foreground">
							I&apos;ll also send one follow-up note. No spam. Unsubscribe
							anytime.
						</p>
					</form>
				</Card>
			)}

			{/* Success Message */}
			{emailSubmitted && (
				<Alert className="border-success/50 bg-success/10">
					<CheckCircle2
						className="h-5 w-5 text-success-text"
						aria-hidden="true"
					/>
					<AlertTitle className="text-success-text">
						Thanks, your results are on the way
					</AlertTitle>
					<AlertDescription className="text-success-text">
						They should reach your inbox in a few minutes.
					</AlertDescription>
				</Alert>
			)}

			{/* CTA */}
			<Card className="text-center">
				<h3 className="mb-subheading text-lg font-semibold text-foreground">
					Want to talk through your results?
				</h3>
				<p className="mb-heading text-sm text-muted-foreground">
					Book a free 30-minute website plan call. I&apos;ll go over these
					numbers with you, then give you a timeline and a real price.
				</p>
				<Button asChild>
					<Link href="/contact">Book a Free Website Plan Call</Link>
				</Button>
			</Card>
		</div>
	)
}
