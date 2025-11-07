import { Plus, Settings } from 'lucide-react'
import type { PaymentResults, TTLResults, VehicleInputs } from '../../types/ttl-types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AdvancedOptionsProps {
  vehicleInput: VehicleInputs;
  updateInput: (field: string, value: unknown) => void;
  addToComparison: () => void;
  comparisonVehicles: Array<{
    input: VehicleInputs;
    ttl: TTLResults;
    payment: PaymentResults;
    name: string;
  }>;
}

export function AdvancedOptions({
  vehicleInput,
  updateInput,
  addToComparison,
  comparisonVehicles
}: AdvancedOptionsProps) {
  return (
    <div className="rounded-none border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Settings className="w-5 h-5 text-foreground" />
        <h3 className="text-lg font-medium">Advanced Options</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Credit Score */}
        <div className="space-y-2">
          <Label>Credit Score</Label>
          <Input
            type="number"
            min="300"
            max="850"
            value={vehicleInput.creditScore}
            onChange={(e) => updateInput('creditScore', Number(e.target.value))}
            placeholder="700"
          />
        </div>

        {/* Rebate Amount */}
        <div className="space-y-2">
          <Label>Rebate Amount</Label>
          <Input
            type="number"
            value={vehicleInput.rebateAmount}
            onChange={(e) => updateInput('rebateAmount', Number(e.target.value))}
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
          Add to Comparison {comparisonVehicles.length > 0 ? `(${comparisonVehicles.length}/3)` : ''}
        </Button>

        {comparisonVehicles.length > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            {comparisonVehicles.length} vehicle(s) in comparison
          </div>
        )}
      </div>
    </div>
  );
}
