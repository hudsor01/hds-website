/**
 * Vehicle Calculations Hook
 * Pure calculation logic for TTL, payments, TCO, and lease comparisons
 * No side effects, state management, or storage operations
 */

import { calculatePayment, calculateTTL } from '../lib/ttl-calculator/calculator';
import { calculateLeaseComparison } from '../lib/ttl-calculator/lease';
import { calculateTCO } from '../lib/ttl-calculator/tco';
import type { CalculationResults, VehicleInputs } from '../types/ttl-types';

export interface UseVehicleCalculationsReturn {
  calculate: (input: VehicleInputs) => CalculationResults;
}

export function useVehicleCalculations(): UseVehicleCalculationsReturn {
 const calculate = (input: VehicleInputs): CalculationResults => {
    // Validate required inputs
    if (!input.purchasePrice) {
      throw new Error('Purchase price is required');
    }

    const ttlResults = calculateTTL(input);
    const paymentResults = calculatePayment(
      input.purchasePrice,
      input.downPayment || 0,
      ttlResults.totalTTL,
      input.interestRate || 0,
      input.loanTermMonths || 60
    );

    // Calculate TCO
    const tcoResults = calculateTCO(input);

    // Calculate lease comparison
    const leaseComparisonResults = calculateLeaseComparison({
      ...input,
      // Ensure required fields have defaults
      loanStartDate: input.loanStartDate ?? new Date().toISOString().split('T')[0],
      leaseMileage: input.leaseMileage || 12000,
      leaseBuyout: input.leaseBuyout || 0,
      residualValue: input.residualValue || 0,
      moneyFactor: input.moneyFactor || 0
    });

    return {
      ttlResults: ttlResults,
      paymentResults: paymentResults,
      tcoResults: tcoResults,
      leaseComparisonResults: leaseComparisonResults
    };
  };

  return { calculate };
}
