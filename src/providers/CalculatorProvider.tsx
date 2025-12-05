"use client";

import { type ReactNode, createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { useQueryState, parseAsString } from 'nuqs'
import { toast } from 'sonner'
import { useCalculations } from '../hooks/use-calculations'
import { loadCalculation } from '@/app/actions/ttl-calculator'
import { logger } from '@/lib/logger'
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
  shareCode: string | null;
  isLoadingShared: boolean;
}

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const [shareCode] = useQueryState('c', parseAsString);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'loaded'>('idle');
  const calculations = useCalculations();

  // Use ref to prevent duplicate loads
  const loadAttemptedRef = useRef(false);

  // Derive loading state
  const isLoadingShared = loadState === 'loading';

  // Load shared calculation function
  const loadSharedCalculation = useCallback(async (code: string) => {
    try {
      const result = await loadCalculation(code);
      if (result.success && result.data) {
        // Update the vehicle inputs with the shared data
        Object.entries(result.data.inputs).forEach(([key, value]) => {
          calculations.updateInput(key as keyof VehicleInputs, value);
        });
        toast.success(result.data.name ? `Loaded: ${result.data.name}` : 'Shared calculation loaded');
        logger.info('Loaded shared calculation', { shareCode: code });
      } else {
        toast.error(result.error || 'Failed to load shared calculation');
        logger.warn('Failed to load shared calculation', { shareCode: code, error: result.error });
      }
    } catch (err) {
      toast.error('Failed to load shared calculation');
      logger.error('Error loading shared calculation', { error: err });
    } finally {
      setLoadState('loaded');
    }
  }, [calculations]);

  // Load shared calculation from URL on mount
  useEffect(() => {
    if (!shareCode || loadAttemptedRef.current) {
      return;
    }

    loadAttemptedRef.current = true;
    setLoadState('loading');
    void loadSharedCalculation(shareCode);
  }, [shareCode, loadSharedCalculation]);

  return (
    <CalculatorContext.Provider value={{ ...calculations, shareCode, isLoadingShared }}>
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
