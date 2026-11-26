'use client'

import {
	AlertCircle,
	Check,
	CreditCard,
	DollarSign,
	FileText,
	Mail,
	Plus,
	Save,
	Share2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type {
	CalculationResults,
	PaymentResults,
	TTLResults,
	VehicleInputs
} from '@/types/ttl-types'

interface ResultsPanelProps {
	vehicleInput: VehicleInputs
	calculationResults: CalculationResults | null
	isLoading: boolean
	error: string | null
	/** Some inputs are invalid, so there are no results to show */
	hasFieldErrors: boolean
	handleSaveCalculation: () => void
	saveSuccess: boolean
	handleEmailResults: () => void
	handleShareLink: () => void
	handlePrintPDF: () => void
	addToComparison: () => void
	comparisonVehicles: Array<{
		input: VehicleInputs
		ttl: TTLResults
		payment: PaymentResults
		name: string
	}>
}

export function ResultsPanel({
	vehicleInput,
	calculationResults,
	isLoading,
	error,
	hasFieldErrors,
	handleSaveCalculation,
	saveSuccess,
	handleEmailResults,
	handleShareLink,
	handlePrintPDF,
	addToComparison,
	comparisonVehicles
}: ResultsPanelProps) {
	const ttl = calculationResults?.ttlResults
	const payment = calculationResults?.paymentResults
	return (
		<Card>
			<CardContent className="card-padding space-y-comfortable">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-tight">
						<FileText className="w-6 h-6 text-accent" />
						<h2 className="text-h4 text-foreground">Calculation Results</h2>
					</div>
					{calculationResults && (
						<span className="px-3 py-1 text-sm text-muted-foreground border border-border rounded-md">
							Texas
						</span>
					)}
				</div>

				{isLoading && (
					<div className="text-center py-12">
						<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent mx-auto mb-heading"></div>
						<p className="text-muted-foreground font-medium">
							Calculating your results...
						</p>
					</div>
				)}

				{error && (
					<Card
						size="sm"
						className="flex items-start gap-content bg-destructive/10"
					>
						<AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
						<div>
							<p className="text-destructive font-medium">{error}</p>
						</div>
					</Card>
				)}

				{calculationResults && (
					<>
						{/* TTL Breakdown */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-tight">
									<CreditCard className="h-4 w-4 text-accent" />
									<CardTitle>TTL Breakdown</CardTitle>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								<ResultRow label="Sales Tax (6.25%)" value={ttl?.salesTax} />
								<ResultRow label="Title Fee" value={ttl?.titleFee} />
								<ResultRow
									label={
										vehicleInput.isNewVehicle
											? 'Registration and Local Fees (2 years)'
											: 'Registration and Local Fees'
									}
									value={ttl?.registrationFees}
								/>
								{(ttl?.plateFee ?? 0) > 0 && (
									<ResultRow label="License Plate Fee" value={ttl?.plateFee} />
								)}
								{(ttl?.evFee ?? 0) > 0 && (
									<ResultRow label="Electric Vehicle Fee" value={ttl?.evFee} />
								)}
								{(ttl?.emissions ?? 0) > 0 && (
									<ResultRow label="Emissions Fee" value={ttl?.emissions} />
								)}
								<div className="border-t pt-3 mt-3">
									<div className="flex justify-between items-center font-bold text-lg">
										<span>Total TTL</span>
										<span>{formatCurrency(ttl?.totalTTL ?? 0)}</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Monthly Payment */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-tight">
									<DollarSign className="h-4 w-4 text-accent" />
									<CardTitle>Monthly Payment</CardTitle>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								{(payment?.loanAmount ?? 0) > 0 ? (
									<>
										<ResultRow
											label="Loan Amount"
											value={payment?.loanAmount}
										/>
										<div className="flex justify-between items-center">
											<span>
												Monthly Payment ({vehicleInput.loanTermMonths} months)
											</span>
											<span className="font-bold text-xl">
												{formatCurrency(payment?.monthlyPayment ?? 0)}
											</span>
										</div>
										<ResultRow
											label="Total Interest"
											value={payment?.totalInterest}
										/>
										<ResultRow
											label="Total of Payments"
											value={payment?.totalFinanced}
										/>
									</>
								) : (
									<p className="text-muted-foreground">
										No loan needed. The down payment, trade-in and rebate cover
										the price and TTL.
									</p>
								)}
							</CardContent>
						</Card>

						{/* Action Buttons */}
						<div className="grid grid-cols-2 gap-3">
							<Button
								onClick={handleSaveCalculation}
								className="gap-tight"
								variant={saveSuccess ? 'default' : 'default'}
							>
								{saveSuccess ? (
									<>
										<Check className="w-4 h-4" />
										<span>Saved!</span>
									</>
								) : (
									<>
										<Save className="w-4 h-4" />
										<span>Save</span>
									</>
								)}
							</Button>

							<Button onClick={handleEmailResults} className="gap-tight">
								<Mail className="w-4 h-4" />
								<span>Email</span>
							</Button>

							<Button onClick={handleShareLink} className="gap-tight">
								<Share2 className="w-4 h-4" />
								<span>Share</span>
							</Button>

							<Button onClick={handlePrintPDF} className="gap-tight">
								<FileText className="w-4 h-4" />
								<span>PDF</span>
							</Button>
						</div>

						<Button
							onClick={addToComparison}
							disabled={comparisonVehicles.length >= 3}
							className="w-full gap-tight"
						>
							<Plus className="w-4 h-4" />
							<span>
								Add to Comparison{' '}
								{comparisonVehicles.length > 0
									? `(${comparisonVehicles.length}/3)`
									: ''}
							</span>
						</Button>
					</>
				)}

				{!calculationResults && !isLoading && hasFieldErrors && (
					<div className="text-center py-8 text-muted-foreground">
						<p>Fix the highlighted fields to see your results.</p>
					</div>
				)}

				{!calculationResults && !isLoading && !hasFieldErrors && (
					<div className="text-center py-8 text-muted-foreground">
						<p>Enter vehicle information to see calculation results</p>
					</div>
				)}

				<div className="rounded-xl border bg-secondary/10 p-3 text-xs text-muted-foreground">
					<p>
						<strong>Note:</strong> This calculator provides estimates based on
						Texas state fees and regulations. Actual fees may vary by county and
						specific circumstances. Always verify with your local Texas DMV
						office.
					</p>
				</div>
			</CardContent>
		</Card>
	)
}

function ResultRow({ label, value }: { label: string; value?: number }) {
	return (
		<div className="flex justify-between items-center">
			<span>{label}</span>
			<span className="font-medium">{formatCurrency(value ?? 0)}</span>
		</div>
	)
}
