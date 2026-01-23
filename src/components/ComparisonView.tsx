import { X } from 'lucide-react'
import type { PaymentResults, TTLResults, VehicleInputs } from '../types/ttl-types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ComparisonViewProps {
  comparisonVehicles: Array<{
    input: VehicleInputs;
    ttl: TTLResults;
    payment: PaymentResults;
    name: string;
  }>;
  removeFromComparison: (index: number) => void;
  clearComparison: () => void;
  setComparisonMode: (mode: boolean) => void;
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
        <h2 className="text-xl font-semibold text-foreground">Compare Vehicles</h2>
        <Button
          type="button"
          onClick={() => setComparisonMode(false)}
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          aria-label="Close comparison"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3">Vehicle</th>
              <th className="text-right py-2 px-3">Purchase Price</th>
              <th className="text-right py-2 px-3">Down Payment</th>
              <th className="text-right py-2 px-3">Trade-In</th>
              <th className="text-right py-2 px-3">Sales Tax</th>
              <th className="text-right py-2 px-3">Title Fee</th>
              <th className="text-right py-2 px-3">Registration</th>
              <th className="text-right py-2 px-3">Total TTL</th>
              <th className="text-right py-2 px-3">Monthly Payment</th>
              <th className="text-right py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {comparisonVehicles.map((vehicle, index) => (
              <tr key={index} className="border-b border-border">
                <td className="py-3 px-3 font-medium">{vehicle.name}</td>
                <td className="py-3 px-3 text-right">${vehicle.input.purchasePrice.toLocaleString()}</td>
                <td className="py-3 px-3 text-right">${vehicle.input.downPayment.toLocaleString()}</td>
                <td className="py-3 px-3 text-right">${vehicle.input.tradeInValue.toLocaleString()}</td>
                <td className="py-3 px-3 text-right">${vehicle.ttl.salesTax.toFixed(2)}</td>
                <td className="py-3 px-3 text-right">${vehicle.ttl.titleFee.toFixed(2)}</td>
                <td className="py-3 px-3 text-right">${vehicle.ttl.registrationFees.toFixed(2)}</td>
                <td className="py-3 px-3 text-right font-semibold">${vehicle.ttl.totalTTL.toFixed(2)}</td>
                <td className="py-3 px-3 text-right">${vehicle.payment.monthlyPayment.toFixed(2)}</td>
                <td className="py-3 px-3 text-right">
                <Button
                  type="button"
                  onClick={() => removeFromComparison(index)}
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive-darker"
                  aria-label={`Remove ${vehicle.name} from comparison`}
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
        <Button type="button" onClick={clearComparison} variant="destructive" size="sm">
          Clear All
        </Button>
      </div>
    </Card>
  );
}
