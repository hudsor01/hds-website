'use client'

import { Copy, Mail, Printer, Share2 } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
	emailResults,
	loadCalculation,
	saveCalculation
} from '@/app/(public)/actions/ttl-calculator'
import { InputPanel } from '@/components/InputPanel/InputPanel'
import { Button } from '@/components/ui/button'
import { TIMEOUTS } from '@/lib/constants/timeouts'
import { logger } from '@/lib/logger'
import { formatCurrency } from '@/lib/utils'
import { useCalculatorStore } from '@/stores/calculator-store'
import type {
	PaymentResults,
	TTLResults,
	VehicleInputs
} from '@/types/ttl-types'
import { ComparisonView } from './ComparisonView'
import { ResultsPanel } from './ResultsPanel'

export function Calculator() {
	const {
		vehicleInput,
		calculationResults,
		isLoading,
		error,
		fieldErrors,
		updateInput,
		setVehicleInput,
		saveCurrentCalculation
	} = useCalculatorStore()

	const [saveSuccess, setSaveSuccess] = useState(false)
	const [comparisonMode, setComparisonMode] = useState(false)
	const [comparisonVehicles, setComparisonVehicles] = useState<
		Array<{
			input: VehicleInputs
			ttl: TTLResults
			payment: PaymentResults
			name: string
		}>
	>([])

	// Share modal state
	const [showShareModal, setShowShareModal] = useState(false)
	const [shareCode, setShareCode] = useState<string | null>(null)
	const [emailInput, setEmailInput] = useState('')
	const [isPending, startTransition] = useTransition()

	// Open a shared link (?c=CODE): load the saved inputs; results are derived
	useEffect(() => {
		const code = new URLSearchParams(window.location.search).get('c')
		if (!code) {
			return
		}
		let cancelled = false
		loadCalculation(code).then(result => {
			if (cancelled) {
				return
			}
			if (result.success && result.data) {
				setVehicleInput(result.data.inputs)
				setShareCode(code)
			} else {
				toast.error(result.error || 'Could not load the shared calculation')
			}
		})
		return () => {
			cancelled = true
		}
	}, [setVehicleInput])

	const handleSaveCalculation = async () => {
		try {
			await saveCurrentCalculation()
			setSaveSuccess(true)
			setTimeout(() => setSaveSuccess(false), TIMEOUTS.SAVE_SUCCESS)
		} catch (error) {
			logger.error('Failed to save calculation', error)
		}
	}

	const handleEmailResults = async () => {
		if (!shareCode) {
			// First save to get a share code
			await handleShareLink()
			return
		}

		if (!emailInput?.includes('@')) {
			toast.error('Please enter a valid email address')
			return
		}

		startTransition(async () => {
			const result = await emailResults(shareCode, emailInput)
			if (result.success) {
				toast.success('Results sent to your email!')
				setEmailInput('')
			} else {
				toast.error(result.error || 'Failed to send email')
			}
		})
	}

	const handleShareLink = async () => {
		if (!calculationResults) {
			toast.error('No calculation results to share')
			return
		}

		startTransition(async () => {
			const result = await saveCalculation(vehicleInput, calculationResults)

			if (result.success && result.shareCode) {
				setShareCode(result.shareCode)
				setShowShareModal(true)

				const shareableUrl = `${window.location.origin}${window.location.pathname}?c=${result.shareCode}`

				try {
					await navigator.clipboard.writeText(shareableUrl)
					toast.success('Link copied to clipboard!')
				} catch {
					// Clipboard failed, modal will show the link
					logger.info('Clipboard API not available')
				}
			} else {
				toast.error(result.error || 'Failed to create share link')
			}
		})
	}

	const copyShareLink = async () => {
		if (!shareCode) {
			return
		}
		const shareableUrl = `${window.location.origin}${window.location.pathname}?c=${shareCode}`
		try {
			await navigator.clipboard.writeText(shareableUrl)
			toast.success('Link copied to clipboard!')
		} catch {
			toast.error('Failed to copy link')
		}
	}

	const handlePrintPDF = () => {
		// Browser print dialog; overlays opt out with print:hidden
		window.print()
	}

	const addToComparison = () => {
		if (comparisonVehicles.length >= 3) {
			return
		} // Limit to 3 vehicles

		// Create a name for the vehicle based on price and county
		const vehicleName = `${formatCurrency(vehicleInput.purchasePrice)} - ${vehicleInput.county}`

		setComparisonVehicles(prev => [
			...prev,
			{
				input: { ...vehicleInput },
				ttl: {
					salesTax: calculationResults?.ttlResults?.salesTax ?? 0,
					titleFee: calculationResults?.ttlResults?.titleFee ?? 0,
					registrationFees:
						calculationResults?.ttlResults?.registrationFees ?? 0,
					plateFee: calculationResults?.ttlResults?.plateFee ?? 0,
					evFee: calculationResults?.ttlResults?.evFee ?? 0,
					emissions: calculationResults?.ttlResults?.emissions ?? 0,
					totalTTL: calculationResults?.ttlResults?.totalTTL ?? 0
				},
				payment: {
					loanAmount: calculationResults?.paymentResults?.loanAmount ?? 0,
					monthlyPayment:
						calculationResults?.paymentResults?.monthlyPayment ?? 0,
					biweeklyPayment:
						calculationResults?.paymentResults?.biweeklyPayment ?? 0,
					totalInterest: calculationResults?.paymentResults?.totalInterest ?? 0,
					totalFinanced: calculationResults?.paymentResults?.totalFinanced ?? 0
				},
				name: vehicleName
			}
		])

		setComparisonMode(true)
	}

	const removeFromComparison = (index: number) => {
		setComparisonVehicles(prev => prev.filter((_, i) => i !== index))

		// If no vehicles left, exit comparison mode
		if (comparisonVehicles.length <= 1) {
			setComparisonMode(false)
		}
	}

	const clearComparison = () => {
		setComparisonVehicles([])
		setComparisonMode(false)
	}

	return (
		// A <div>, not <main>: the (public) layout already renders the page's
		// single <main id="main-content"> landmark.
		<div className="min-h-screen bg-background">
			<div className="container-wide pt-28 pb-16 sm:pt-32 sm:pb-20">
				{/* Header */}
				<div className="mb-10">
					<h1 className="mb-3 text-page-title text-foreground text-balance">
						Texas TTL Calculator
					</h1>
					<p className="max-w-2xl text-lead text-muted-foreground">
						Tax, Title, License & Payment Calculator for Texas Vehicles
					</p>
				</div>

				{comparisonMode && (
					<ComparisonView
						comparisonVehicles={comparisonVehicles}
						removeFromComparison={removeFromComparison}
						clearComparison={clearComparison}
						setComparisonMode={setComparisonMode}
					/>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-comfortable">
					<div className="lg:col-span-2">
						<InputPanel
							vehicleInput={vehicleInput}
							updateInput={
								updateInput as (field: string, value: unknown) => void
							}
							addToComparison={addToComparison}
							comparisonVehicles={comparisonVehicles}
							fieldErrors={fieldErrors}
						/>
					</div>

					<div className="lg:col-span-1">
						<ResultsPanel
							vehicleInput={vehicleInput}
							calculationResults={calculationResults}
							isLoading={isLoading}
							error={error}
							hasFieldErrors={Object.keys(fieldErrors).length > 0}
							handleSaveCalculation={handleSaveCalculation}
							saveSuccess={saveSuccess}
							handleEmailResults={handleEmailResults}
							handleShareLink={handleShareLink}
							handlePrintPDF={handlePrintPDF}
							addToComparison={addToComparison}
							comparisonVehicles={comparisonVehicles}
						/>
					</div>
				</div>

				{/* Footer with disclaimer */}
				<div className="mt-12 text-center text-sm text-muted-foreground">
					<p>
						Disclaimer: This calculator provides estimates based on Texas state
						fees and regulations. Actual fees may vary.
					</p>
					<p>
						Always verify with your local Texas DMV office for the most accurate
						information.
					</p>
				</div>
			</div>

			{/* Share Modal */}
			{showShareModal && (
				<div
					className="fixed inset-0 bg-overlay flex items-center justify-center z-50 print:hidden"
					onClick={() => setShowShareModal(false)}
				>
					<div
						className="bg-card rounded-xl shadow-xl p-6 max-w-md w-full mx-4"
						onClick={e => e.stopPropagation()}
					>
						<div className="flex items-center gap-3 mb-4">
							<Share2 className="w-6 h-6 text-accent" />
							<h2 className="text-h4 text-foreground">Share Your Results</h2>
						</div>

						{/* Share Link */}
						<div className="mb-6">
							<label className="block text-sm font-medium text-muted-foreground mb-2">
								Shareable Link
							</label>
							<div className="flex gap-2">
								<input
									type="text"
									readOnly
									value={
										shareCode
											? `${window.location.origin}${window.location.pathname}?c=${shareCode}`
											: ''
									}
									className="field flex-1"
								/>
								<Button
									type="button"
									variant="accent"
									size="icon"
									onClick={copyShareLink}
									aria-label="Copy link"
								>
									<Copy aria-hidden="true" />
								</Button>
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								This link will work for 90 days
							</p>
						</div>

						{/* Email Results */}
						<div className="mb-6">
							<label
								htmlFor="ttl-email-results"
								className="block text-sm font-medium text-muted-foreground mb-2"
							>
								Email Results
							</label>
							<div className="flex gap-2">
								<input
									id="ttl-email-results"
									type="email"
									placeholder="your@email.com"
									value={emailInput}
									onChange={e => setEmailInput(e.target.value)}
									className="field flex-1"
								/>
								<Button
									type="button"
									variant="accent"
									size="icon"
									onClick={handleEmailResults}
									disabled={isPending || !emailInput}
									aria-label="Send email"
								>
									<Mail aria-hidden="true" />
								</Button>
							</div>
						</div>

						{/* Print Button */}
						<div className="flex gap-3">
							<Button
								type="button"
								variant="muted"
								className="flex-1"
								onClick={() => {
									setShowShareModal(false)
									setTimeout(handlePrintPDF, TIMEOUTS.PRINT_DELAY)
								}}
							>
								<Printer aria-hidden="true" />
								Print Results
							</Button>
							<Button
								type="button"
								variant="ghost"
								onClick={() => setShowShareModal(false)}
							>
								Close
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
