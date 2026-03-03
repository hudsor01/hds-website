/**
 * Testimonial Collector Dashboard
 * Manage testimonials and generate private collection links
 */

'use client'

import {
	Check,
	CheckCircle2,
	Clock,
	Copy,
	ExternalLink,
	MessageSquare,
	Plus,
	Star,
	Trash2,
	XCircle
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { CalculatorInput } from '@/components/calculators/CalculatorInput'
import { CalculatorLayout } from '@/components/calculators/CalculatorLayout'
import { Card } from '@/components/ui/card'
import { trackEvent } from '@/lib/analytics'
import { TIMEOUTS } from '@/lib/constants/timeouts'
import { logger } from '@/lib/logger'
import type { Testimonial, TestimonialRequest } from '@/lib/testimonials'

interface Tab {
	id: 'testimonials' | 'requests' | 'create'
	label: string
}

const TABS: Tab[] = [
	{ id: 'testimonials', label: 'Testimonials' },
	{ id: 'requests', label: 'Collection Links' },
	{ id: 'create', label: 'Create Link' }
]

const SESSION_STORAGE_KEY = 'admin_token'

export default function TestimonialCollectorClient() {
	const [adminToken, setAdminToken] = useState<string>('')
	const [tokenInput, setTokenInput] = useState<string>('')
	const [activeTab, setActiveTab] = useState<Tab['id']>('testimonials')
	const [testimonials, setTestimonials] = useState<Testimonial[]>([])
	const [requests, setRequests] = useState<TestimonialRequest[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// Load token from sessionStorage on mount
	useEffect(() => {
		const stored = sessionStorage.getItem(SESSION_STORAGE_KEY)
		if (stored) {
			setAdminToken(stored)
		}
	}, [])

	const handleSetToken = () => {
		const trimmed = tokenInput.trim()
		if (!trimmed) {
			return
		}
		sessionStorage.setItem(SESSION_STORAGE_KEY, trimmed)
		setAdminToken(trimmed)
		setTokenInput('')
	}

	const clearToken = useCallback(() => {
		sessionStorage.removeItem(SESSION_STORAGE_KEY)
		setAdminToken('')
	}, [])

	// Create link form state
	const [newRequest, setNewRequest] = useState({
		clientName: '',
		clientEmail: '',
		projectName: ''
	})
	const [createdLink, setCreatedLink] = useState<string | null>(null)
	const [copiedLink, setCopiedLink] = useState(false)
	const [isCreating, setIsCreating] = useState(false)

	const authHeaders = useCallback(
		(): HeadersInit => ({
			Authorization: `Bearer ${adminToken}`
		}),
		[adminToken]
	)

	const fetchData = useCallback(async () => {
		if (!adminToken) {
			setIsLoading(false)
			return
		}
		setIsLoading(true)
		setError(null)

		try {
			const [testimonialsRes, requestsRes] = await Promise.all([
				fetch('/api/testimonials?all=true', { headers: authHeaders() }),
				fetch('/api/testimonials/requests', { headers: authHeaders() })
			])

			if (testimonialsRes.status === 401 || requestsRes.status === 401) {
				clearToken()
				return
			}

			if (testimonialsRes.ok) {
				const data = await testimonialsRes.json()
				setTestimonials(data.testimonials || [])
			}

			if (requestsRes.ok) {
				const data = await requestsRes.json()
				setRequests(data.requests || [])
			}
		} catch (error) {
			logger.warn('Failed to load testimonials data', {
				error: error instanceof Error ? error.message : String(error)
			})
			setError('Failed to load data')
		} finally {
			setIsLoading(false)
		}
	}, [adminToken, authHeaders, clearToken])

	useEffect(() => {
		if (adminToken) {
			fetchData()
		}
	}, [fetchData, adminToken])

	const handleCreateLink = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsCreating(true)
		setError(null)

		try {
			const response = await fetch('/api/testimonials/requests', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', ...authHeaders() },
				body: JSON.stringify(newRequest)
			})

			if (response.status === 401) {
				clearToken()
				return
			}

			if (!response.ok) {
				throw new Error('Failed to create link')
			}

			const data = await response.json()
			const link = `${window.location.origin}/testimonials/submit/${data.token}`
			setCreatedLink(link)
			setNewRequest({ clientName: '', clientEmail: '', projectName: '' })
			fetchData()

			trackEvent('testimonial_link_created', {
				has_email: !!newRequest.clientEmail,
				has_project: !!newRequest.projectName
			})
		} catch (error) {
			logger.warn('Failed to create testimonial link', {
				error: error instanceof Error ? error.message : String(error)
			})
			setError('Failed to create link. Please try again.')
		} finally {
			setIsCreating(false)
		}
	}

	const copyLink = async () => {
		if (!createdLink) {
			return
		}
		await navigator.clipboard.writeText(createdLink)
		setCopiedLink(true)
		setTimeout(() => setCopiedLink(false), TIMEOUTS.COPY_FEEDBACK)
	}

	const handleApprove = async (id: string, approved: boolean) => {
		try {
			const res = await fetch(`/api/testimonials/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json', ...authHeaders() },
				body: JSON.stringify({ approved })
			})
			if (res.status === 401) {
				clearToken()
				return
			}
			fetchData()
		} catch (error) {
			logger.error('Failed to update testimonial approval', {
				error,
				id,
				approved
			})
			setError('Failed to update testimonial')
		}
	}

	const handleFeature = async (id: string, featured: boolean) => {
		try {
			const res = await fetch(`/api/testimonials/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json', ...authHeaders() },
				body: JSON.stringify({ featured })
			})
			if (res.status === 401) {
				clearToken()
				return
			}
			fetchData()
		} catch (error) {
			logger.error('Failed to update testimonial featured status', {
				error,
				id,
				featured
			})
			setError('Failed to update testimonial')
		}
	}

	const handleDelete = async (id: string, type: 'testimonial' | 'request') => {
		if (!confirm('Are you sure you want to delete this?')) {
			return
		}

		try {
			const endpoint =
				type === 'testimonial'
					? `/api/testimonials/${id}`
					: `/api/testimonials/requests/${id}`

			const res = await fetch(endpoint, {
				method: 'DELETE',
				headers: authHeaders()
			})
			if (res.status === 401) {
				clearToken()
				return
			}
			fetchData()
		} catch (error) {
			logger.error('Failed to delete testimonial', { error, id, type })
			setError('Failed to delete')
		}
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		})
	}

	const renderStars = (rating: number) => {
		return (
			<div className="flex gap-0.5">
				{[1, 2, 3, 4, 5].map(star => (
					<Star
						key={star}
						className={`w-4 h-4 ${
							star <= rating
								? 'fill-yellow-400 text-warning-text'
								: 'text-muted-foreground'
						}`}
					/>
				))}
			</div>
		)
	}

	if (!adminToken) {
		return (
			<CalculatorLayout
				title="Testimonial Collector"
				description="Admin access required"
				icon={<MessageSquare className="h-8 w-8 text-accent" />}
			>
				<div className="max-w-sm mx-auto space-y-content">
					<p className="text-sm text-muted-foreground">
						Enter your admin token to continue.
					</p>
					<div className="flex gap-tight">
						<input
							type="password"
							value={tokenInput}
							onChange={e => setTokenInput(e.target.value)}
							onKeyDown={e => {
								if (e.key === 'Enter') {
									handleSetToken()
								}
							}}
							placeholder="Admin token"
							className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
							aria-label="Admin token"
						/>
						<button
							onClick={handleSetToken}
							disabled={!tokenInput.trim()}
							className="px-4 py-2 bg-accent text-foreground rounded-md text-sm font-medium hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Enter
						</button>
					</div>
				</div>
			</CalculatorLayout>
		)
	}

	return (
		<CalculatorLayout
			title="Testimonial Collector"
			description="Collect and manage client testimonials with private collection links"
			icon={<MessageSquare className="h-8 w-8 text-accent" />}
		>
			<div className="space-y-comfortable">
				{/* Tabs */}
				<div className="flex border-b border-border">
					{TABS.map(tab => (
						<button
							key={tab.id}
							onClick={() => {
								setActiveTab(tab.id)
								setCreatedLink(null)
							}}
							className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
								activeTab === tab.id
									? 'border-accent text-accent'
									: 'border-transparent text-muted-foreground hover:text-foreground'
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>

				{/* Error Message */}
				{error && (
					<Card
						size="sm"
						className="rounded-lg bg-destructive-light text-destructive-text text-sm"
					>
						{error}
					</Card>
				)}

				{/* Loading State */}
				{isLoading && (
					<div className="text-center py-12 text-muted-foreground">
						Loading...
					</div>
				)}

				{/* Testimonials Tab */}
				{!isLoading && activeTab === 'testimonials' && (
					<div className="space-y-content">
						{testimonials.length === 0 ? (
							<div className="text-center py-12 text-muted-foreground">
								<MessageSquare className="w-12 h-12 mx-auto mb-heading opacity-50" />
								<p>No testimonials yet.</p>
								<p className="text-sm mt-2">
									Share your public link or create private collection links to
									get started.
								</p>
							</div>
						) : (
							testimonials.map(testimonial => (
								<Card key={testimonial.id} size="sm" className="space-y-3">
									<div className="flex items-start justify-between gap-content">
										<div>
											<div className="flex items-center gap-3 mb-1">
												<span className="font-semibold text-foreground">
													{testimonial.client_name}
												</span>
												{renderStars(testimonial.rating)}
												{testimonial.featured && (
													<span className="px-2 py-0.5 text-xs font-medium bg-warning-muted text-warning-texter rounded">
														Featured
													</span>
												)}
												{testimonial.approved ? (
													<span className="px-2 py-0.5 text-xs font-medium bg-success-muted text-success-text rounded">
														Approved
													</span>
												) : (
													<span className="px-2 py-0.5 text-xs font-medium bg-secondary text-foreground rounded">
														Pending
													</span>
												)}
											</div>
											{(testimonial.company || testimonial.role) && (
												<p className="text-sm text-muted-foreground">
													{testimonial.role && testimonial.role}
													{testimonial.role && testimonial.company && ' at '}
													{testimonial.company && testimonial.company}
												</p>
											)}
										</div>
										<span className="text-xs text-muted-foreground">
											{formatDate(testimonial.created_at)}
										</span>
									</div>

									<p className="text-foreground">
										&quot;{testimonial.content}&quot;
									</p>

									{testimonial.video_url && (
										<a
											href={testimonial.video_url}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1 text-sm text-accent hover:text-accent/80"
										>
											<ExternalLink className="w-3 h-3" />
											View Video
										</a>
									)}

									<div className="flex gap-tight pt-2 border-t border-border">
										<button
											onClick={() =>
												handleApprove(testimonial.id, !testimonial.approved)
											}
											className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded ${
												testimonial.approved
													? 'bg-secondary text-foreground hover:bg-secondary'
													: 'bg-success-muted text-success-text hover:bg-success-muted'
											}`}
										>
											{testimonial.approved ? (
												<>
													<XCircle className="w-3 h-3" /> Unapprove
												</>
											) : (
												<>
													<CheckCircle2 className="w-3 h-3" /> Approve
												</>
											)}
										</button>
										<button
											onClick={() =>
												handleFeature(testimonial.id, !testimonial.featured)
											}
											className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded ${
												testimonial.featured
													? 'bg-warning-muted text-warning-texter hover:bg-warning-muted'
													: 'bg-secondary text-foreground hover:bg-secondary'
											}`}
										>
											<Star className="w-3 h-3" />
											{testimonial.featured ? 'Unfeature' : 'Feature'}
										</button>
										<button
											onClick={() =>
												handleDelete(testimonial.id, 'testimonial')
											}
											className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded bg-destructive-muted text-destructive-texter hover:bg-destructive-muted"
										>
											<Trash2 className="w-3 h-3" /> Delete
										</button>
									</div>
								</Card>
							))
						)}
					</div>
				)}

				{/* Requests Tab */}
				{!isLoading && activeTab === 'requests' && (
					<div className="space-y-content">
						<Card size="sm" className="bg-accent/10 text-sm text-accent">
							<strong>Public Link:</strong>{' '}
							<code className="bg-background/50 px-2 py-0.5 rounded">
								{typeof window !== 'undefined' &&
									`${window.location.origin}/testimonials/submit`}
							</code>
						</Card>

						{requests.length === 0 ? (
							<div className="text-center py-12 text-muted-foreground">
								<Clock className="w-12 h-12 mx-auto mb-heading opacity-50" />
								<p>No private collection links created yet.</p>
								<button
									onClick={() => setActiveTab('create')}
									className="mt-4 px-4 py-2 bg-accent text-foreground rounded-lg text-sm font-medium hover:bg-accent/80"
								>
									Create Your First Link
								</button>
							</div>
						) : (
							<div className="space-y-3">
								{requests.map(req => {
									const isExpired = new Date(req.expires_at) < new Date()
									return (
										<Card
											key={req.id}
											size="sm"
											className={`${
												req.submitted
													? 'border-success-muted bg-success-light/50'
													: isExpired
														? 'border-border bg-muted/50 opacity-60'
														: 'border-border'
											}`}
										>
											<div className="flex items-start justify-between gap-content">
												<div>
													<div className="flex items-center gap-tight mb-1">
														<span className="font-semibold text-foreground">
															{req.client_name}
														</span>
														{req.submitted ? (
															<span className="px-2 py-0.5 text-xs font-medium bg-success-muted text-success-text rounded">
																Submitted
															</span>
														) : isExpired ? (
															<span className="px-2 py-0.5 text-xs font-medium bg-secondary text-foreground rounded">
																Expired
															</span>
														) : (
															<span className="px-2 py-0.5 text-xs font-medium bg-info-muted text-info-texter rounded">
																Pending
															</span>
														)}
													</div>
													{req.project_name && (
														<p className="text-sm text-muted-foreground">
															Project: {req.project_name}
														</p>
													)}
													{req.client_email && (
														<p className="text-sm text-muted-foreground">
															{req.client_email}
														</p>
													)}
												</div>
												<div className="text-right text-xs text-muted-foreground">
													<p>Created: {formatDate(req.created_at)}</p>
													<p>Expires: {formatDate(req.expires_at)}</p>
												</div>
											</div>

											{!req.submitted && !isExpired && (
												<div className="mt-3 pt-3 border-t border-border flex items-center gap-tight">
													<code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate">
														{typeof window !== 'undefined' &&
															`${window.location.origin}/testimonials/submit/${req.token}`}
													</code>
													<button
														onClick={async () => {
															await navigator.clipboard.writeText(
																`${window.location.origin}/testimonials/submit/${req.token}`
															)
														}}
														className="p-2 text-muted-foreground hover:text-foreground"
														aria-label="Copy link"
													>
														<Copy className="w-4 h-4" />
													</button>
												</div>
											)}

											<div className="mt-3 flex gap-tight">
												<button
													onClick={() => handleDelete(req.id, 'request')}
													className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded bg-destructive-muted text-destructive-texter hover:bg-destructive-muted"
												>
													<Trash2 className="w-3 h-3" /> Delete
												</button>
											</div>
										</Card>
									)
								})}
							</div>
						)}
					</div>
				)}

				{/* Create Link Tab */}
				{activeTab === 'create' && (
					<div className="space-y-comfortable">
						{createdLink ? (
							<div className="space-y-content">
								<Card size="sm" className="bg-success-light">
									<div className="flex items-center gap-tight text-success-text mb-subheading">
										<CheckCircle2 className="w-5 h-5" />
										<span className="font-semibold">Link Created!</span>
									</div>
									<p className="text-sm text-success-text mb-heading">
										Share this link with your client to collect their
										testimonial.
									</p>
									<div className="flex gap-tight">
										<input
											type="text"
											value={createdLink}
											readOnly
											className="flex-1 rounded-md border border-success-muted bg-background px-3 py-2 text-sm text-foreground"
										/>
										<button
											onClick={copyLink}
											className="flex items-center gap-tight px-4 py-2 bg-success text-foreground rounded-md text-sm font-medium hover:bg-success/90"
										>
											{copiedLink ? (
												<>
													<Check className="w-4 h-4" /> Copied!
												</>
											) : (
												<>
													<Copy className="w-4 h-4" /> Copy
												</>
											)}
										</button>
									</div>
								</Card>
								<button
									onClick={() => setCreatedLink(null)}
									className="flex items-center gap-tight text-accent hover:text-accent/80 text-sm font-medium"
								>
									<Plus className="w-4 h-4" /> Create Another Link
								</button>
							</div>
						) : (
							<form onSubmit={handleCreateLink} className="space-y-content">
								<CalculatorInput
									label="Client Name"
									id="clientName"
									type="text"
									value={newRequest.clientName}
									onChange={e =>
										setNewRequest(prev => ({
											...prev,
											clientName: e.target.value
										}))
									}
									helpText="Required"
									required
								/>
								<CalculatorInput
									label="Client Email (Optional)"
									id="clientEmail"
									type="email"
									value={newRequest.clientEmail}
									onChange={e =>
										setNewRequest(prev => ({
											...prev,
											clientEmail: e.target.value
										}))
									}
									helpText="For your reference only"
								/>
								<CalculatorInput
									label="Project Name (Optional)"
									id="projectName"
									type="text"
									value={newRequest.projectName}
									onChange={e =>
										setNewRequest(prev => ({
											...prev,
											projectName: e.target.value
										}))
									}
									helpText="Helps personalize the request"
								/>

								<button
									type="submit"
									disabled={!newRequest.clientName.trim() || isCreating}
									className="w-full flex items-center justify-center gap-tight rounded-md bg-accent px-6 py-3 text-base font-semibold text-foreground shadow-xs hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<Plus className="w-5 h-5" />
									{isCreating ? 'Creating...' : 'Create Private Link'}
								</button>

								<p className="text-xs text-muted-foreground text-center">
									Link will be valid for 30 days
								</p>
							</form>
						)}
					</div>
				)}
			</div>

			{/* Educational Content */}
			<div className="mt-heading space-y-content border-t border-border pt-8">
				<h3 className="text-lg font-semibold text-foreground">
					Testimonial Collection Tips
				</h3>

				<div className="grid gap-content sm:grid-cols-2">
					<Card size="sm">
						<h4 className="mb-subheading font-semibold text-foreground">
							Use Private Links
						</h4>
						<p className="text-sm text-muted-foreground">
							Private links are personalized and can only be used once, ensuring
							authentic testimonials from real clients.
						</p>
					</Card>

					<Card size="sm">
						<h4 className="mb-subheading font-semibold text-foreground">
							Ask at the Right Time
						</h4>
						<p className="text-sm text-muted-foreground">
							Request testimonials right after delivering successful results
							when the positive experience is fresh.
						</p>
					</Card>

					<Card size="sm">
						<h4 className="mb-subheading font-semibold text-foreground">
							Review Before Publishing
						</h4>
						<p className="text-sm text-muted-foreground">
							All testimonials require approval before appearing on your site.
							Review for accuracy and appropriateness.
						</p>
					</Card>

					<Card size="sm">
						<h4 className="mb-subheading font-semibold text-foreground">
							Feature Your Best
						</h4>
						<p className="text-sm text-muted-foreground">
							Mark your strongest testimonials as featured to highlight them
							prominently on your website.
						</p>
					</Card>
				</div>
			</div>
		</CalculatorLayout>
	)
}
