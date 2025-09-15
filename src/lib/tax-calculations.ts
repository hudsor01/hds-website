import type { TaxData } from "@/types/paystub";
import { getCurrentTaxData } from "./paystub-utils";

export const calculateFederalTax = (
  grossPay: number,
  filingStatus: keyof TaxData["federalBrackets"],
  annualGross: number,
  _year?: number
) => {
  const yearData = getCurrentTaxData();
  if (!yearData) {
    return 0;
  }

  const brackets =
    yearData.federalBrackets?.[filingStatus] ||
    yearData.federalBrackets?.single;

  if (!brackets || brackets.length === 0) {
    return 0;
  }

  let tax = 0;
  let previousLimit = 0;
  let remainingGrossPay = grossPay;
  const taxableIncome = annualGross + grossPay;

  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    if (!bracket) {continue;}

    const bracketLimit = bracket.limit === Infinity ? Infinity : bracket.limit;

    // Calculate the portion of annual income that falls in this bracket
    const bracketStart = previousLimit;
    const bracketEnd = bracketLimit;
    const taxableInThisBracket = Math.max(
      0,
      Math.min(taxableIncome, bracketEnd) - bracketStart
    );

    // If this bracket has no taxable income, skip it
    if (taxableInThisBracket <= 0) {
      previousLimit = bracketLimit;
      continue;
    }

    // Calculate how much of the current pay period falls in this bracket
    let portionInBracket = 0;
    if (annualGross < bracketEnd) {
      // Current pay period overlaps with this bracket
      const bracketOverlapStart = Math.max(annualGross, bracketStart);
      const bracketOverlapEnd = Math.min(taxableIncome, bracketEnd);
      portionInBracket = Math.min(
        remainingGrossPay,
        bracketOverlapEnd - bracketOverlapStart
      );
    }

    if (portionInBracket > 0) {
      tax += portionInBracket * bracket.rate;
      remainingGrossPay -= portionInBracket;

      if (remainingGrossPay <= 0) {
        break;
      }
    }

    previousLimit = bracketLimit;
  }

  return tax;
};

export const calculateSocialSecurity = (
  grossPay: number,
  ytdGross: number,
  _year?: number
) => {
  const yearData = getCurrentTaxData();
  if (!yearData) {
    return 0;
  }

  const ssRate = yearData.ssRate;
  const ssWageBase = yearData.ssWageBase;

  if (ytdGross >= ssWageBase) {return 0;}

  if (ytdGross + grossPay > ssWageBase) {
    return (ssWageBase - ytdGross) * ssRate;
  }

  return grossPay * ssRate;
};

export const calculateMedicare = (
  grossPay: number,
  ytdGross: number,
  filingStatus: keyof TaxData["additionalMedicareThreshold"],
  _year?: number
) => {
  const yearData = getCurrentTaxData();
  if (!yearData) {
    return 0;
  }

  const medicareRate = yearData.medicareRate;
  const additionalMedicareRate = yearData.additionalMedicareRate;
  const threshold =
    yearData.additionalMedicareThreshold?.[filingStatus] ||
    yearData.additionalMedicareThreshold?.single ||
    getCurrentTaxData()?.additionalMedicareThreshold?.single ||
    0;

  const medicare = grossPay * medicareRate;
  let additionalMedicare = 0;

  if (ytdGross > threshold) {
    additionalMedicare = grossPay * additionalMedicareRate;
  } else if (ytdGross + grossPay > threshold) {
    additionalMedicare =
      (ytdGross + grossPay - threshold) * additionalMedicareRate;
  }

  return medicare + additionalMedicare;
};
