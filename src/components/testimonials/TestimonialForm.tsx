/**
 * Testimonial Form Component
 * Rendered only on the private, token-gated submit page. The token is
 * required: the server rejects any submit without a valid, unused link.
 */

'use client'

import { Send, Star } from 'lucide-react'
import { useState } from 'react'
import { FormSuccessMessage } from '@/components/forms/FormSuccessMessage'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { trackEvent } from '@/lib/analytics'
import { csrfFetch } from '@/lib/api/csrf-fetch'
import {
	TESTIMONIAL_MAX_LENGTH,
	TESTIMONIAL_MIN_LENGTH
} from '@/lib/schemas/query-params'

interface TestimonialFormProps {
	token: string
	defaultName?: string
}

interface FormState {
	client_name: string
	company: string
	role: string
	content: string
	video_url: string
}

const STARS = [1, 2, 3, 4, 5] as const

const RATING_LABELS: Record<number, string> = {
	1: 'Poor',
	2: 'Fair',
	3: 'Good',
	4: 'Great',
	5: 'Excellent'
}

const INPUT_CLS =
	'w-full rounded-md border border-border bg-background px-4 py-2.5 text-foreground'

function starLabel(star: number): string {
	return star === 1 ? 'Rate 1 star' : `Rate ${star} stars`
}

function isHttpUrl(value: string): boolean {
	try {
		const url = new URL(value)
		return url.protocol === 'http:' || url.protocol === 'https:'
	} catch {
		return false
	}
}

