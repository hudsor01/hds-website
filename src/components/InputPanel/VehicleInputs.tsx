import { CurrencyInput } from '@/components/forms/CurrencyInput'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import {
	COUNTY_FEES,
	type TtlFieldErrors
} from '@/lib/ttl-calculator/calculator'
import type { VehicleInputs as VehicleInput } from '@/types/ttl-types'

interface VehicleInputsProps {
	vehicleInput: VehicleInput
	updateInput: (field: keyof VehicleInput, value: unknown) => void
	fieldErrors: TtlFieldErrors
}

export function VehicleInputs({
	vehicleInput,
	updateInput,
	fieldErrors
}: VehicleInputsProps) {
	return (
		<div className="space-y-content">
			{/* Basic Information */}
			<div className="grid grid-cols-2 gap-content">
				{/* Purchase Price */}
				<CurrencyInput
					label="Purchase Price"
					id="purchasePrice"
					value={vehicleInput.purchasePrice}
					onChange={value => updateInput('purchasePrice', value)}
					error={fieldErrors.purchasePrice}
					placeholder="0"
				/>

				{/* Down Payment */}
				<CurrencyInput
					label="Down Payment"
					id="downPayment"
					value={vehicleInput.downPayment}
					onChange={value => updateInput('downPayment', value)}
					error={fieldErrors.downPayment}
					placeholder="0"
				/>
			</div>

			{/* Trade-In and County */}
			<div className="grid grid-cols-2 gap-content">
				{/* Trade-In Value */}
				<CurrencyInput
					label="Trade-In Value"
					id="tradeInValue"
					value={vehicleInput.tradeInValue}
					onChange={value => updateInput('tradeInValue', value)}
					error={fieldErrors.tradeInValue}
					placeholder="0"
				/>

				{/* County */}
				<div className="space-y-tight">
					<Label id="county-label" htmlFor="county">
						Texas County
					</Label>
					<Select
						value={vehicleInput.county}
						onValueChange={value => updateInput('county', value)}
					>
						<SelectTrigger id="county" aria-labelledby="county-label">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{Object.keys(COUNTY_FEES).map(county => (
								<SelectItem key={county} value={county}>
									{county}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Checkboxes */}
			<div className="flex flex-col gap-3 pt-2">
				<div className="flex items-center gap-3">
					<Checkbox
						id="new-vehicle"
						aria-labelledby="new-vehicle-label"
						checked={vehicleInput.isNewVehicle}
						onCheckedChange={(checked: boolean) =>
							updateInput('isNewVehicle', checked)
						}
					/>
					<Label
						id="new-vehicle-label"
						htmlFor="new-vehicle"
						className="text-sm font-normal cursor-pointer"
					>
						New Vehicle (2-year registration)
					</Label>
				</div>

				<div className="flex items-center gap-3">
					<Checkbox
						id="used-vehicle"
						aria-labelledby="used-vehicle-label"
						checked={!vehicleInput.isNewVehicle}
						onCheckedChange={(checked: boolean) =>
							updateInput('isNewVehicle', !checked)
						}
					/>
					<Label
						id="used-vehicle-label"
						htmlFor="used-vehicle"
						className="text-sm font-normal cursor-pointer"
					>
						Used Vehicle (1-year registration)
					</Label>
				</div>

				<div className="flex items-center gap-3">
					<Checkbox
						id="electric-vehicle"
						aria-labelledby="electric-vehicle-label"
						checked={vehicleInput.isElectric}
						onCheckedChange={(checked: boolean) =>
							updateInput('isElectric', checked)
						}
					/>
					<Label
						id="electric-vehicle-label"
						htmlFor="electric-vehicle"
						className="text-sm font-normal cursor-pointer"
					>
						Electric Vehicle ($200 a year, $400 for a new car's first two years)
					</Label>
				</div>
			</div>
		</div>
	)
}
