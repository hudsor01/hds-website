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
import type { VehicleInputs as VehicleInput } from '@/types/ttl-types'
import { COUNTY_FEES } from '@/lib/ttl-calculator/calculator'

interface VehicleInputsProps {
	vehicleInput: VehicleInput
	updateInput: (field: keyof VehicleInput, value: unknown) => void
}

export function VehicleInputs({
	vehicleInput,
	updateInput
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
					placeholder="0"
				/>

				{/* Down Payment */}
				<CurrencyInput
					label="Down Payment"
					id="downPayment"
					value={vehicleInput.downPayment}
					onChange={value => updateInput('downPayment', value)}
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
					placeholder="0"
				/>

				{/* County */}
				<div className="space-y-tight">
					<Label htmlFor="county">Texas County</Label>
					<Select
						value={vehicleInput.county}
						onValueChange={value => updateInput('county', value)}
					>
						<SelectTrigger id="county">
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
						checked={vehicleInput.isNewVehicle}
						onCheckedChange={(checked: boolean) =>
							updateInput('isNewVehicle', checked)
						}
					/>
					<Label
						htmlFor="new-vehicle"
						className="text-sm font-normal cursor-pointer"
					>
						New Vehicle (2-year registration)
					</Label>
				</div>

				<div className="flex items-center gap-3">
					<Checkbox
						id="used-vehicle"
						checked={!vehicleInput.isNewVehicle}
						onCheckedChange={(checked: boolean) =>
							updateInput('isNewVehicle', !checked)
						}
					/>
					<Label
						htmlFor="used-vehicle"
						className="text-sm font-normal cursor-pointer"
					>
						Used Vehicle (1-year registration)
					</Label>
				</div>

				<div className="flex items-center gap-3">
					<Checkbox
						id="electric-vehicle"
						checked={vehicleInput.isElectric}
						onCheckedChange={(checked: boolean) =>
							updateInput('isElectric', checked)
						}
					/>
					<Label
						htmlFor="electric-vehicle"
						className="text-sm font-normal cursor-pointer"
					>
						Electric Vehicle (+$200 annual fee)
					</Label>
				</div>
			</div>
		</div>
	)
}
