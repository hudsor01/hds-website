'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type {
	PaymentResults,
	TTLResults,
	VehicleInputs
} from '@/types/ttl-types'
import { Plus, Settings } from 'lucide-react'

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
}

export function AdvancedOptions({
	vehicleInput,
	updateInput,
	addToComparison,
	comparisonVehicles
}: AdvancedOptionsProps) {
	return (
		<Card size="sm" className="rounded-none">
			<div className="flex items-center gap-tight mb-3">
				<Settings className="w-5 h-5 text-foreground" />
				<h3 className="text-lg font-medium">Advanced Options</h3>
			</div>

			<div className="grid grid-cols-2 gap-content">
				{/* Credit Score */}
				<div className="space-y-tight">
					<Label htmlFor="creditScore">Credit Score</Label>
					<Input
						id="creditScore"
						name="creditScore"
						type="number"
						min="300"
						max="850"
						value={vehicleInput.creditScore}
						onChange={e => updateInput('creditScore', Number(e.target.value))}
						placeholder="700"
					/>
				</div>

				{/* Rebate Amount */}
				<div className="space-y-tight">
					<Label htmlFor="rebateAmount">Rebate Amount</Label>
					<Input
						id="rebateAmount"
						name="rebateAmount"
						type="number"
						value={vehicleInput.rebateAmount}
						onChange={e => updateInput('rebateAmount', Number(e.target.value))}
						placeholder="0"
					/>
				</div>
			</div>

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
