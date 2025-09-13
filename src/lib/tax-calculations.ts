import type { TaxData } from '@/types/paystub'
import { TAX_DATA } from './paystub-data'

export const calculateFederalTax = (
  grossPay: number,
  filingStatus: keyof TaxData['federalBrackets'],
  annualGross: number,
  year: number
) => {
  const brackets = TAX_DATA[year]?.federalBrackets[filingStatus] || TAX_DATA[year]?.federalBrackets.single || TAX_DATA[2024].federalBrackets.single
  let tax = 0
  let previousLimit = 0

  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i]
    const taxableInThisBracket = Math.min(annualGross, bracket.limit) - previousLimit

    if (taxableInThisBracket > 0) {
      const portionInBracket = Math.min(grossPay, taxableInThisBracket)
      tax += portionInBracket * bracket.rate

      if (portionInBracket >= grossPay) {
        break
      }

      grossPay -= portionInBracket
    }

    previousLimit = bracket.limit

    if (grossPay <= 0) {
      break
    }
  }

  return tax
}

export const calculateSocialSecurity = (grossPay: number, ytdGross: number, year: number) => {
  const ssRate = TAX_DATA[year].ssRate
  const ssWageBase = TAX_DATA[year].ssWageBase

  if (ytdGross >= ssWageBase) return 0

  if (ytdGross + grossPay > ssWageBase) {
    return (ssWageBase - ytdGross) * ssRate
  }

  return grossPay * ssRate
}

export const calculateMedicare = (
  grossPay: number,
  ytdGross: number,
  filingStatus: keyof TaxData['additionalMedicareThreshold'],
  year: number
) => {
  const medicareRate = TAX_DATA[year]?.medicareRate || TAX_DATA[2024].medicareRate
  const additionalMedicareRate = TAX_DATA[year]?.additionalMedicareRate || TAX_DATA[2024].additionalMedicareRate
  const threshold = TAX_DATA[year]?.additionalMedicareThreshold[filingStatus] || TAX_DATA[year]?.additionalMedicareThreshold.single || TAX_DATA[2024].additionalMedicareThreshold.single

  const medicare = grossPay * medicareRate
  let additionalMedicare = 0

  if (ytdGross > threshold) {
    additionalMedicare = grossPay * additionalMedicareRate
  } else if (ytdGross + grossPay > threshold) {
    additionalMedicare = (ytdGross + grossPay - threshold) * additionalMedicareRate
  }

  return medicare + additionalMedicare
}
