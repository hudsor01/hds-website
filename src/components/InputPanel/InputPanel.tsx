'use client'

import { Calculator } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { TtlFieldErrors } from '@/lib/ttl-calculator/calculator'
import type {
	PaymentResults,
	TTLResults,
	VehicleInputs as VehicleInputType
} from '@/types/ttl-types'
import { AdvancedOptions } from './AdvancedOptions'
import { FinancingInputs } from './FinancingInputs'
import { VehicleInputs } from './VehicleInputs'

interface InputPanelProps {
	vehicleInput: VehicleInputType
	updateInput: (field: string, value: unknown) => void
	addToComparison: () => void
	comparisonVehicles: Array<{
		input: VehicleInputType
		ttl: TTLResults
		payment: PaymentResults
		name: string
	}>
	fieldErrors: TtlFieldErrors
}

export function InputPanel({
	vehicleInput,
	updateInput,
	addToComparison,
	comparisonVehicles,
	fieldErrors
}: InputPanelProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-tight">
					<Calculator className="w-5 h-5 text-accent" />
					{/* CardTitle is always an h3; this section sits right under the H1 */}
					<h2 className="text-h4 text-foreground">Vehicle Information</h2>
				</div>
			</CardHeader>
			<CardContent className="space-y-content">
				<VehicleInputs
					vehicleInput={vehicleInput}
					updateInput={updateInput}
					fieldErrors={fieldErrors}
				/>
				<FinancingInputs
					vehicleInput={vehicleInput}
					updateInput={updateInput}
					fieldErrors={fieldErrors}
				/>
				<AdvancedOptions
					vehicleInput={vehicleInput}
					updateInput={updateInput}
					fieldErrors={fieldErrors}
					addToComparison={addToComparison}
					comparisonVehicles={comparisonVehicles}
				/>
			</CardContent>
		</Card>
	)
}
