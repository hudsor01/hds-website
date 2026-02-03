import { logger } from '@/lib/logger';
import type { CalculationResults, SavedCalculation, VehicleInputs } from '@/types/ttl-types';
import { calculatePayment, calculateTTL } from './calculator';
import { calculateLeaseComparison } from './lease';
import { calculateTCO } from './tco';

const STORAGE_KEY = 'texas-ttl-saved-calculations';
const MAX_SAVED = 20;

/**
 * Get all saved calculations from localStorage
 * Client-side only with SSR safety checks
 */
export function getSavedCalculations(): SavedCalculation[] {
  // Check if we're in a browser environment to prevent SSR crashes
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    logger.error('Error loading saved calculations:', error as Error);
    return [];
  }
}

/**
 * Save a calculation with optional pre-computed results
 * Optimized for Next.js 16 with better error handling and lazy calculation
 */
export function saveCalculation(input: VehicleInputs, name?: string, results?: CalculationResults): string {
  // Check if we're in a browser environment to prevent SSR crashes
  if (typeof window === 'undefined') {
    throw new Error('Cannot save calculations on server side');
  }

  try {
    const calculations = getSavedCalculations();

    // Calculate all results if not provided (lazy evaluation)
    const calculationResults = results || (() => {
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

      return {
        ttlResults: ttlResults,
        paymentResults: paymentResults,
        tcoResults: tcoResults,
        leaseComparisonResults: leaseComparisonResults
      };
    })();

    const id = `calc_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const calculation: SavedCalculation = {
      id,
      name: name || `Vehicle - ${new Date().toLocaleDateString()}`,
      timestamp: Date.now(),
      inputs: input,
      results: calculationResults
    };

    // Add new calculation at the beginning
    calculations.unshift(calculation);

    // Keep only the most recent MAX_SAVED calculations
    const trimmed = calculations.slice(0, MAX_SAVED);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    return id;
  } catch (error) {
    logger.error('Error saving calculation:', error as Error);
    throw new Error('Failed to save calculation');
  }
}

/**
 * Load a specific calculation by ID
 * Pure function for React Server Components compatibility where possible
 */
export function loadCalculation(id: string): SavedCalculation | null {
  const calculations = getSavedCalculations();
  return calculations.find(calc => calc.id === id) || null;
}

/**
 * Delete a calculation by ID
 * Client-side only with proper error handling
 */
export function deleteCalculation(id: string): void {
  // Check if we're in a browser environment to prevent SSR crashes
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const calculations = getSavedCalculations();
    const filtered = calculations.filter(calc => calc.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    logger.error('Error deleting calculation:', error as Error);
  }
}

/**
 * Clear all saved calculations
 * Client-side only with proper cleanup
 */
export function clearAllCalculations(): void {
  // Check if we're in a browser environment to prevent SSR crashes
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    logger.error('Error clearing calculations:', error as Error);
  }
}

/**
 * Update the name of a saved calculation
 * Client-side only with validation
 */
export function updateCalculationName(id: string, newName: string): void {
  // Check if we're in a browser environment to prevent SSR crashes
  if (typeof window === 'undefined') {
    return;
  }

  if (!newName?.trim()) {
    logger.warn('Cannot update calculation name: new name is empty');
    return;
  }

  try {
    const calculations = getSavedCalculations();
    const updated = calculations.map(calc =>
      calc.id === id ? { ...calc, name: newName.trim() } : calc
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    logger.error('Error updating calculation name:', error as Error);
  }
}

/**
 * Get calculation statistics for analytics
 * Pure function for dashboard components
 */
export function getCalculationStats(): {
  total: number;
  oldest: number | null;
  newest: number | null;
} {
  const calculations = getSavedCalculations();

  if (calculations.length === 0) {
    return { total: 0, oldest: null, newest: null };
  }

  const timestamps = calculations.map(calc => calc.timestamp);
  return {
    total: calculations.length,
    oldest: Math.min(...timestamps),
    newest: Math.max(...timestamps)
  };
}
