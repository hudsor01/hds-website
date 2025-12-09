import type { PaymentResults, TTLResults, VehicleInputs } from '../../types/ttl-types'

// Texas county-specific fees - using more comprehensive data
// Define the CountyFees type
type CountyFees = Record<string, { titleFee: number; localFees: number; emissionsFee: number }>;

export const COUNTY_FEES: CountyFees = {
  'Travis': { titleFee: 33, localFees: 21.50, emissionsFee: 8.25 },
  'Harris': { titleFee: 33, localFees: 11.50, emissionsFee: 8.25 },
  'Dallas': { titleFee: 33, localFees: 16.75, emissionsFee: 8.25 },
  'Bexar': { titleFee: 33, localFees: 16.75, emissionsFee: 8.25 },
  'Tarrant': { titleFee: 33, localFees: 16.75, emissionsFee: 8.25 },
  'Collin': { titleFee: 33, localFees: 11.50, emissionsFee: 0 },
  'Denton': { titleFee: 33, localFees: 11.50, emissionsFee: 0 },
  'El Paso': { titleFee: 28, localFees: 6.50, emissionsFee: 0 },
  'Fort Bend': { titleFee: 33, localFees: 11.50, emissionsFee: 0 },
  'Montgomery': { titleFee: 33, localFees: 11.50, emissionsFee: 0 },
  'Williamson': { titleFee: 33, localFees: 16.75, emissionsFee: 0 },
  'Hidalgo': { titleFee: 33, localFees: 16.75, emissionsFee: 0 },
  'Cameron': { titleFee: 33, localFees: 16.75, emissionsFee: 0 },
  'Guadalupe': { titleFee: 33, localFees: 16.75, emissionsFee: 0 },
  'McLennan': { titleFee: 33, localFees: 16.75, emissionsFee: 0 },
  'Brazoria': { titleFee: 33, localFees: 11.50, emissionsFee: 0 },
  'Nueces': { titleFee: 33, localFees: 16.75, emissionsFee: 0 },
  'Midland': { titleFee: 33, localFees: 16.75, emissionsFee: 0 },
  'Bastrop': { titleFee: 33, localFees: 16.75, emissionsFee: 0 },
  'Default': { titleFee: 33, localFees: 15.75, emissionsFee: 0 }
};

// Texas state fees - updated with current rates
const TEXAS_SALES_TAX_RATE = 0.0625; // 6.25% - updated to current rate
const BASE_REGISTRATION_FEE = 50.75; // Standard vehicle ≤6,000 lbs - updated
const PROCESSING_FEE = 4.75; // Updated processing fee
const INSURANCE_VERIFICATION_FEE = 1.00; // Updated insurance verification fee
const INSPECTION_FEE = 7.50; // Updated inspection fee
const NEW_VEHICLE_INSPECTION_FEE = 16.75; // 2-year registration - updated
const EV_FEE_ANNUAL = 200; // Electric vehicle fee - updated for 2024

/**
 * Calculate registration fee based on vehicle weight and new vehicle status
 * Optimized for Next.js 16 with memoization-friendly pure function
 */
export function calculateRegistrationFee(isNewVehicle: boolean, vehicleWeight: number): number {
  const weight = vehicleWeight || 4000; // Default to average car weight if not provided
  let baseFee = BASE_REGISTRATION_FEE;

  // Use mutually exclusive conditions for weight tiers
  if (weight > 10000) {
    baseFee = 60.00; // Over 10,000 lbs
  } else if (weight > 6000) {
    baseFee = 54.00; // 6,001-10,000 lbs
  }

  const inspectionFee = isNewVehicle ? NEW_VEHICLE_INSPECTION_FEE : INSPECTION_FEE;

  return baseFee + PROCESSING_FEE + INSURANCE_VERIFICATION_FEE + inspectionFee;
}

/**
 * Calculate Texas Title & License fees
 * Pure function optimized for React Server Components and memoization
 */
export function calculateTTL(input: VehicleInputs): TTLResults {
  const countyData = COUNTY_FEES[input.county] || COUNTY_FEES['Default'];
  if (!countyData) {
    throw new Error(`County data not found and default fallback failed for county: ${input.county}`);
  }

  // Calculate taxable amount (purchase price minus trade-in)
  const taxableAmount = Math.max(0, input.purchasePrice - input.tradeInValue);

  // Sales tax
  const salesTax = taxableAmount * TEXAS_SALES_TAX_RATE;

  // Title fee
  const titleFee = countyData.titleFee + countyData.localFees;

  // Registration fees
  const registrationFees = calculateRegistrationFee(input.isNewVehicle, input.vehicleWeight);

  // Processing fees (already included in registration calculation)
  const processingFees = 0;

  // EV fee (if electric vehicle)
  const evFee = input.isElectric ? EV_FEE_ANNUAL : 0;

  // Emissions testing fee (county-specific)
  const emissions = countyData.emissionsFee;

  // Total TTL
  const totalTTL = salesTax + titleFee + registrationFees + evFee + emissions;

  return {
    salesTax,
    titleFee,
    registrationFees,
    processingFees,
    evFee,
    emissions,
    totalTTL
  };
}

/**
 * Calculate monthly payment using standard amortization formula
 * Optimized for performance with early returns and React Server Components compatibility
 */
export function calculatePayment(
  purchasePrice: number,
  downPayment: number,
  ttlAmount: number,
  interestRate: number,
  termMonths: number
): PaymentResults {
  // Total amount to finance
  const loanAmount = purchasePrice - downPayment + ttlAmount;

  if (loanAmount <= 0 || termMonths <= 0) {
    return {
      loanAmount: 0,
      monthlyPayment: 0,
      biweeklyPayment: 0,
      totalInterest: 0,
      totalFinanced: 0
    };
  }

  // If interest rate is 0, simple division
  if (interestRate === 0) {
    return {
      loanAmount: loanAmount,
      monthlyPayment: loanAmount / termMonths,
      biweeklyPayment: (loanAmount / termMonths) / 2,
      totalInterest: 0,
      totalFinanced: loanAmount
    };
  }

  // Monthly interest rate
  const monthlyRate = interestRate / 100 / 12;

  // Monthly payment formula: P * [r(1+r)^n] / [(1+r)^n - 1]
  const monthlyPayment =
    loanAmount *
    (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  const totalFinanced = monthlyPayment * termMonths;
  const totalInterest = totalFinanced - loanAmount;

   return {
    loanAmount,
    monthlyPayment,
    biweeklyPayment: monthlyPayment / 2,
    totalInterest,
    totalFinanced
  };
}
