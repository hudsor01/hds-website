import { X } from 'lucide-react'
import type { PaymentResults, TTLResults, VehicleInputs } from '../types/ttl-types'

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
    <div className="bg-white rounded-xl shadow-lg p-6 border border-border mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Compare Vehicles</h2>
        <button
          onClick={() => setComparisonMode(false)}
          className="text-muted-foreground hover:text-muted-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
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
              <tr key={index} className="border-b border-gray-100">
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
                <button
                  onClick={() => removeFromComparison(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={clearComparison}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
