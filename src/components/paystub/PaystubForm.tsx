'use client'

import { CurrencyInput } from '@/components/forms/CurrencyInput'
import { FormField } from '@/components/forms/FormField'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import {
	getIncomeTaxStates,
	getNoIncomeTaxStates
} from '@/lib/paystub-calculator/states-utils'
import { getSupportedTaxYears } from '@/lib/paystub-calculator/tax-data'
import type { FormErrors } from '@/types/common'
import {
	FILING_STATUS_LABELS,
	FILING_STATUSES,
	type FilingStatus,
	type PayFrequency,
	type PaystubData,
	type WithholdingInputs
} from '@/types/paystub'

interface PaystubFormProps {
	paystubData: PaystubData
	setPaystubData: React.Dispatch<React.SetStateAction<PaystubData>>
	selectedState: string
	setSelectedState: React.Dispatch<React.SetStateAction<string>>
	payFrequency: PayFrequency
	setPayFrequency: React.Dispatch<React.SetStateAction<PayFrequency>>
	overtimeHours: number
	setOvertimeHours: React.Dispatch<React.SetStateAction<number>>
	overtimeRate: number
	setOvertimeRate: React.Dispatch<React.SetStateAction<number>>
	additionalDeductions: Array<{ name: string; amount: number }>
	setAdditionalDeductions: React.Dispatch<
		React.SetStateAction<Array<{ name: string; amount: number }>>
	>
	withholding: WithholdingInputs
	setWithholding: React.Dispatch<React.SetStateAction<WithholdingInputs>>
	formErrors: FormErrors
	onGenerate: () => void
	onClear: () => void
	isGenerating: boolean
}

