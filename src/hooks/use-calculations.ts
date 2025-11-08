"use client";

import { useCallback, useEffect, useState } from 'react'
import { calculatePayment, calculateTTL } from '../lib/ttl-calculator/calculator'
import { calculateLeaseComparison } from '../lib/ttl-calculator/lease'
import { clearAllCalculations, deleteCalculation, getSavedCalculations, saveCalculation } from '../lib/ttl-calculator/storage'
import { calculateTCO } from '../lib/ttl-calculator/tco'
import type { CalculationResults, SavedCalculation, VehicleInputs } from '../types/ttl-types'
import { logger } from '@/lib/logger'

// Helper function to ensure VehicleInputs has all required fields with defaults
function ensureVehicleInputsComplete(input: Partial<VehicleInputs>): VehicleInputs {
  // Explicitly handle each field to ensure no undefined values in the final result
  const result: VehicleInputs = {
    purchasePrice: input.purchasePrice != null ? input.purchasePrice : 30000,
    tradeInValue: input.tradeInValue != null ? input.tradeInValue : 0,
    vehicleWeight: input.vehicleWeight != null ? input.vehicleWeight : 4000,
    isElectric: input.isElectric != null ? input.isElectric : false,
    isNewVehicle: input.isNewVehicle != null ? input.isNewVehicle : true,
    county: input.county != null && typeof input.county === 'string' ? input.county : 'Dallas',
    loanTermMonths: input.loanTermMonths != null ? input.loanTermMonths : 60,
    interestRate: input.interestRate != null ? input.interestRate : 6.5,
    downPayment: input.downPayment != null ? input.downPayment : 5000,
    paymentFrequency: input.paymentFrequency != null && typeof input.paymentFrequency === 'string' ? input.paymentFrequency : 'monthly',
    zipCode: input.zipCode != null && typeof input.zipCode === 'string' ? input.zipCode : '75201',
    loanStartDate: input.loanStartDate != null && typeof input.loanStartDate === 'string' ? input.loanStartDate : (new Date().toISOString().split('T')[0] as string),
    leaseMileage: input.leaseMileage != null ? input.leaseMileage : 12000,
    leaseBuyout: input.leaseBuyout != null ? input.leaseBuyout : 0,
    residualValue: input.residualValue != null ? input.residualValue : 0,
    moneyFactor: input.moneyFactor != null ? input.moneyFactor : 0,
  };
  
  return result;
}

export function useCalculations(initialInput?: Partial<VehicleInputs> | null) {
  const [vehicleInput, setVehicleInput] = useState<VehicleInputs>(() => {
    return ensureVehicleInputsComplete(initialInput || {});
  });

  const [calculationResults, setCalculationResults] = useState<CalculationResults | null>(null);
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSavedCalculations = useCallback(() => {
    try {
      const calculations = getSavedCalculations();
      setSavedCalculations(calculations);
    } catch (err) {
      setError('Failed to load saved calculations');
      logger.error('Error loading saved calculations:', err as Error);
    }
  }, []);

  // Load saved calculations on mount
  useEffect(() => {
    const loadCalculations = async () => {
      try {
        const calculations = getSavedCalculations();
        setSavedCalculations(calculations);
      } catch (err) {
        setError('Failed to load saved calculations');
        logger.error('Error loading saved calculations:', err as Error);
      }
    };
    loadCalculations();
  }, []);

  const calculate = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate required inputs
      if (!vehicleInput.purchasePrice) {
        throw new Error('Purchase price is required');
      }

      const ttlResults = calculateTTL(vehicleInput);
      const paymentResults = calculatePayment(
        vehicleInput.purchasePrice,
        vehicleInput.downPayment || 0,
        ttlResults.totalTTL,
        vehicleInput.interestRate || 0,
        vehicleInput.loanTermMonths || 60
      );

      // Calculate TCO
      const tcoResults = calculateTCO(vehicleInput);

      // Calculate lease comparison
      const leaseComparisonResults = calculateLeaseComparison({
        ...vehicleInput,
        // Ensure required fields have defaults
        loanStartDate: vehicleInput.loanStartDate ?? new Date().toISOString().split('T')[0],
        leaseMileage: vehicleInput.leaseMileage || 12000,
        leaseBuyout: vehicleInput.leaseBuyout || 0,
        residualValue: vehicleInput.residualValue || 0,
        moneyFactor: vehicleInput.moneyFactor || 0
      });

      setCalculationResults({
        ttlResults: ttlResults,
        paymentResults: paymentResults,
        tcoResults: tcoResults,
        leaseComparisonResults: leaseComparisonResults
      });

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed');
      setIsLoading(false);
      logger.error('Calculation error:', err as Error);
    }
  }, [vehicleInput]);

  const saveCurrentCalculation = useCallback(async (name?: string): Promise<string> => {
    try {
      setIsLoading(true);
      const id = saveCalculation(vehicleInput, name);
      loadSavedCalculations();
      setIsLoading(false);
      return id;
    } catch (err) {
      setError('Failed to save calculation');
      setIsLoading(false);
      throw err;
    }
  }, [vehicleInput, loadSavedCalculations]);

  const loadSavedCalculation = useCallback((id: string) => {
    try {
      const calculation = getSavedCalculations().find(calc => calc.id === id);
      if (calculation) {
        setVehicleInput(calculation.inputs);
        setCalculationResults(calculation.results);
      }
    } catch (err) {
      setError('Failed to load saved calculation');
      logger.error('Error loading saved calculation:', err as Error);
    }
  }, []);

  const deleteSavedCalculation = useCallback((id: string) => {
    try {
      deleteCalculation(id);
      loadSavedCalculations();
    } catch (err) {
      setError('Failed to delete calculation');
      logger.error('Error deleting calculation:', err as Error);
    }
  }, [loadSavedCalculations]);

  const clearAllSaved = useCallback(() => {
    try {
      clearAllCalculations();
      setSavedCalculations([]);
    } catch (err) {
      setError('Failed to clear calculations');
      logger.error('Error clearing calculations:', err as Error);
    }
  }, []);

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
    savedCalculations,
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
