// Native paystub utilities - logic only, no data bloat

import payDates from '@/data/pay-dates.json'
import type { TaxData } from '@/types/paystub'

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
export function getCurrentTaxData(): TaxData {
  return {
    ssWageBase: 168600, // 2025 limit
    ssRate: 0.062,
    medicareRate: 0.0145,
    additionalMedicareRate: 0.009,
    additionalMedicareThreshold: {
      single: 200000,
      marriedJoint: 250000,
      marriedSeparate: 125000,
      headOfHousehold: 200000,
      qualifyingSurvivingSpouse: 250000
    },
    federalBrackets: {
      single: [
        { limit: 11000, rate: 0.10 },
        { limit: 44725, rate: 0.12 },
        { limit: 95375, rate: 0.22 },
        { limit: 182050, rate: 0.24 },
        { limit: 231250, rate: 0.32 },
        { limit: 578125, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      marriedJoint: [
        { limit: 22000, rate: 0.10 },
        { limit: 89450, rate: 0.12 },
        { limit: 190750, rate: 0.22 },
        { limit: 364200, rate: 0.24 },
        { limit: 462500, rate: 0.32 },
        { limit: 693750, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      marriedSeparate: [
        { limit: 11000, rate: 0.10 },
        { limit: 44725, rate: 0.12 },
        { limit: 95375, rate: 0.22 },
        { limit: 182050, rate: 0.24 },
        { limit: 231250, rate: 0.32 },
        { limit: 346875, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      headOfHousehold: [
        { limit: 15700, rate: 0.10 },
        { limit: 59850, rate: 0.12 },
        { limit: 95350, rate: 0.22 },
        { limit: 182050, rate: 0.24 },
        { limit: 231250, rate: 0.32 },
        { limit: 578100, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      qualifyingSurvivingSpouse: [
        { limit: 22000, rate: 0.10 },
        { limit: 89450, rate: 0.12 },
        { limit: 190750, rate: 0.22 },
        { limit: 364200, rate: 0.24 }
      ]
    }
  }
}