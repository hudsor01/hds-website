/**
 * Paystub Calculator Hook
 * Performs paystub calculations with memoization for expensive operations
 */

import { useMemo } from 'react';
import { calculatePaystubTotals, type PaystubCalculationParams, type PaystubCalculationResult } from '@/lib/paystub-calculator/calculate-paystub-totals';
import { validatePaystubInputs } from '@/lib/paystub-calculator/validation';
import { logger } from '@/lib/logger';

/**
 * Custom hook for Paystub calculator computations
 * Optimized for React 19 with useMemo for expensive calculations
 */
export function usePaystubCalculator(params: PaystubCalculationParams) {
  // Destructure params for stable dependency tracking
  const {
    hourlyRate,
    hoursPerPeriod,
    filingStatus,
    taxYear,
    state,
    payFrequency,
    overtimeHours,
    overtimeRate,
    additionalDeductions
  } = params;

  // Create a stable string representation of additional deductions for dependency tracking
  const additionalDeductionsString = JSON.stringify(additionalDeductions);

  // Create a stable params object to prevent unnecessary recalculations
  const stableParams = useMemo(() => ({
    hourlyRate,
    hoursPerPeriod,
    filingStatus,
    taxYear,
    state,
    payFrequency,
    overtimeHours,
    overtimeRate,
    additionalDeductions: JSON.parse(additionalDeductionsString) as typeof additionalDeductions
  }), [
    hourlyRate,
    hoursPerPeriod,
    filingStatus,
    taxYear,
    state,
    payFrequency,
    overtimeHours,
    overtimeRate,
    additionalDeductionsString
  ]);

  // Memoize calculation results
  const calculationResult: PaystubCalculationResult | null = useMemo(() => {
    try {
      // Validate before calculating to avoid unnecessary errors
      const validation = validatePaystubInputs(stableParams);
      if (!validation.isValid) {
        return null;
      }

      return calculatePaystubTotals(stableParams);
    } catch (error) {
      logger.error('Paystub calculation error:', error as Error);
      return null;
    }
  }, [stableParams]);

  // Calculate annual totals
  const annualTotals = useMemo(() => {
    if (!calculationResult) {
      return null;
    }

    return {
      grossPay: calculationResult.totals.grossPay,
      netPay: calculationResult.totals.netPay,
      totalTax: calculationResult.totals.federalTax +
                calculationResult.totals.stateTax +
                calculationResult.totals.socialSecurity +
                calculationResult.totals.medicare,
      totalDeductions: calculationResult.totals.otherDeductions
    };
  }, [calculationResult]);

  return {
    calculationResult,
    annualTotals,
    hasErrors: !calculationResult,
    payPeriods: calculationResult?.payPeriods || [],
    totals: calculationResult?.totals || null
  };
}
