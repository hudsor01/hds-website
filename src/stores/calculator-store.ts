import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CalculationResults, VehicleInputs, SavedCalculation } from '@/types/ttl-types';
import { calculatePayment, calculateTTL } from '@/lib/ttl-calculator/calculator';
import { calculateLeaseComparison } from '@/lib/ttl-calculator/lease';
import { calculateTCO } from '@/lib/ttl-calculator/tco';
import { clearAllCalculations, deleteCalculation, getSavedCalculations, saveCalculation } from '@/lib/ttl-calculator/storage';
import { logger } from '@/lib/logger';

// Helper function to ensure VehicleInputs has all required fields with defaults
function ensureVehicleInputsComplete(input: Partial<VehicleInputs>): VehicleInputs {
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
    loanStartDate: typeof input.loanStartDate === 'string' ? input.loanStartDate : '2024-01-01',
    leaseMileage: input.leaseMileage ?? 12000,
    leaseBuyout: input.leaseBuyout ?? 0,
    residualValue: input.residualValue ?? 0,
    moneyFactor: input.moneyFactor ?? 0,
  };
  return result;
}

interface CalculatorState {
  // Current calculation state
  vehicleInput: VehicleInputs;
  calculationResults: CalculationResults | null;
  isLoading: boolean;
  error: string | null;

  // Saved calculations
  savedCalculations: SavedCalculation[];

  // Actions
  setVehicleInput: (input: VehicleInputs) => void;
  updateInput: (field: keyof VehicleInputs, value: unknown) => void;
  setCalculationResults: (results: CalculationResults | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Calculation actions
  calculate: () => void;
  saveCurrentCalculation: (name?: string) => Promise<string>;
  loadSavedCalculation: (id: string) => void;
  deleteSavedCalculation: (id: string) => void;
  clearAllSaved: () => void;
  loadSavedCalculations: () => void;
}

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set, get) => ({
      // Initial state
      vehicleInput: ensureVehicleInputsComplete({}),
      calculationResults: null,
      isLoading: false,
      error: null,
      savedCalculations: [],

      // Actions
      setVehicleInput: (input) => set({ vehicleInput: input }),

      updateInput: (field, value) => {
        set((state) => {
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
            vehicleInput: {
              ...state.vehicleInput,
              [field]: safeValue
            }
          };
        });
      },

      setCalculationResults: (results) => set({ calculationResults: results }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Calculation logic (placeholder - will integrate with calculation functions)
      calculate: () => {
        try {
          set({ isLoading: true, error: null });
          const input = ensureVehicleInputsComplete(get().vehicleInput);

          const ttlResults = calculateTTL(input);
          const paymentResults = calculatePayment(
            input.purchasePrice,
            input.downPayment,
            ttlResults.totalTTL,
            input.interestRate,
            input.loanTermMonths
          );
          const tcoResults = calculateTCO(input);
          const leaseComparisonResults = calculateLeaseComparison(input);

          set({
            calculationResults: {
              ttlResults,
              paymentResults,
              tcoResults,
              leaseComparisonResults,
            },
            isLoading: false,
          });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Calculation failed',
            isLoading: false
          });
          logger.error('Calculation error:', err as Error);
        }
      },

      saveCurrentCalculation: async (_name?: string) => {
        try {
          set({ isLoading: true });
          const state = get();
          const id = saveCalculation(state.vehicleInput, _name, state.calculationResults ?? undefined);
          const calculations = getSavedCalculations();
          set({ savedCalculations: calculations, isLoading: false });
          return id;
        } catch (err) {
          logger.error('Error saving calculation:', err as Error);
          set({ error: 'Failed to save calculation', isLoading: false });
          throw err;
        }
      },

      loadSavedCalculation: (id) => {
        try {
          const calculation = get().savedCalculations.find(calc => calc.id === id);
          if (calculation) {
            set({
              vehicleInput: calculation.inputs,
              calculationResults: calculation.results
            });
          }
        } catch (err) {
          set({ error: 'Failed to load saved calculation' });
          logger.error('Error loading saved calculation:', err as Error);
        }
      },

      deleteSavedCalculation: (id) => {
        try {
          deleteCalculation(id);
          set({ savedCalculations: getSavedCalculations() });
        } catch (err) {
          set({ error: 'Failed to delete calculation' });
          logger.error('Error deleting calculation:', err as Error);
        }
      },

      clearAllSaved: () => {
        try {
          clearAllCalculations();
          set({ savedCalculations: [] });
        } catch (err) {
          set({ error: 'Failed to clear calculations' });
          logger.error('Error clearing calculations:', err as Error);
        }
      },

      loadSavedCalculations: () => {
        try {
          const calculations = getSavedCalculations();
          set({ savedCalculations: calculations });
        } catch (err) {
          set({ error: 'Failed to load saved calculations' });
          logger.error('Error loading saved calculations:', err as Error);
        }
      },
    }),
    {
      name: 'calculator-store',
      partialize: (state) => ({
        vehicleInput: state.vehicleInput,
        savedCalculations: state.savedCalculations,
      }),
    }
  )
);
