import type { VehicleInputs } from '../../types/ttl-types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface FinancingInputsProps {
  vehicleInput: VehicleInputs;
  updateInput: (field: string, value: unknown) => void;
}

export function FinancingInputs({ vehicleInput, updateInput }: FinancingInputsProps) {
  return (
    <div className="rounded-none border bg-card card-padding-sm">
      <h3 className="text-lg font-medium mb-3">Financing Information</h3>

      <div className="grid grid-cols-2 gap-content">
        <div className="space-y-tight">
          <Label htmlFor="interestRate">Interest Rate (%)</Label>
          <Input
            id="interestRate"
            name="interestRate"
            type="number"
            step="0.1"
            value={vehicleInput.interestRate}
            onChange={(e) => updateInput('interestRate', Number(e.target.value))}
            placeholder="0.0"
          />
        </div>

        <div className="space-y-tight">
          <Label htmlFor="paymentFrequency">Payment Frequency</Label>
          <Select
            value={vehicleInput.paymentFrequency}
            onValueChange={(value) => updateInput('paymentFrequency', value)}
          >
            <SelectTrigger id="paymentFrequency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="biweekly">Bi-weekly</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
