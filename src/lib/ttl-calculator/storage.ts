import type { SavedCalculation, VehicleInputs } from '../../types/ttl-types'
import { calculatePayment, calculateTTL } from './calculator'
import { calculateLeaseComparison } from './lease'
import { calculateTCO } from './tco'

const STORAGE_KEY = 'texas-ttl-saved-calculations';
const MAX_SAVED = 20;

export function getSavedCalculations(): SavedCalculation[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.warn('Error loading saved calculations:', error);
    return [];
  }
}

export function saveCalculation(input: VehicleInputs, name?: string): string {
 try {
    const calculations = getSavedCalculations();

    // Calculate all results
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

    const id = `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const calculation: SavedCalculation = {
      id,
      name: name || `Vehicle - ${new Date().toLocaleDateString()}`,
      timestamp: Date.now(),
      inputs: input,
      results: {
        ttlResults: ttlResults,
        paymentResults: paymentResults,
        tcoResults: tcoResults,
        leaseComparisonResults: leaseComparisonResults
      }
    };

    // Add new calculation at the beginning
    calculations.unshift(calculation);

    // Keep only the most recent MAX_SAVED calculations
    const trimmed = calculations.slice(0, MAX_SAVED);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    return id;
  } catch (error) {
    console.warn('Error saving calculation:', error);
    throw new Error('Failed to save calculation');
  }
}

export function loadCalculation(id: string): SavedCalculation | null {
  const calculations = getSavedCalculations();
  return calculations.find(calc => calc.id === id) || null;
}

export function deleteCalculation(id: string): void {
  try {
    const calculations = getSavedCalculations();
    const filtered = calculations.filter(calc => calc.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.warn('Error deleting calculation:', error);
  }
}

export function clearAllCalculations(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Error clearing calculations:', error);
  }
}

export function updateCalculationName(id: string, newName: string): void {
  try {
    const calculations = getSavedCalculations();
    const updated = calculations.map(calc =>
      calc.id === id ? { ...calc, name: newName } : calc
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('Error updating calculation name:', error);
  }
}
