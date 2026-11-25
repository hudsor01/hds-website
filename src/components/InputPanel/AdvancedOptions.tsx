'use client'

import { Plus, Settings } from 'lucide-react'
import { CurrencyInput } from '@/components/forms/CurrencyInput'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { TtlFieldErrors } from '@/lib/ttl-calculator/calculator'
import type {
	PaymentResults,
	TTLResults,
	VehicleInputs
} from '@/types/ttl-types'

interface AdvancedOptionsProps {
	vehicleInput: VehicleInputs
	updateInput: (field: string, value: unknown) => void
	addToComparison: () => void
	comparisonVehicles: Array<{
		input: VehicleInputs
		ttl: TTLResults
		payment: PaymentResults
		name: string
	}>
	fieldErrors: TtlFieldErrors
}

export function AdvancedOptions({
	vehicleInput,
	updateInput,
	addToComparison,
	comparisonVehicles,
	fieldErrors
}: AdvancedOptionsProps) {
	return (
		<Card size="sm" className="rounded-none">
			<div className="flex items-center gap-tight mb-3">
				<Settings className="w-5 h-5 text-foreground" />
				<h3 className="text-lg font-medium">Advanced Options</h3>
			</div>

			<CurrencyInput
				label="Manufacturer Rebate"
				id="rebateAmount"
				value={vehicleInput.rebateAmount ?? 0}
				onChange={value => updateInput('rebateAmount', value)}
				error={fieldErrors.rebateAmount}
				placeholder="0"
			/>
			<p className="text-xs text-muted-foreground mt-2">
				A rebate the dealer applies to the price lowers both the sales tax and
				the loan.
			</p>

			{/* Comparison Button */}
			<div className="mt-4 pt-4 border-t">
				<Button
					onClick={addToComparison}
					disabled={comparisonVehicles.length >= 3}
					className="w-full"
				>
					<Plus className="w-4 h-4 mr-2" />
					Add to Comparison{' '}
					{comparisonVehicles.length > 0
						? `(${comparisonVehicles.length}/3)`
						: ''}
				</Button>

				{comparisonVehicles.length > 0 && (
					<div className="mt-2 text-sm text-muted-foreground">
						{comparisonVehicles.length} vehicle(s) in comparison
					</div>
				)}
			</div>
		</Card>
	)
}
