import { DollarSign } from 'lucide-react'
import { COUNTY_FEES } from '../../lib/ttl-calculator/calculator'
import type { VehicleInputs as VehicleInput } from '../../types/ttl-types'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface VehicleInputsProps {
  vehicleInput: VehicleInput;
  updateInput: (field: keyof VehicleInput, value: unknown) => void;
}

export function VehicleInputs({ vehicleInput, updateInput }: VehicleInputsProps) {
  return (
    <div className="space-y-content">
      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-content">
        {/* Purchase Price */}
        <div className="space-y-tight">
          <Label htmlFor="purchasePrice">Purchase Price</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="purchasePrice"
              name="purchasePrice"
              type="number"
              value={vehicleInput.purchasePrice}
              onChange={(e) => updateInput('purchasePrice', Number(e.target.value))}
              className="pl-10"
              placeholder="0"
            />
          </div>
        </div>

        {/* Down Payment */}
        <div className="space-y-tight">
          <Label htmlFor="downPayment">Down Payment</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="downPayment"
              name="downPayment"
              type="number"
              value={vehicleInput.downPayment}
              onChange={(e) => updateInput('downPayment', Number(e.target.value))}
              className="pl-10"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Trade-In and County */}
      <div className="grid grid-cols-2 gap-content">
        {/* Trade-In Value */}
        <div className="space-y-tight">
          <Label htmlFor="tradeInValue">Trade-In Value</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="tradeInValue"
              name="tradeInValue"
              type="number"
              value={vehicleInput.tradeInValue}
              onChange={(e) => updateInput('tradeInValue', Number(e.target.value))}
              className="pl-10"
              placeholder="0"
            />
          </div>
        </div>

        {/* County */}
        <div className="space-y-tight">
          <Label htmlFor="county">Texas County</Label>
          <Select value={vehicleInput.county} onValueChange={(value) => updateInput('county', value)}>
            <SelectTrigger id="county">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(COUNTY_FEES).map(county => (
                <SelectItem key={county} value={county}>{county}</SelectItem>
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
            onCheckedChange={(checked: boolean) => updateInput('isNewVehicle', checked)}
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
            onCheckedChange={(checked: boolean) => updateInput('isNewVehicle', !checked)}
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
            onCheckedChange={(checked: boolean) => updateInput('isElectric', checked)}
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
  );
}
