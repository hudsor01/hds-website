'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import {
	MAX_INTEREST_RATE,
	type TtlFieldErrors
} from '@/lib/ttl-calculator/calculator'
import { cn } from '@/lib/utils'
import type { VehicleInputs } from '@/types/ttl-types'

const LOAN_TERMS = [24, 36, 48, 60, 72, 84] as const

interface FinancingInputsProps {
	vehicleInput: VehicleInputs
	updateInput: (field: string, value: unknown) => void
	fieldErrors: TtlFieldErrors
}

export function FinancingInputs({
	vehicleInput,
	updateInput,
	fieldErrors
}: FinancingInputsProps) {
	const rateError = fieldErrors.interestRate
	return (
		<Card size="sm" className="rounded-none">
			<h3 className="text-lg font-medium mb-3">Financing Information</h3>

			<div className="grid grid-cols-2 gap-content">
				<div className="space-y-tight">
					<Label htmlFor="interestRate">Interest Rate (%)</Label>
					<Input
						id="interestRate"
						name="interestRate"
						type="number"
						min="0"
						max={MAX_INTEREST_RATE}
						step="0.1"
						value={vehicleInput.interestRate}
						onChange={e => updateInput('interestRate', Number(e.target.value))}
						placeholder="0.0"
						className={cn(rateError && 'border-destructive border-2')}
						aria-invalid={rateError ? true : undefined}
						aria-describedby={rateError ? 'interestRate-error' : undefined}
					/>
					{rateError && (
						<p
							id="interestRate-error"
							className="text-destructive text-xs"
							role="alert"
						>
							{rateError}
						</p>
					)}
				</div>

				<div className="space-y-tight">
					<Label id="loanTermMonths-label" htmlFor="loanTermMonths">
						Loan Term
					</Label>
					<Select
						value={String(vehicleInput.loanTermMonths)}
						onValueChange={value =>
							updateInput('loanTermMonths', Number(value))
						}
					>
						<SelectTrigger
							id="loanTermMonths"
							aria-labelledby="loanTermMonths-label"
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{LOAN_TERMS.map(months => (
								<SelectItem key={months} value={String(months)}>
									{months} months
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
		</Card>
	)
}