export function PaystubForm({
	paystubData,
	setPaystubData,
	selectedState,
	setSelectedState,
	payFrequency,
	setPayFrequency,
	overtimeHours,
	setOvertimeHours,
	overtimeRate,
	setOvertimeRate,
	additionalDeductions,
	setAdditionalDeductions,
	withholding,
	setWithholding,
	formErrors,
	onGenerate,
	onClear,
	isGenerating
}: PaystubFormProps) {
	return (
		<div className="card-padding-lg font-sans container-narrow">
			<h2 className="text-h2 mb-comfortable text-center text-foreground">
				Professional Pay Stub Generator
			</h2>

			{/* Employee Information */}
			<Card className="mb-comfortable">
				<h2 className="text-xl font-bold mb-5 text-foreground">
					Employee Information
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
					<FormField
						label="Employee Name"
						id="employeeName"
						value={paystubData.employeeName}
						onChange={value =>
							setPaystubData(prev => ({ ...prev, employeeName: value }))
						}
						error={formErrors.employeeName}
						required
						placeholder="John Doe"
					/>

					<FormField
						label="Employee ID"
						id="employeeId"
						value={paystubData.employeeId}
						onChange={value =>
							setPaystubData(prev => ({ ...prev, employeeId: value }))
						}
						placeholder="EMP001"
					/>

					<FormField
						label="Employer Name"
						id="employerName"
						value={paystubData.employerName}
						onChange={value =>
							setPaystubData(prev => ({ ...prev, employerName: value }))
						}
						placeholder="ABC Company Inc."
					/>
				</div>
			</Card>

			{/* Pay Information */}
			<Card className="mb-comfortable">
				<h2 className="text-xl font-bold mb-5 text-foreground">
					Pay Information
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					<CurrencyInput
						label="Hourly Rate"
						id="hourlyRate"
						value={paystubData.hourlyRate}
						onChange={value =>
							setPaystubData(prev => ({ ...prev, hourlyRate: value }))
						}
						error={formErrors.hourlyRate}
						required
						placeholder="25.00"
					/>

					<FormField
						label="Hours Per Period"
						id="hoursPerPeriod"
						type="number"
						step="0.5"
						value={paystubData.hoursPerPeriod}
						onChange={value =>
							setPaystubData(prev => ({
								...prev,
								hoursPerPeriod: parseFloat(value) || 0
							}))
						}
						error={formErrors.hoursPerPeriod}
						required
						placeholder="80"
					/>
				</div>
			</Card>

			{/* Tax Information */}
			<Card className="mb-comfortable">
				<h2 className="text-xl font-bold mb-5 text-foreground">
					Tax Information
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
					<div className="space-y-tight">
						<Label htmlFor="filingStatus">Filing Status</Label>
						<Select
							value={paystubData.filingStatus}
							onValueChange={value =>
								setPaystubData(prev => ({
									...prev,
									filingStatus: value as FilingStatus
								}))
							}
						>
							<SelectTrigger id="filingStatus">
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								{FILING_STATUSES.map(status => (
									<SelectItem key={status} value={status}>
										{FILING_STATUS_LABELS[status]}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-tight">
						<Label htmlFor="taxYear">Tax Year</Label>
						<Select
							value={paystubData.taxYear.toString()}
							onValueChange={value =>
								setPaystubData(prev => ({
									...prev,
									taxYear: parseInt(value, 10)
								}))
							}
						>
							<SelectTrigger
								id="taxYear"
								aria-invalid={!!formErrors.taxYear}
								className={
									formErrors.taxYear ? 'border-destructive border-2' : undefined
								}
							>
								<SelectValue placeholder="Select year" />
							</SelectTrigger>
							<SelectContent>
								{getSupportedTaxYears().map(year => (
									<SelectItem key={year} value={String(year)}>
										{year}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{formErrors.taxYear && (
							<p className="text-destructive text-xs" role="alert">
								{formErrors.taxYear}
							</p>
						)}
					</div>

					<div className="space-y-tight">
						<Label htmlFor="state">State</Label>
						<Select value={selectedState} onValueChange={setSelectedState}>
							<SelectTrigger id="state">
								<SelectValue placeholder="Select State" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>No State Income Tax</SelectLabel>
									{getNoIncomeTaxStates().map(state => (
										<SelectItem key={state.value} value={state.value}>
											{state.label}
										</SelectItem>
									))}
								</SelectGroup>
								<SelectGroup>
									<SelectLabel>State Income Tax</SelectLabel>
									{getIncomeTaxStates().map(state => (
										<SelectItem key={state.value} value={state.value}>
											{state.label}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</div>
			</Card>

			<WithholdingSection
				withholding={withholding}
				setWithholding={setWithholding}
				selectedState={selectedState}
				formErrors={formErrors}
			/>

			{/* Pay Frequency */}
			<Card className="mb-comfortable">
				<h2 className="text-xl font-bold mb-5 text-foreground">
					Pay Frequency
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-1 gap-5">
					<div className="space-y-tight">
						<Label htmlFor="payFrequency">Pay Period</Label>
						<Select
							value={payFrequency}
							onValueChange={value => setPayFrequency(value as PayFrequency)}
						>
							<SelectTrigger id="payFrequency">
								<SelectValue placeholder="Select period" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="weekly">Weekly (52 periods)</SelectItem>
								<SelectItem value="biweekly">Bi-weekly (26 periods)</SelectItem>
								<SelectItem value="semimonthly">
									Semi-monthly (24 periods)
								</SelectItem>
								<SelectItem value="monthly">Monthly (12 periods)</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</Card>

			{/* Overtime Information */}
			<Card className="mb-comfortable">
				<h2 className="text-xl font-bold mb-5 text-foreground">Overtime</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					<FormField
						label="Overtime Hours"
						id="overtimeHours"
						type="number"
						step="0.5"
						value={overtimeHours}
						onChange={value => setOvertimeHours(parseFloat(value) || 0)}
						placeholder="0"
					/>

					<CurrencyInput
						label="Overtime Rate (per hour)"
						id="overtimeRate"
						value={overtimeRate}
						onChange={value => setOvertimeRate(value)}
						placeholder="37.50"
					/>
				</div>
			</Card>

			{/* Additional Deductions */}
			<Card className="mb-comfortable">
				<h2 className="text-xl font-bold mb-5 text-foreground">
					After-Tax Deductions
				</h2>
				<div className="space-y-3">
					{additionalDeductions.map((deduction, index) => (
						<div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<Input
								placeholder="Deduction name (for example, union dues)"
								value={deduction.name}
								onChange={e => {
									const newDeductions = [...additionalDeductions]
									if (newDeductions[index]) {
										newDeductions[index].name = e.target.value
										setAdditionalDeductions(newDeductions)
									}
								}}
							/>
							<div className="flex gap-2">
								<div className="relative">
									<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
										$
									</span>
									<Input
										type="number"
										step="0.01"
										placeholder="Amount"
										value={deduction.amount || ''}
										onChange={e => {
											const newDeductions = [...additionalDeductions]
											if (newDeductions[index]) {
												newDeductions[index].amount =
													parseFloat(e.target.value) || 0
												setAdditionalDeductions(newDeductions)
											}
										}}
										variant="currency"
									/>
								</div>
								<Button
									type="button"
									variant="destructive"
									size="sm"
									onClick={() => {
										setAdditionalDeductions(
											additionalDeductions.filter((_, i) => i !== index)
										)
									}}
								>
									Remove
								</Button>
							</div>
						</div>
					))}
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							setAdditionalDeductions([
								...additionalDeductions,
								{ name: '', amount: 0 }
							])
						}}
					>
						Add Deduction
					</Button>
				</div>
			</Card>

			{/* Action Buttons */}
			<div className="flex-center gap-content">
				<Button
					onClick={onGenerate}
					disabled={isGenerating}
					size="lg"
					className="px-8"
				>
					{isGenerating ? 'Generating...' : 'Generate Pay Stubs'}
				</Button>

				<Button
					onClick={onClear}
					variant="destructive"
					size="lg"
					className="px-8"
				>
					Clear Form
				</Button>
			</div>
		</div>
	)
}

interface WithholdingSectionProps {
	withholding: WithholdingInputs
	setWithholding: React.Dispatch<React.SetStateAction<WithholdingInputs>>
	selectedState: string
	formErrors: FormErrors
}

interface StateAllowanceField {
	key: 'stateAllowances' | 'stateAdditionalAllowances'
	label: string
}

// State withholding certificate fields, labelled as they appear on each form
const STATE_ALLOWANCE_FIELDS: Record<string, StateAllowanceField[]> = {
	CA: [
		{ key: 'stateAllowances', label: 'DE 4 regular allowances' },
		{
			key: 'stateAdditionalAllowances',
			label: 'DE 4 allowances for estimated deductions'
		}
	],
	NY: [{ key: 'stateAllowances', label: 'IT-2104 allowances' }],
	IL: [
		{ key: 'stateAllowances', label: 'IL-W-4 line 1 allowances' },
		{ key: 'stateAdditionalAllowances', label: 'IL-W-4 line 2 allowances' }
	],
	MA: [{ key: 'stateAllowances', label: 'M-4 exemptions' }]
}

function WithholdingSection({
	withholding,
	setWithholding,
	selectedState,
	formErrors
}: WithholdingSectionProps) {
	const update = <K extends keyof WithholdingInputs>(
		key: K,
		value: WithholdingInputs[K]
	) => setWithholding(prev => ({ ...prev, [key]: value }))
	const stateFields = STATE_ALLOWANCE_FIELDS[selectedState] ?? []

	return (
		<>
			<Card className="mb-comfortable">
				<h2 className="text-xl font-bold mb-heading text-foreground">
					Form W-4
				</h2>
				<p className="text-sm text-muted-foreground mb-5">
					Enter what is on your 2026 Form W-4. Leave a field at zero if that
					step is blank.
				</p>
				<div className="flex items-start gap-3 mb-5">
					<Checkbox
						id="multipleJobs"
						checked={withholding.multipleJobs}
						onCheckedChange={value => {
							if (typeof value === 'boolean') {
								update('multipleJobs', value)
							}
						}}
					/>
					<Label htmlFor="multipleJobs" className="font-normal leading-snug">
						Step 2(c): I checked the box for multiple jobs or a spouse who works
					</Label>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					<CurrencyInput
						label="Step 3: Dependents credit (per year)"
						id="dependentsCredit"
						value={withholding.dependentsCredit}
						onChange={value => update('dependentsCredit', value)}
						error={formErrors.dependentsCredit}
						step="1"
						placeholder="0"
					/>
					<CurrencyInput
						label="Step 4(a): Other income (per year)"
						id="otherIncome"
						value={withholding.otherIncome}
						onChange={value => update('otherIncome', value)}
						error={formErrors.otherIncome}
						step="1"
						placeholder="0"
					/>
					<CurrencyInput
						label="Step 4(b): Deductions (per year)"
						id="deductions"
						value={withholding.deductions}
						onChange={value => update('deductions', value)}
						error={formErrors.deductions}
						step="1"
						placeholder="0"
					/>
					<CurrencyInput
						label="Step 4(c): Extra withholding (per paycheck)"
						id="extraWithholding"
						value={withholding.extraWithholding}
						onChange={value => update('extraWithholding', value)}
						error={formErrors.extraWithholding}
						placeholder="0.00"
					/>
				</div>
				<p className="text-xs text-muted-foreground mt-content">
					Step 3 is $2,200 for each child under 17 and $500 for each other
					dependent. The 2026 deductions for tips, overtime and seniors go in
					Step 4(b).
				</p>
			</Card>

			<Card className="mb-comfortable">
				<h2 className="text-xl font-bold mb-heading text-foreground">
					Pre-Tax Deductions
				</h2>
				<p className="text-sm text-muted-foreground mb-5">
					Taken out before taxes, per paycheck.
				</p>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					<CurrencyInput
						label="Traditional 401(k) or 403(b)"
						id="retirementPerPeriod"
						value={withholding.retirementPerPeriod}
						onChange={value => update('retirementPerPeriod', value)}
						error={formErrors.retirementPerPeriod}
					/>
					<CurrencyInput
						label="Health, dental and vision premiums"
						id="healthPerPeriod"
						value={withholding.healthPerPeriod}
						onChange={value => update('healthPerPeriod', value)}
						error={formErrors.healthPerPeriod}
					/>
				</div>
				<p className="text-xs text-muted-foreground mt-content">
					401(k) contributions lower income tax but not Social Security or
					Medicare, and Pennsylvania taxes them. Premiums paid through a
					cafeteria plan lower all of them. Roth contributions are after tax.
				</p>
			</Card>

			{stateFields.length > 0 && (
				<Card className="mb-comfortable">
					<h2 className="text-xl font-bold mb-heading text-foreground">
						State Withholding Form
					</h2>
					<p className="text-sm text-muted-foreground mb-5">
						From the state withholding certificate you gave your employer.
					</p>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						{stateFields.map(field => (
							<FormField
								key={field.key}
								label={field.label}
								id={field.key}
								type="number"
								step="1"
								value={withholding[field.key]}
								onChange={value =>
									update(
										field.key,
										Math.max(0, Number.parseInt(value, 10) || 0)
									)
								}
								error={formErrors[field.key]}
								placeholder="0"
							/>
						))}
					</div>
				</Card>
			)}
		</>
	)
}
