import type { TaxData } from '@/types/paystub'
import { getTaxDataForYear } from './tax-data'

/**
 * Get current tax year data (simplified)
 */
export function getCurrentTaxData(year?: number): TaxData {
	return getTaxDataForYear(year)
}
