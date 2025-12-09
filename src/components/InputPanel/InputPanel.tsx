import { Calculator } from 'lucide-react'
import type { PaymentResults, TTLResults, VehicleInputs as VehicleInputType } from '../../types/ttl-types'
import { AdvancedOptions } from './AdvancedOptions'
import { FinancingInputs } from './FinancingInputs'
import { VehicleInputs } from './VehicleInputs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface InputPanelProps {
  vehicleInput: VehicleInputType;
  updateInput: (field: string, value: unknown) => void;
  addToComparison: () => void;
  comparisonVehicles: Array<{
    input: VehicleInputType;
    ttl: TTLResults;
    payment: PaymentResults;
    name: string;
  }>;
}

export function InputPanel({
  vehicleInput,
  updateInput,
  addToComparison,
  comparisonVehicles
}: InputPanelProps) {
 return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-tight">
          <Calculator className="w-5 h-5 text-primary" />
          <CardTitle>Vehicle Information</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-content">
        <VehicleInputs vehicleInput={vehicleInput} updateInput={updateInput} />
        <FinancingInputs vehicleInput={vehicleInput} updateInput={updateInput} />
        <AdvancedOptions
          vehicleInput={vehicleInput}
          updateInput={updateInput}
          addToComparison={addToComparison}
          comparisonVehicles={comparisonVehicles}
        />
      </CardContent>
    </Card>
  );
}
