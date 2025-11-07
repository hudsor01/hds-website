"use client";

import { type ReactNode, createContext, useContext } from 'react'
import { useCalculations } from '../hooks/use-calculations'
import type { CalculationResults, VehicleInputs, SavedCalculation } from '../types/ttl-types';

interface CalculatorContextType {
  vehicleInput: VehicleInputs;
  calculationResults: CalculationResults | null;
  savedCalculations: Array<SavedCalculation>;
  isLoading: boolean;
  error: string | null;
  calculate: () => void;
  saveCurrentCalculation: (name?: string) => Promise<string>;
  loadSavedCalculation: (id: string) => void;
  deleteSavedCalculation: (id: string) => void;
  clearAllSaved: () => void;
  updateInput: (field: keyof VehicleInputs, value: unknown) => void;
}

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const calculations = useCalculations();

  return (
    <CalculatorContext.Provider value={calculations}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator() {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
}