export function TestimonialForm({ token, defaultName }: TestimonialFormProps) {
	const [formData, setFormData] = useState<FormState>({
		client_name: defaultName ?? '',
		company: '',
		role: '',
		content: '',
		video_url: ''
	})
	// No default: a review must carry the rating the client actually chose.
	const [rating, setRating] = useState<number | null>(null)
	const [hoveredRating, setHoveredRating] = useState<number | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isSubmitted, setIsSubmitted] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const contentLength = formData.content.trim().length

	const handleChange = (field: keyof FormState, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }))
	}

	const validate = (): string | null => {
		if (rating === null) {
			return 'Please choose a star rating'
		}
		if (formData.client_name.trim().length < 2) {
			return 'Please enter your name'
		}
		if (contentLength < TESTIMONIAL_MIN_LENGTH) {
			return `Please write a testimonial of at least ${TESTIMONIAL_MIN_LENGTH} characters`
		}
		if (contentLength > TESTIMONIAL_MAX_LENGTH) {
			return `Please keep your testimonial under ${TESTIMONIAL_MAX_LENGTH} characters`
		}
		const videoUrl = formData.video_url.trim()
		if (videoUrl && !isHttpUrl(videoUrl)) {
			return 'Video links must start with http:// or https://'
		}
		return null
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		const validationError = validate()
		if (validationError) {
			setError(validationError)
			return
		}

		setIsSubmitting(true)
		try {
			const response = await csrfFetch('/api/testimonials/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					token,
					rating,
					client_name: formData.client_name.trim(),
					company: formData.company.trim(),
					role: formData.role.trim(),
					content: formData.content.trim(),
					video_url: formData.video_url.trim()
				})
			})

			if (!response.ok) {
				const data: { error?: string } = await response.json().catch(() => ({}))
				throw new Error(data.error ?? 'Failed to submit testimonial')
			}

			setIsSubmitted(true)
			trackEvent('testimonial_submitted', {
				rating: rating ?? 0,
				is_private_link: true
			})
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: 'Something went wrong. Please try again.'
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	if (isSubmitted) {
		return (
			<div className="py-12">
				<FormSuccessMessage
					title="Thank You!"
					message="Your testimonial is in. I read every review before it goes live, and I appreciate you taking the time."
				/>
			</div>
		)
	}

	const shownRating = hoveredRating ?? rating ?? 0

	return (
		<form onSubmit={handleSubmit} noValidate className="space-y-comfortable">
			<fieldset>
				<legend className="block text-sm font-medium text-foreground mb-3">
					How would you rate your experience?{' '}
					<span className="text-destructive" aria-hidden="true">
						*
					</span>
					<span className="sr-only">(required)</span>
				</legend>
				<div className="flex gap-1">
					{STARS.map(star => (
						<Button
							key={star}
							type="button"
							onClick={() => setRating(star)}
							onMouseEnter={() => setHoveredRating(star)}
							onMouseLeave={() => setHoveredRating(null)}
							variant="ghost"
							size="icon"
							className="hover:scale-110"
							aria-label={starLabel(star)}
							aria-pressed={rating === star}
						>
							<Star
								aria-hidden="true"
								className={`w-8 h-8 ${
									star <= shownRating
										? 'fill-yellow-400 text-warning-text'
										: 'text-muted-foreground'
								}`}
							/>
						</Button>
					))}
				</div>
				<p className="text-sm text-muted-foreground mt-1" aria-live="polite">
					{rating === null
						? 'Choose 1 to 5 stars'
						: `${rating} of 5: ${RATING_LABELS[rating]}`}
				</p>
			</fieldset>

			<div>
				<label
					htmlFor="client_name"
					className="block text-sm font-medium text-foreground mb-1"
				>
					Your Name <span className="text-destructive">*</span>
				</label>
				<input
					id="client_name"
					type="text"
					value={formData.client_name}
					onChange={e => handleChange('client_name', e.target.value)}
					className={INPUT_CLS}
					placeholder="Jane Smith"
					autoComplete="name"
					maxLength={100}
					required
				/>
			</div>

			<div className="grid gap-content sm:grid-cols-2">
				<div>
					<label
						htmlFor="company"
						className="block text-sm font-medium text-foreground mb-1"
					>
						Company (Optional)
					</label>
					<input
						id="company"
						type="text"
						value={formData.company}
						onChange={e => handleChange('company', e.target.value)}
						className={INPUT_CLS}
						placeholder="Acme Plumbing"
						autoComplete="organization"
						maxLength={100}
					/>
				</div>
				<div>
					<label
						htmlFor="role"
						className="block text-sm font-medium text-foreground mb-1"
					>
						Your Role (Optional)
					</label>
					<input
						id="role"
						type="text"
						value={formData.role}
						onChange={e => handleChange('role', e.target.value)}
						className={INPUT_CLS}
						placeholder="Owner"
						autoComplete="organization-title"
						maxLength={100}
					/>
				</div>
			</div>

			<div>
				<label
					htmlFor="content"
					className="block text-sm font-medium text-foreground mb-1"
				>
					Your Testimonial <span className="text-destructive">*</span>
				</label>
				<textarea
					id="content"
					value={formData.content}
					onChange={e => handleChange('content', e.target.value)}
					rows={5}
					className="w-full rounded-md border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground"
					placeholder="Tell me about your experience working with Hudson Digital Solutions..."
					aria-describedby="content-count"
					required
				/>
				<p id="content-count" className="text-xs text-muted-foreground mt-1">
					{contentLength} characters (minimum {TESTIMONIAL_MIN_LENGTH}, maximum{' '}
					{TESTIMONIAL_MAX_LENGTH})
				</p>
			</div>

			<div>
				<label
					htmlFor="video_url"
					className="block text-sm font-medium text-foreground mb-1"
				>
					Video Testimonial URL (Optional)
				</label>
				<input
					id="video_url"
					type="url"
					inputMode="url"
					value={formData.video_url}
					onChange={e => handleChange('video_url', e.target.value)}
					className={INPUT_CLS}
					placeholder="https://youtube.com/watch?v=... or https://loom.com/..."
					aria-describedby="video_url-help"
				/>
				<p id="video_url-help" className="text-xs text-muted-foreground mt-1">
					A YouTube, Loom or other video link starting with https://
				</p>
			</div>

			{error && (
				<Card
					size="sm"
					role="alert"
					className="bg-destructive-light text-destructive-text text-sm"
				>
					{error}
				</Card>
			)}

			<Button
				type="submit"
				disabled={isSubmitting}
				variant="default"
				className="w-full"
			>
				{isSubmitting ? (
					'Submitting...'
				) : (
					<>
						<Send className="w-5 h-5" aria-hidden="true" />
						Submit Testimonial
					</>
				)}
			</Button>
		</form>
	)
}
