'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type {
	PaymentResults,
	TTLResults,
	VehicleInputs
} from '@/types/ttl-types'

interface ComparisonViewProps {
	comparisonVehicles: Array<{
		input: VehicleInputs
		ttl: TTLResults
		payment: PaymentResults
		name: string
	}>
	removeFromComparison: (index: number) => void
	clearComparison: () => void
	setComparisonMode: (mode: boolean) => void
}

export function ComparisonView({
	comparisonVehicles,
	removeFromComparison,
	clearComparison,
	setComparisonMode
}: ComparisonViewProps) {
	return (
		<Card className="mb-content-block">
			<div className="flex items-center justify-between mb-heading">
				<h2 className="text-h4 text-foreground">Compare Vehicles</h2>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setComparisonMode(false)}
					aria-label="Close comparison"
				>
					<X className="w-5 h-5" />
				</Button>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b border-border">
							<th scope="col" className="text-left py-2 px-3">
								Vehicle
							</th>
							<th scope="col" className="text-right py-2 px-3">
								Purchase Price
							</th>
							<th scope="col" className="text-right py-2 px-3">
								Down Payment
							</th>
							<th scope="col" className="text-right py-2 px-3">
								Trade-In
							</th>
							<th scope="col" className="text-right py-2 px-3">
								Sales Tax
							</th>
							<th scope="col" className="text-right py-2 px-3">
								Title Fee
							</th>
							<th scope="col" className="text-right py-2 px-3">
								Registration
							</th>
							<th scope="col" className="text-right py-2 px-3">
								Other Fees
							</th>
							<th scope="col" className="text-right py-2 px-3">
								Total TTL
							</th>
							<th scope="col" className="text-right py-2 px-3">
								Monthly Payment
							</th>
							<th scope="col" className="text-right py-2 px-3">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{comparisonVehicles.map((vehicle, index) => (
							<tr key={index} className="border-b border-border">
								<td className="py-3 px-3 font-medium">{vehicle.name}</td>
								<td className="py-3 px-3 text-right">
									${vehicle.input.purchasePrice.toLocaleString()}
								</td>
								<td className="py-3 px-3 text-right">
									${vehicle.input.downPayment.toLocaleString()}
								</td>
								<td className="py-3 px-3 text-right">
									${vehicle.input.tradeInValue.toLocaleString()}
								</td>
								<td className="py-3 px-3 text-right">
									{formatCurrency(vehicle.ttl.salesTax)}
								</td>
								<td className="py-3 px-3 text-right">
									{formatCurrency(vehicle.ttl.titleFee)}
								</td>
								<td className="py-3 px-3 text-right">
									{formatCurrency(vehicle.ttl.registrationFees)}
								</td>
								<td className="py-3 px-3 text-right">
									{formatCurrency(
										(vehicle.ttl.plateFee ?? 0) +
											vehicle.ttl.evFee +
											vehicle.ttl.emissions
									)}
								</td>
								<td className="py-3 px-3 text-right font-semibold">
									{formatCurrency(vehicle.ttl.totalTTL)}
								</td>
								<td className="py-3 px-3 text-right">
									{formatCurrency(vehicle.payment.monthlyPayment)}
								</td>
								<td className="py-3 px-3 text-right">
									<Button
										variant="ghost"
										size="icon-sm"
										onClick={() => removeFromComparison(index)}
										aria-label={`Remove ${vehicle.name} from comparison`}
										className="text-destructive hover:text-destructive hover:bg-destructive/10"
									>
										<X className="w-4 h-4" />
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="flex gap-tight mt-4">
				<Button variant="destructive" onClick={clearComparison}>
					Clear All
				</Button>
			</div>
		</Card>
	)
}
