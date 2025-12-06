/**
 * Calculation Storage Hook
 * Handles all storage operations for calculations (save, load, delete)
 * No calculation logic or UI state management
 */

import { useCallback } from 'react';
import {
  clearAllCalculations,
  deleteCalculation,
  getSavedCalculations,
  saveCalculation as saveCalculationLib
} from '../lib/ttl-calculator/storage';
import type { CalculationResults, SavedCalculation, VehicleInputs } from '../types/ttl-types';

export interface UseCalculationStorageReturn {
  savedCalculations: SavedCalculation[];
  loadSavedCalculations: () => SavedCalculation[];
  saveCalculation: (input: VehicleInputs, results: CalculationResults, name?: string) => string;
  deleteSavedCalculation: (id: string) => void;
  clearAllSaved: () => void;
}

export function useCalculationStorage(): UseCalculationStorageReturn {
  const loadSavedCalculations = useCallback((): SavedCalculation[] => {
    return getSavedCalculations();
  }, []);

  const saveCalculation = useCallback((
    input: VehicleInputs,
    results: CalculationResults,
    name?: string
  ): string => {
    // Use the pre-calculated results to avoid recalculation
    return saveCalculationLib(input, name, results);
  }, []);

  const deleteSavedCalculation = useCallback((id: string) => {
    deleteCalculation(id);
 }, []);

  const clearAllSaved = useCallback(() => {
    clearAllCalculations();
  }, []);

  return {
    savedCalculations: [],
    loadSavedCalculations,
    saveCalculation,
    deleteSavedCalculation,
    clearAllSaved
  };
}
