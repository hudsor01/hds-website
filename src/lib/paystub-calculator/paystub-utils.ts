import payDates from '@/data/pay-dates.json'
import type { TaxData } from '@/types/paystub'
import { getTaxDataForYear } from './tax-data'

/**
 * Get pay frequencies options
 */
export function getPayFrequencies() {
  return payDates.payFrequencies
}

/**
 * Get default periods for pay frequency
 */
export function getDefaultPeriods() {
  return payDates.defaultPeriods
}

/**
 * Get current tax year data (simplified)
 */
export function getCurrentTaxData(year?: number): TaxData {
  return getTaxDataForYear(year);
}
