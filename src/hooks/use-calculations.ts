"use client";

import { logger } from '@/lib/logger';
import { useCallback, useEffect, useState } from 'react';
import type { SavedCalculation, VehicleInputs } from '../types/ttl-types';
import { useCalculationState } from './use-calculation-state';
import { useCalculationStorage } from './use-calculation-storage';
import { useVehicleCalculations } from './use-vehicle-calculations';

export function useCalculations(initialInput?: Partial<VehicleInputs> | null) {
  // Use the specialized hooks
  const { calculate: performCalculation } = useVehicleCalculations();
  const {
    loadSavedCalculations,
    saveCalculation,
    deleteSavedCalculation,
    clearAllSaved
  } = useCalculationStorage();
  const {
    vehicleInput,
    setVehicleInput,
    calculationResults,
    setCalculationResults,
    isLoading,
    setIsLoading,
    error,
    setError,
    updateInput
  } = useCalculationState(initialInput);

  // Local state for saved calculations since the storage hook doesn't manage this
  const [localSavedCalculations, setLocalSavedCalculations] = useState<SavedCalculation[]>([]);

 const loadSavedCalculationsWithState = useCallback(() => {
    try {
      const calculations = loadSavedCalculations();
      setLocalSavedCalculations(calculations);
    } catch (err) {
      setError('Failed to load saved calculations');
      logger.error('Error loading saved calculations:', err as Error);
    }
  }, [loadSavedCalculations, setError]);

  // Load saved calculations on mount
  useEffect(() => {
    loadSavedCalculationsWithState();
 }, [loadSavedCalculationsWithState]);

  const calculate = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate required inputs
      if (!vehicleInput.purchasePrice) {
        throw new Error('Purchase price is required');
      }

      const results = performCalculation(vehicleInput);
      setCalculationResults(results);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed');
      setIsLoading(false);
      logger.error('Calculation error:', err as Error);
    }
  }, [vehicleInput, performCalculation, setCalculationResults, setIsLoading, setError]);

  const saveCurrentCalculation = useCallback(async (name?: string): Promise<string> => {
    try {
      setIsLoading(true);
      const id = saveCalculation(vehicleInput, calculationResults ?? { ttlResults: undefined, paymentResults: undefined, tcoResults: undefined, leaseComparisonResults: undefined }, name);
      loadSavedCalculationsWithState();
      setIsLoading(false);
      return id;
    } catch (err) {
      setError('Failed to save calculation');
      setIsLoading(false);
      throw err;
    }
  }, [vehicleInput, calculationResults, saveCalculation, loadSavedCalculationsWithState, setIsLoading, setError]);

  const loadSavedCalculation = useCallback((id: string) => {
    try {
      const calculation = localSavedCalculations.find(calc => calc.id === id);
      if (calculation) {
        setVehicleInput(calculation.inputs);
        setCalculationResults(calculation.results);
      }
    } catch (err) {
      setError('Failed to load saved calculation');
      logger.error('Error loading saved calculation:', err as Error);
    }
  }, [localSavedCalculations, setVehicleInput, setCalculationResults, setError]);

  // Auto-calculate when inputs change
  useEffect(() => {
    // Defer calculation to the next tick to avoid synchronous setState in effect
    const timeoutId = setTimeout(() => calculate(), 0);
    return () => clearTimeout(timeoutId);
  }, [calculate]);

  return {
    vehicleInput,
    setVehicleInput,
    calculationResults,
    savedCalculations: localSavedCalculations,
    isLoading,
    error,
    calculate,
    saveCurrentCalculation,
    loadSavedCalculation,
    deleteSavedCalculation,
    clearAllSaved,
    updateInput
  };
}
