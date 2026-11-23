/**
 * Paystub Calculator
 * Generate detailed payroll breakdowns with federal and state tax calculations
 */

'use client'

import { ToolPageLayout } from '@/components/layout/ToolPageLayout'
import { PaystubForm } from '@/components/paystub/PaystubForm'
import { PaystubNavigation } from '@/components/paystub/PaystubNavigation'
import { Card } from '@/components/ui/card'
import { usePaystubGenerator } from '@/hooks/use-paystub-generator'
import { stateInsuranceLabel } from '@/lib/paystub-calculator/state-tax-calculations'
import { getSupportedIncomeTaxStateCodes } from '@/lib/paystub-calculator/state-tax-data'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function PaystubCalculatorClient() {
	const generator = usePaystubGenerator()
	const insuranceLabel = stateInsuranceLabel(generator.selectedState)
	// No state income tax line for TX, FL and the other no-tax states
	const hasStateIncomeTax = getSupportedIncomeTaxStateCodes().includes(
		generator.selectedState
	)
	const { totals } = generator.paystubData

	const formSlot = (
		<PaystubForm
			paystubData={generator.paystubData}
			setPaystubData={generator.setPaystubData}
			selectedState={generator.selectedState}
			setSelectedState={generator.setSelectedState}
			payFrequency={generator.payFrequency}
			setPayFrequency={generator.setPayFrequency}
			overtimeHours={generator.overtimeHours}
			setOvertimeHours={generator.setOvertimeHours}
			overtimeRate={generator.overtimeRate}
			setOvertimeRate={generator.setOvertimeRate}
			additionalDeductions={generator.additionalDeductions}
			setAdditionalDeductions={generator.setAdditionalDeductions}
			withholding={generator.withholding}
			setWithholding={generator.setWithholding}
			formErrors={generator.formErrors}
			onGenerate={generator.generatePaystubs}
			onClear={generator.handleClearForm}
			isGenerating={generator.isGenerating}
		/>
	)

	const resultSlot =
		generator.resultsVisible && generator.paystubData.payPeriods.length > 0 ? (
			<div className="space-y-comfortable">
				<PaystubNavigation
					selectedPeriod={generator.selectedPeriod}
					setSelectedPeriod={generator.setSelectedPeriod}
					documentType={generator.documentType}
					setDocumentType={generator.setDocumentType}
					onBackToForm={generator.backToForm}
					onPrint={generator.handlePrint}
					payPeriods={generator.paystubData.payPeriods}
				/>

				{/* Pay Period Detail */}
				{generator.paystubData.payPeriods
					.filter(p => p.period === generator.selectedPeriod)
					.map(period => (
						<Card key={period.period}>
							<h3 className="text-lg font-semibold text-foreground mb-heading">
								Period {period.period}, paid{' '}
								{formatDate(period.payDate, 'long')}
							</h3>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Hours Worked</span>
									<span className="font-medium text-foreground">
										{period.hours}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Gross Pay</span>
									<span className="font-medium text-foreground">
										{formatCurrency(period.grossPay)}
									</span>
								</div>
								<div className="border-t border-border pt-3 space-y-2">
									{period.preTaxDeductions > 0 && (
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">
												Pre-Tax Deductions
											</span>
											<span className="text-destructive-text">
												-{formatCurrency(period.preTaxDeductions)}
											</span>
										</div>
									)}
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Federal Tax</span>
										<span className="text-destructive-text">
											-{formatCurrency(period.federalTax)}
										</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">
											Social Security
										</span>
										<span className="text-destructive-text">
											-{formatCurrency(period.socialSecurity)}
										</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Medicare</span>
										<span className="text-destructive-text">
											-{formatCurrency(period.medicare)}
										</span>
									</div>
									{hasStateIncomeTax && (
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">State Tax</span>
											<span className="text-destructive-text">
												-{formatCurrency(period.stateTax)}
											</span>
										</div>
									)}
									{period.stateInsurance > 0 && (
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">
												{insuranceLabel}
											</span>
											<span className="text-destructive-text">
												-{formatCurrency(period.stateInsurance)}
											</span>
										</div>
									)}
									{period.otherDeductions > 0 && (
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">
												After-Tax Deductions
											</span>
											<span className="text-destructive-text">
												-{formatCurrency(period.otherDeductions)}
											</span>
										</div>
									)}
								</div>
								<div className="border-t border-border pt-3 flex justify-between">
									<span className="font-semibold text-foreground">Net Pay</span>
									<span className="text-2xl font-bold text-accent">
										{formatCurrency(period.netPay)}
									</span>
								</div>
							</div>
						</Card>
					))}

				{/* Annual Totals */}
				<Card className="bg-accent/10">
					<h3 className="text-lg font-semibold text-foreground mb-heading">
						Annual Totals
					</h3>
					<div className="grid gap-content sm:grid-cols-2">
						<div>
							<div className="text-sm text-muted-foreground">Total Hours</div>
							<div className="text-lg font-semibold text-foreground">
								{totals.hours}
							</div>
						</div>
						<div>
							<div className="text-sm text-muted-foreground">Gross Pay</div>
							<div className="text-lg font-semibold text-foreground">
								{formatCurrency(totals.grossPay)}
							</div>
						</div>
						<div>
							<div className="text-sm text-muted-foreground">
								Total Deductions
							</div>
							<div className="text-lg font-semibold text-destructive-text">
								-{formatCurrency(totals.grossPay - totals.netPay)}
							</div>
						</div>
						<div>
							<div className="text-sm text-muted-foreground">Net Pay</div>
							<div className="text-xl font-bold text-accent">
								{formatCurrency(totals.netPay)}
							</div>
						</div>
					</div>
				</Card>
			</div>
		) : null

	return (
		<ToolPageLayout
			title="Paystub Calculator"
			description="See take-home pay for each 2026 paycheck. Federal withholding follows the IRS payroll method with your Form W-4, plus Social Security, Medicare, pre-tax 401(k) and health premiums. State withholding uses the payroll formulas for CA, NY, IL, PA and MA, including CA SDI and NY and MA paid leave."
			columns="single"
			formSlot={formSlot}
			resultSlot={resultSlot}
			hasResult={
				generator.resultsVisible && generator.paystubData.payPeriods.length > 0
			}
			actions={
				generator.resultsVisible
					? [{ type: 'print', label: 'Print', onClick: () => window.print() }]
					: undefined
			}
		/>
	)
}
