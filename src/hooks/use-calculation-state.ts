/**
 * Calculation State Hook
 * Manages UI state for calculations (loading, error handling, form state)
 * No calculation logic or storage operations
 */

import { useCallback, useState } from 'react';
import type { CalculationResults, VehicleInputs } from '../types/ttl-types';

// Helper function to ensure VehicleInputs has all required fields with defaults
function ensureVehicleInputsComplete(input: Partial<VehicleInputs>): VehicleInputs {
  // Explicitly handle each field to ensure no undefined values in the final result
 const result: VehicleInputs = {
    purchasePrice: input.purchasePrice ?? 30000,
    tradeInValue: input.tradeInValue ?? 0,
    vehicleWeight: input.vehicleWeight ?? 4000,
    isElectric: input.isElectric ?? false,
    isNewVehicle: input.isNewVehicle ?? true,
    county: typeof input.county === 'string' ? input.county : 'Dallas',
    loanTermMonths: input.loanTermMonths ?? 60,
    interestRate: input.interestRate ?? 6.5,
    downPayment: input.downPayment ?? 5000,
    paymentFrequency: typeof input.paymentFrequency === 'string' ? input.paymentFrequency : 'monthly',
    zipCode: typeof input.zipCode === 'string' ? input.zipCode : '75201',
    // Use static default date to avoid SSR/Client hydration mismatch
    // Will be updated on client after mount if needed
    loanStartDate: typeof input.loanStartDate === 'string' ? input.loanStartDate : '2024-01-01',
    leaseMileage: input.leaseMileage ?? 12000,
    leaseBuyout: input.leaseBuyout ?? 0,
    residualValue: input.residualValue ?? 0,
    moneyFactor: input.moneyFactor ?? 0,
  };

  return result;
}

export interface UseCalculationStateReturn {
  vehicleInput: VehicleInputs;
  setVehicleInput: React.Dispatch<React.SetStateAction<VehicleInputs>>;
  calculationResults: CalculationResults | null;
  setCalculationResults: React.Dispatch<React.SetStateAction<CalculationResults | null>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  updateInput: (field: keyof VehicleInputs, value: unknown) => void;
}

export function useCalculationState(initialInput?: Partial<VehicleInputs> | null): UseCalculationStateReturn {
  const [vehicleInput, setVehicleInput] = useState<VehicleInputs>(() => {
    return ensureVehicleInputsComplete(initialInput || {});
  });

  const [calculationResults, setCalculationResults] = useState<CalculationResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateInput = useCallback((field: keyof VehicleInputs, value: unknown) => {
    setVehicleInput(prev => {
      // Ensure required string fields are not set to undefined or null
      let safeValue = value;
      if (field === 'loanStartDate' && (!value || typeof value !== 'string')) {
        safeValue = new Date().toISOString().split('T')[0];
      } else if (field === 'county' && (!value || typeof value !== 'string')) {
        safeValue = 'Dallas';
      } else if (field === 'paymentFrequency' && (!value || (value !== 'monthly' && value !== 'biweekly' && value !== 'weekly'))) {
        safeValue = 'monthly';
      } else if (field === 'zipCode' && (!value || typeof value !== 'string')) {
        safeValue = '75201';
      }

      return {
        ...prev,
        [field]: safeValue
      };
    });
  }, []);

  return {
    vehicleInput,
    setVehicleInput,
    calculationResults,
    setCalculationResults,
    isLoading,
    setIsLoading,
    error,
    setError,
    updateInput
  };
}
